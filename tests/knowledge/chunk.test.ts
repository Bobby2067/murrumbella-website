import { describe, expect, it } from "vitest"

import { chunkPages } from "@/lib/knowledge/chunk"

const metadata = {
  sourceKey: "yass-valley-lep-2013-current",
  sourceVersionId: "version-1",
  versionHash: "abc123",
  title: "Yass Valley LEP 2013",
  accessTier: "public" as const,
  authority: "planning_instrument" as const,
  jurisdiction: "Yass Valley",
  temporalStatus: "current" as const,
  canonicalUrl: "https://legislation.nsw.gov.au/example",
}

describe("knowledge chunking", () => {
  it("produces stable bounded IDs and keeps page anchors", () => {
    const pages = [{ page: 7, text: `Clause 4.1 Minimum subdivision lot size\n${"land ".repeat(1200)}` }]
    const first = chunkPages(pages, metadata)
    const second = chunkPages(pages, metadata)

    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(1)
    expect(first.every((chunk) => chunk.text.length <= 3500)).toBe(true)
    expect(first.every((chunk) => chunk.page === 7)).toBe(true)
    expect(first[0].clause).toBe("Clause 4.1")
  })

  it("changes IDs when the source version changes", () => {
    const pages = [{ page: 1, text: "Clause 1.1 Purpose\nThis instrument applies to land." }]
    const first = chunkPages(pages, metadata)
    const second = chunkPages(pages, { ...metadata, versionHash: "different" })

    expect(first[0].id).not.toBe(second[0].id)
  })

  it("rejects empty extracted documents", () => {
    expect(() => chunkPages([{ page: 1, text: "   " }], metadata)).toThrow(/no extractable text/i)
  })
})
