import { createHash } from "node:crypto"

import type { AccessTier, Authority } from "@/lib/agent/types"
import type { ExtractedPage } from "./extract"

export interface ChunkMetadata {
  sourceKey: string
  sourceVersionId: string
  versionHash: string
  title: string
  accessTier: AccessTier
  authority: Authority
  jurisdiction: string
  temporalStatus: "current" | "historical" | "superseded"
  canonicalUrl?: string | null
  effectiveFrom?: string | null
  effectiveTo?: string | null
}

export interface KnowledgeChunk {
  id: string
  sourceKey: string
  sourceVersionId: string
  title: string
  text: string
  page: number | null
  clause: string | null
  accessTier: AccessTier
  authority: Authority
  jurisdiction: string
  temporalStatus: "current" | "historical" | "superseded"
  canonicalUrl: string | null
  effectiveFrom: string | null
  effectiveTo: string | null
}

export interface ChunkOptions {
  maxChars?: number
  overlapChars?: number
}

function stableChunkId(
  sourceKey: string,
  versionHash: string,
  page: number | null,
  ordinal: number,
): string {
  return createHash("sha256")
    .update(`${sourceKey}:${versionHash}:${page ?? "document"}:${ordinal}`)
    .digest("hex")
}

function findClause(text: string): string | null {
  const match = text.match(/\b(?:clause|section|part)\s+\d+(?:\.\d+)*(?:[A-Z])?/i)
  if (!match) return null
  return match[0].replace(/^\w/, (letter) => letter.toUpperCase())
}

function splitText(text: string, maxChars: number, overlapChars: number): string[] {
  if (text.length <= maxChars) return [text]
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = Math.min(start + maxChars, text.length)
    if (end < text.length) {
      const minimumBreak = start + Math.floor(maxChars * 0.65)
      const paragraphBreak = text.lastIndexOf("\n\n", end)
      const lineBreak = text.lastIndexOf("\n", end)
      const wordBreak = text.lastIndexOf(" ", end)
      const preferred = [paragraphBreak, lineBreak, wordBreak].find(
        (candidate) => candidate >= minimumBreak,
      )
      if (preferred !== undefined) end = preferred
    }

    const chunk = text.slice(start, end).trim()
    if (chunk) chunks.push(chunk)
    if (end >= text.length) break

    const nextStart = Math.max(0, end - overlapChars)
    start = nextStart > start ? nextStart : end
    while (start < text.length && /\s/.test(text[start])) start += 1
  }
  return chunks
}

export function chunkPages(
  pages: ExtractedPage[],
  metadata: ChunkMetadata,
  options: ChunkOptions = {},
): KnowledgeChunk[] {
  const maxChars = options.maxChars ?? 3500
  const overlapChars = options.overlapChars ?? 400
  if (maxChars < 500) throw new Error("maxChars must be at least 500.")
  if (overlapChars < 0 || overlapChars >= maxChars) {
    throw new Error("overlapChars must be non-negative and smaller than maxChars.")
  }

  const chunks: KnowledgeChunk[] = []
  for (const page of pages) {
    const text = page.text.trim()
    if (!text) continue
    for (const [ordinal, part] of splitText(text, maxChars, overlapChars).entries()) {
      chunks.push({
        id: stableChunkId(metadata.sourceKey, metadata.versionHash, page.page, ordinal),
        sourceKey: metadata.sourceKey,
        sourceVersionId: metadata.sourceVersionId,
        title: metadata.title,
        text: part,
        page: page.page,
        clause: findClause(part),
        accessTier: metadata.accessTier,
        authority: metadata.authority,
        jurisdiction: metadata.jurisdiction,
        temporalStatus: metadata.temporalStatus,
        canonicalUrl: metadata.canonicalUrl ?? null,
        effectiveFrom: metadata.effectiveFrom ?? null,
        effectiveTo: metadata.effectiveTo ?? null,
      })
    }
  }
  if (chunks.length === 0) throw new Error("Document has no extractable text to chunk.")
  return chunks
}
