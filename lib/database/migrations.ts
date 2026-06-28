const ORDERED_MIGRATION = /^\d{4}_[a-z0-9][a-z0-9_-]*\.sql$/

export function pendingMigrationNames(
  fileNames: string[],
  appliedNames: ReadonlySet<string>,
): string[] {
  const sqlFiles = fileNames.filter((name) => name.endsWith(".sql"))

  for (const name of sqlFiles) {
    if (!ORDERED_MIGRATION.test(name)) {
      throw new Error(
        `Migration ${name} must use an ordered numeric prefix such as 0001_name.sql.`,
      )
    }
  }

  return sqlFiles.sort().filter((name) => !appliedNames.has(name))
}
