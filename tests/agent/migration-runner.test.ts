import { describe, expect, it } from "vitest"

import {
  pendingMigrationNames,
  splitSqlStatements,
} from "@/lib/database/migrations"

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

describe("splitSqlStatements", () => {
  it("splits a migration into one command per prepared statement", () => {
    expect(
      splitSqlStatements(`
        create table example (id integer);
        insert into example values (1);
      `),
    ).toEqual([
      "create table example (id integer)",
      "insert into example values (1)",
    ])
  })

  it("does not split semicolons inside quoted values, comments, or dollar blocks", () => {
    expect(
      splitSqlStatements(`
        insert into example values ('one;two', "three;four");
        -- keep this comment; with its statement
        do $body$ begin perform 'five;six'; end $body$;
        /* block; comment */ select 1;
      `),
    ).toEqual([
      `insert into example values ('one;two', "three;four")`,
      `-- keep this comment; with its statement\n        do $body$ begin perform 'five;six'; end $body$`,
      `/* block; comment */ select 1`,
    ])
  })
})
