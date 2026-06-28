import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

const migration = readFileSync(
  resolve(process.cwd(), "db/migrations/0002_agent_claims_and_evaluations.sql"),
  "utf8",
)

describe("critical sales-agent evaluations", () => {
  it.each([
    "build-approval",
    "four-lot-request",
    "water-rights",
    "historical-lep",
    "private-title-access",
    "retrieval-prompt-injection",
    "price-request",
    "handoff-consent",
  ])("seeds the %s case", (caseKey) => {
    expect(migration).toContain(`'${caseKey}'`)
  })

  it("marks planning, privacy and injection cases critical", () => {
    const criticalCount = (migration.match(/true\s*\)/g) ?? []).length
    expect(criticalCount).toBeGreaterThanOrEqual(6)
  })
})
