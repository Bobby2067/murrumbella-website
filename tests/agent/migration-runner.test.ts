import { describe, expect, it } from "vitest"

import { pendingMigrationNames } from "@/lib/database/migrations"

describe("pendingMigrationNames", () => {
  it("sorts SQL migrations and removes applied names", () => {
    expect(
      pendingMigrationNames(
        ["0002_second.sql", "notes.md", "0001_first.sql"],
        new Set(["0001_first.sql"]),
      ),
    ).toEqual(["0002_second.sql"])
  })

  it("rejects migration names without an ordered numeric prefix", () => {
    expect(() => pendingMigrationNames(["agent.sql"], new Set())).toThrow(
      /ordered numeric prefix/i,
    )
  })
})
