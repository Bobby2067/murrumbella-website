import { describe, expect, it, vi } from "vitest"

import {
  createOrUpdateKnowledgeIndex,
  uploadChunks,
  type AzureAdminOptions,
} from "@/lib/knowledge/azure-admin"
import type { KnowledgeChunk } from "@/lib/knowledge/chunk"

const options: AzureAdminOptions = {
  endpoint: "https://example.search.windows.net",
  indexName: "murrumbella-knowledge",
  apiKey: "secret",
}

const chunk: KnowledgeChunk = {
  id: "chunk-1",
  sourceKey: "yass-valley-lep-2013-current",
  sourceVersionId: "version-1",
  title: "Yass Valley LEP 2013",
  text: "Clause 4.1 Minimum subdivision lot size",
  page: 18,
  clause: "Clause 4.1",
  accessTier: "public",
  authority: "planning_instrument",
  jurisdiction: "Yass Valley",
  temporalStatus: "current",
  canonicalUrl: "https://legislation.nsw.gov.au/example",
  effectiveFrom: null,
  effectiveTo: null,
}

describe("Azure knowledge indexing", () => {
  it("rejects uploads that omit mandatory access or temporal metadata", async () => {
    const fetchImpl = vi.fn<typeof fetch>()
    await expect(
      uploadChunks([{ ...chunk, accessTier: undefined } as never], {
        ...options,
        fetchImpl,
      }),
    ).rejects.toThrow(/accessTier/)
    await expect(
      uploadChunks([{ ...chunk, temporalStatus: undefined } as never], {
        ...options,
        fetchImpl,
      }),
    ).rejects.toThrow(/temporalStatus/)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it("creates a filterable access-controlled index schema", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 201 }))
    await createOrUpdateKnowledgeIndex({ ...options, fetchImpl })

    const request = fetchImpl.mock.calls[0]
    const body = JSON.parse(String(request[1]?.body)) as { fields: Array<Record<string, unknown>> }
    expect(String(request[0])).toContain("/indexes/murrumbella-knowledge")
    expect(body.fields).toContainEqual(
      expect.objectContaining({ name: "accessTier", filterable: true }),
    )
    expect(body.fields).toContainEqual(
      expect.objectContaining({ name: "temporalStatus", filterable: true }),
    )
  })

  it("uploads validated chunks and does not place secrets in the body", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ value: [{ key: "chunk-1", status: true }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    )

    await uploadChunks([chunk], { ...options, fetchImpl })

    const body = String(fetchImpl.mock.calls[0][1]?.body)
    expect(body).toContain('"@search.action":"mergeOrUpload"')
    expect(body).toContain('"accessTier":"public"')
    expect(body).not.toContain(options.apiKey)
  })

  it("surfaces per-document indexing failures without echoing document text", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          value: [{ key: "chunk-1", status: false, errorMessage: "bad field" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    )

    await expect(uploadChunks([chunk], { ...options, fetchImpl })).rejects.toThrow(/chunk-1/)
    await expect(uploadChunks([chunk], { ...options, fetchImpl })).rejects.not.toThrow(
      /Minimum subdivision lot size/,
    )
  })
})
