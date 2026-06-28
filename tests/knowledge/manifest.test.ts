import { describe, expect, it } from "vitest"

import { loadKnowledgeManifest } from "@/lib/knowledge/manifest"

describe("knowledge source manifest", () => {
  it("is unique, explicitly tiered and scoped to Murrumbella or Yass Valley", () => {
    const manifest = loadKnowledgeManifest()
    const keys = manifest.map((source) => source.sourceKey)

    expect(new Set(keys).size).toBe(keys.length)
    expect(manifest.every((source) => source.accessTier)).toBe(true)
    expect(manifest.every((source) => source.reviewOwner)).toBe(true)
    expect(manifest.every((source) => ["Murrumbella", "Yass Valley", "NSW", "Commonwealth"].includes(source.jurisdiction))).toBe(true)
  })

  it("includes the property certificate, current LEP and earlier local instruments", () => {
    const keys = loadKnowledgeManifest().map((source) => source.sourceKey)

    expect(keys).toContain("murrumbella-planning-certificate-10-7")
    expect(keys).toContain("yass-valley-lep-2013-current")
    expect(keys).toContain("yass-lep-1987-historical")
    expect(keys).toContain("gunning-lep-1997-historical")
    expect(keys).toContain("yarrowlumla-lep-2002-historical")
  })
})
