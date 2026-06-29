const ORDERED_MIGRATION = /^\d{4}_[a-z0-9][a-z0-9_-]*\.sql$/

type SqlScanMode =
  | "normal"
  | "single-quote"
  | "double-quote"
  | "line-comment"
  | "block-comment"
  | "dollar-quote"

export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = []
  let statementStart = 0
  let mode: SqlScanMode = "normal"
  let blockCommentDepth = 0
  let dollarTag = ""

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index]
    const nextCharacter = sql[index + 1]

    if (mode === "single-quote") {
      if (character === "\\") {
        index += 1
      } else if (character === "'" && nextCharacter === "'") {
        index += 1
      } else if (character === "'") {
        mode = "normal"
      }
      continue
    }

    if (mode === "double-quote") {
      if (character === '"' && nextCharacter === '"') {
        index += 1
      } else if (character === '"') {
        mode = "normal"
      }
      continue
    }

    if (mode === "line-comment") {
      if (character === "\n") {
        mode = "normal"
      }
      continue
    }

    if (mode === "block-comment") {
      if (character === "/" && nextCharacter === "*") {
        blockCommentDepth += 1
        index += 1
      } else if (character === "*" && nextCharacter === "/") {
        blockCommentDepth -= 1
        index += 1
        if (blockCommentDepth === 0) {
          mode = "normal"
        }
      }
      continue
    }

    if (mode === "dollar-quote") {
      if (sql.startsWith(dollarTag, index)) {
        index += dollarTag.length - 1
        mode = "normal"
      }
      continue
    }

    if (character === "'") {
      mode = "single-quote"
    } else if (character === '"') {
      mode = "double-quote"
    } else if (character === "-" && nextCharacter === "-") {
      mode = "line-comment"
      index += 1
    } else if (character === "/" && nextCharacter === "*") {
      mode = "block-comment"
      blockCommentDepth = 1
      index += 1
    } else if (character === "$") {
      const tag = sql.slice(index).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0]
      if (tag) {
        dollarTag = tag
        mode = "dollar-quote"
        index += tag.length - 1
      }
    } else if (character === ";") {
      const statement = sql.slice(statementStart, index).trim()
      if (statement) {
        statements.push(statement)
      }
      statementStart = index + 1
    }
  }

  const finalStatement = sql.slice(statementStart).trim()
  if (finalStatement) {
    statements.push(finalStatement)
  }

  return statements
}

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
