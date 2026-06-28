import { createHash } from "node:crypto"

import { chunkPages } from "./chunk"
import type { ExtractedPage } from "./extract"
import type { KnowledgeSourceManifest } from "./manifest"
import type {
  CurrentSourceVersion,
  KnowledgeVersionRepository,
} from "./source-repository"
import type { SharePointFile } from "./sharepoint"
import type { KnowledgeChunk } from "./chunk"

export interface SyncSourceInput {
  source: KnowledgeSourceManifest
  file: SharePointFile
  bytes: Uint8Array
}

export interface SyncSourceDependencies {
  repository: KnowledgeVersionRepository
  extract: (
    bytes: Uint8Array,
    fileName: string,
    mimeType?: string | null,
  ) => Promise<ExtractedPage[]>
  upload: (chunks: KnowledgeChunk[]) => Promise<void>
  deleteOlder: (sourceKey: string, keepVersionId: string) => Promise<number>
}

export type SyncSourceResult =
  | { status: "unchanged"; version: CurrentSourceVersion }
  | { status: "indexed"; chunkCount: number; deletedChunkCount: number }

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex")
}

export async function syncSource(
  input: SyncSourceInput,
  dependencies: SyncSourceDependencies,
): Promise<SyncSourceResult> {
  const contentHash = sha256(input.bytes)
  const sourceId = await dependencies.repository.upsertSource(input.source, input.file)
  const current = await dependencies.repository.currentVersion(input.source.sourceKey)
  if (current?.contentHash === contentHash) {
    return { status: "unchanged", version: current }
  }

  const pages = await dependencies.extract(input.bytes, input.file.name, input.file.mimeType)
  const versionId = await dependencies.repository.createVersion(
    sourceId,
    contentHash,
    input.source,
    input.file,
  )
  const chunks = chunkPages(pages, {
    sourceKey: input.source.sourceKey,
    sourceVersionId: versionId,
    versionHash: contentHash,
    title: input.source.title,
    accessTier: input.source.accessTier,
    authority: input.source.authority,
    jurisdiction: input.source.jurisdiction,
    temporalStatus: input.source.temporalStatus,
    canonicalUrl: input.source.canonicalUrl,
    effectiveFrom: input.source.effectiveFrom,
    effectiveTo: input.source.effectiveTo,
  })

  await dependencies.upload(chunks)
  const deletedChunkCount = await dependencies.deleteOlder(
    input.source.sourceKey,
    versionId,
  )
  await dependencies.repository.markVersionIndexed(sourceId, versionId, chunks.length)
  return { status: "indexed", chunkCount: chunks.length, deletedChunkCount }
}
