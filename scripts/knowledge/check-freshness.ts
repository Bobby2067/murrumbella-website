import { loadKnowledgeManifest } from "../../lib/knowledge/manifest"
import { listKnowledgeFreshness } from "../../lib/knowledge/source-repository"

async function main() {
  const manifest = loadKnowledgeManifest()
  const rows = await listKnowledgeFreshness()
  const byKey = new Map(rows.map((row) => [row.sourceKey, row]))
  const now = Date.now()
  let unhealthy = 0

  const report = manifest.map((source) => {
    const row = byKey.get(source.sourceKey)
    const reviewDue = row?.reviewDueAt ? Date.parse(row.reviewDueAt) : Number.NaN
    const stale = source.temporalStatus === "current" && Number.isFinite(reviewDue) && reviewDue < now
    const missing = !row?.indexedAt
    const failedWithoutSuccess = Boolean(row?.lastError && !row.indexedAt)
    const blocking = (source.required && missing) || stale || failedWithoutSuccess
    if (blocking) unhealthy += 1
    return {
      source: source.sourceKey,
      status: blocking ? "ACTION" : missing ? "PENDING" : "OK",
      temporal: source.temporalStatus,
      indexed: row?.indexedAt ?? "never",
      reviewDue: row?.reviewDueAt ?? "not set",
      lastError: row?.lastError ?? "",
    }
  })

  console.table(report)
  if (unhealthy > 0) {
    console.error(`${unhealthy} required, stale or failed knowledge source(s) need attention.`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Freshness check failed.")
  process.exitCode = 1
})
