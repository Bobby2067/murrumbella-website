import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

const migrationPath = "db/migrations/0001_agent_foundation.sql"

describe("agent foundation migration", () => {
  const tables = [
    "knowledge_sources",
    "source_versions",
    "claims",
    "claim_sources",
    "citations",
    "ingestion_runs",
    "ingestion_failures",
    "conversations",
    "messages",
    "buyer_profiles",
    "consents",
    "handoffs",
    "evaluation_cases",
    "evaluation_runs",
    "evaluation_results",
  ]

  for (const table of tables) {
    it(`creates ${table}`, () => {
      const sql = readFileSync(migrationPath, "utf8")
      expect(sql).toMatch(new RegExp(`create table if not exists ${table}`, "i"))
    })
  }

  it("is additive and leaves existing tables intact", () => {
    const sql = readFileSync(migrationPath, "utf8")
    expect(sql).not.toMatch(/drop\s+(table|column)/i)
  })

  it("expires ordinary messages after 90 days", () => {
    const sql = readFileSync(migrationPath, "utf8")
    expect(sql).toMatch(/expires_at[\s\S]+interval '90 days'/i)
  })

  it("seeds the cautious dwelling wording and no four-lot promise", () => {
    const sql = readFileSync(migrationPath, "utf8")
    expect(sql).toContain("subject to development consent")
    expect(sql).not.toMatch(/eligible.{0,30}(four|4) lots/i)
  })
})
