import { afterEach, describe, expect, it, vi } from "vitest"

import { searchKnowledge } from "@/lib/knowledge/azure-search"

describe("searchKnowledge", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("returns no results when Azure Search is not configured", async () => {
    vi.stubEnv("AZURE_SEARCH_ENDPOINT", "")
    await expect(searchKnowledge("Can I build?", "public")).resolves.toEqual([])
  })

  it("adds a server-owned registered-tier filter", async () => {
    let observedInit: RequestInit | undefined
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      observedInit = init
      return new Response(
        JSON.stringify({
          value: [
            {
              id: "chunk-1",
              title: "Yass Valley LEP 2013",
              text: "Dwelling houses are permitted with consent.",
              canonicalUrl: "https://legislation.nsw.gov.au/lep",
              page: 12,
              clause: "Land Use Table",
              accessTier: "public",
              authority: "planning_instrument",
              temporalStatus: "current",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    })

    const result = await searchKnowledge("Can I build?", "registered", {
      fetchImpl: fetchMock,
      endpoint: "https://murrumbella.search.windows.net",
      indexName: "property-knowledge",
      apiKey: "secret",
    })

    const body = JSON.parse(String(observedInit?.body))
    expect(body.filter).toBe("accessTier eq 'public' or accessTier eq 'registered'")
    expect(new Headers(observedInit?.headers).get("api-key")).toBe("secret")
    expect(result[0]).toMatchObject({ id: "chunk-1", page: 12, accessTier: "public" })
  })

  it("never includes qualified evidence in a public query filter", async () => {
    let observedInit: RequestInit | undefined
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      observedInit = init
      return new Response(JSON.stringify({ value: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    })
    await searchKnowledge("Show title", "public", {
      fetchImpl: fetchMock,
      endpoint: "https://murrumbella.search.windows.net",
      indexName: "property-knowledge",
      apiKey: "secret",
    })
    const body = JSON.parse(String(observedInit?.body))
    expect(body.filter).toBe("accessTier eq 'public'")
    expect(body.filter).not.toContain("qualified")
  })
})
