import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import { neon } from "@neondatabase/serverless"

import {
  pendingMigrationNames,
  splitSqlStatements,
} from "../lib/database/migrations"

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run database migrations.")
  }

  const migrationDirectory = path.join(process.cwd(), "db", "migrations")
  const sql = neon(databaseUrl)

  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `

  const appliedRows = await sql`select name from schema_migrations order by name`
  const appliedNames = new Set(appliedRows.map((row) => String(row.name)))
  const fileNames = await readdir(migrationDirectory)
  const pending = pendingMigrationNames(fileNames, appliedNames)

  for (const name of pending) {
    const migrationSql = await readFile(path.join(migrationDirectory, name), "utf8")
    const statements = splitSqlStatements(migrationSql)

    if (statements.length === 0) {
      throw new Error(`Migration ${name} does not contain any SQL statements.`)
    }

    await sql.transaction((transaction) => [
      transaction`select pg_advisory_xact_lock(718834)`,
      ...statements.map(
        (statement) => transaction`${transaction.unsafe(statement)}`,
      ),
      transaction`insert into schema_migrations (name) values (${name})`,
    ])

    console.log(`Applied ${name}`)
  }

  if (pending.length === 0) {
    console.log("Database schema is current.")
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Database migration failed.")
  process.exitCode = 1
})
