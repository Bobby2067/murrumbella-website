import manifestJson from "@/config/knowledge-sources.json"
import { z } from "zod"

const KnowledgeSourceSchema = z.object({
  sourceKey: z.string().min(1),
  sharePointPath: z.string().min(1),
  title: z.string().min(1),
  authority: z.enum([
    "legislation",
    "planning_instrument",
    "council",
    "title",
    "seller_verified",
  ]),
  accessTier: z.enum(["public", "registered", "qualified"]),
  jurisdiction: z.enum(["Murrumbella", "Yass Valley", "NSW", "Commonwealth"]),
  temporalStatus: z.enum(["current", "historical", "superseded"]),
  canonicalUrl: z.string().url().optional(),
  effectiveFrom: z.string().optional(),
  effectiveTo: z.string().optional(),
  reviewOwner: z.string().min(1),
  reviewIntervalDays: z.number().int().positive(),
  required: z.boolean(),
})

const ManifestSchema = z.object({
  version: z.number().int().positive(),
  scope: z.literal("Murrumbella and Yass Valley"),
  sources: z.array(KnowledgeSourceSchema).min(1),
})

export type KnowledgeSourceManifest = z.infer<typeof KnowledgeSourceSchema>

export function loadKnowledgeManifest(): KnowledgeSourceManifest[] {
  const parsed = ManifestSchema.parse(manifestJson)
  const keys = parsed.sources.map((source) => source.sourceKey)
  if (new Set(keys).size !== keys.length) {
    throw new Error("Knowledge manifest sourceKey values must be unique.")
  }
  const paths = parsed.sources.map((source) => source.sharePointPath.toLowerCase())
  if (new Set(paths).size !== paths.length) {
    throw new Error("Knowledge manifest sharePointPath values must be unique.")
  }
  return parsed.sources
}

export function sourceForSharePointPath(
  path: string,
  manifest = loadKnowledgeManifest(),
): KnowledgeSourceManifest | null {
  const normalised = path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "").toLowerCase()
  return (
    manifest.find((source) => {
      const candidate = source.sharePointPath.replace(/^\/+|\/+$/g, "").toLowerCase()
      return normalised === candidate || normalised.endsWith(`/${candidate}`)
    }) ?? null
  )
}
