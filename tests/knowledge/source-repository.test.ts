import { beforeEach, describe, expect, it, vi } from "vitest"

const sql = vi.fn()

vi.mock("@/lib/db", () => ({
  getDb: () => sql,
}))

import { listKnowledgeFreshness } from "@/lib/knowledge/source-repository"

describe("knowledge freshness repository", () => {
  beforeEach(() => {
    sql.mockReset()
  })

  it("serialises Neon Date timestamps instead of reporting them as missing", async () => {
    sql.mockResolvedValue([
      {
        source_key: "yass-valley-lep-2013-current",
        title: "Yass Valley LEP 2013",
        temporal_status: "current",
        content_hash: "hash",
        indexed_at: new Date("2026-06-29T20:11:27.393Z"),
        review_due_at: new Date("2026-09-27T20:11:27.393Z"),
        last_error: null,
      },
    ])

    const rows = await listKnowledgeFreshness()

    expect(rows[0]?.indexedAt).toBe("2026-06-29T20:11:27.393Z")
    expect(rows[0]?.reviewDueAt).toBe("2026-09-27T20:11:27.393Z")
  })

  it("only reports ingestion errors newer than the latest successful index", async () => {
    sql.mockResolvedValue([])

    await listKnowledgeFreshness()

    const query = (sql.mock.calls[0]?.[0] as TemplateStringsArray).join(" ")
    expect(query).toContain("v.indexed_at is null or created_at > v.indexed_at")
  })
})
