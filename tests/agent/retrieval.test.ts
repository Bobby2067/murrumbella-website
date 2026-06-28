import { describe, expect, it } from "vitest"

import { retrieveEvidence } from "@/lib/agent/retrieval"
import type { Evidence } from "@/lib/agent/types"

const publicItem: Evidence = {
  id: "public",
  title: "Public source",
  excerpt: "Public fact",
  sourceUrl: null,
  page: null,
  clause: null,
  accessTier: "public",
  authority: "seller_verified",
}
const privateItem: Evidence = {
  ...publicItem,
  id: "private",
  title: "Title search",
  accessTier: "qualified",
  authority: "title",
}

describe("retrieveEvidence", () => {
  it("defensively removes evidence above the buyer tier", async () => {
    const result = await retrieveEvidence("What is on title?", "public", {
      listClaims: async () => [publicItem, privateItem],
      search: async () => [privateItem],
    })
    expect(result).toEqual([publicItem])
  })

  it("deduplicates the same evidence identifier", async () => {
    const result = await retrieveEvidence("How large is it?", "public", {
      listClaims: async () => [publicItem],
      search: async () => [publicItem],
    })
    expect(result).toHaveLength(1)
  })
})
