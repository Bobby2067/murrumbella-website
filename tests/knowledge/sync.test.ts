import { describe, expect, it, vi } from "vitest"

import { syncSource, type SyncSourceDependencies } from "@/lib/knowledge/sync"
import type { KnowledgeSourceManifest } from "@/lib/knowledge/manifest"
import type { SharePointFile } from "@/lib/knowledge/sharepoint"

const source: KnowledgeSourceManifest = {
  sourceKey: "yass-valley-lep-2013-current",
  sharePointPath: "_Knowledge/Yass Valley/Current/yass-valley-lep-2013.pdf",
  title: "Yass Valley LEP 2013",
  authority: "planning_instrument",
  accessTier: "public",
  jurisdiction: "Yass Valley",
  temporalStatus: "current",
  canonicalUrl: "https://legislation.nsw.gov.au/example",
  reviewOwner: "Planning adviser",
  reviewIntervalDays: 30,
  required: true,
}

const file: SharePointFile = {
  id: "item-1",
  name: "yass-valley-lep-2013.pdf",
  path: "General/Murrumbella/_Knowledge/Yass Valley/Current/yass-valley-lep-2013.pdf",
  size: 20,
  eTag: "etag",
  lastModifiedAt: "2026-06-28T00:00:00Z",
  mimeType: "application/pdf",
}

function dependencies(currentHash: string | null): SyncSourceDependencies {
  return {
    repository: {
      upsertSource: vi.fn().mockResolvedValue("source-id"),
      currentVersion: vi
        .fn()
        .mockResolvedValue(currentHash ? { id: "old-version", contentHash: currentHash } : null),
      createVersion: vi.fn().mockResolvedValue("new-version"),
      markVersionIndexed: vi.fn().mockResolvedValue(undefined),
    },
    extract: vi.fn().mockResolvedValue([{ page: 1, text: "Clause 4.1 Minimum lot size" }]),
    upload: vi.fn().mockResolvedValue(undefined),
    deleteOlder: vi.fn().mockResolvedValue(2),
  }
}

describe("knowledge source sync", () => {
  it("does not extract or upload an unchanged source", async () => {
    const bytes = new TextEncoder().encode("unchanged")
    const deps = dependencies("aaa8d3c8d74ad3e8f6b1772aa9c7e0eaa528cb42fc93599ce2f125b00d4c424c")

    const result = await syncSource({ source, file, bytes }, deps)

    expect(result.status).toBe("unchanged")
    expect(deps.extract).not.toHaveBeenCalled()
    expect(deps.upload).not.toHaveBeenCalled()
  })

  it("uploads a changed version before deleting older chunks", async () => {
    const deps = dependencies(null)
    const result = await syncSource(
      { source, file, bytes: new TextEncoder().encode("changed") },
      deps,
    )

    expect(result).toEqual({ status: "indexed", chunkCount: 1, deletedChunkCount: 2 })
    expect(deps.upload).toHaveBeenCalledWith([
      expect.objectContaining({
        sourceKey: source.sourceKey,
        sourceVersionId: "new-version",
        accessTier: "public",
        temporalStatus: "current",
      }),
    ])
    expect(vi.mocked(deps.upload).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(deps.deleteOlder).mock.invocationCallOrder[0],
    )
    expect(deps.repository.markVersionIndexed).toHaveBeenCalledWith(
      "source-id",
      "new-version",
      1,
    )
  })
})
