import { createOrUpdateKnowledgeIndex, deleteOlderSourceChunks, uploadChunks } from "../../lib/knowledge/azure-admin"
import { extractDocument } from "../../lib/knowledge/extract"
import { loadKnowledgeManifest, sourceForSharePointPath } from "../../lib/knowledge/manifest"
import {
  finishIngestionRun,
  neonKnowledgeRepository,
  recordIngestionFailure,
  startIngestionRun,
  type IngestionCounts,
} from "../../lib/knowledge/source-repository"
import {
  downloadSharePointFile,
  getGraphAccessToken,
  listSharePointFiles,
  type SharePointConfig,
} from "../../lib/knowledge/sharepoint"
import { syncSource } from "../../lib/knowledge/sync"

function environment(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required.`)
  return value
}

function sharePointConfig(): SharePointConfig {
  return {
    tenantId: environment("MICROSOFT_TENANT_ID"),
    clientId: environment("MICROSOFT_CLIENT_ID"),
    clientSecret: environment("MICROSOFT_CLIENT_SECRET"),
    driveId: environment("SHAREPOINT_DRIVE_ID"),
    folderPath: environment("SHAREPOINT_FOLDER_PATH"),
  }
}

async function main() {
  // Validate every destination before the first external write.
  environment("DATABASE_URL")
  environment("AZURE_SEARCH_ENDPOINT")
  environment("AZURE_SEARCH_INDEX")
  environment("AZURE_SEARCH_API_KEY")
  const config = sharePointConfig()
  const manifest = loadKnowledgeManifest()
  const accessToken = await getGraphAccessToken(fetch, config)
  const allFiles = await listSharePointFiles(fetch, config, accessToken)
  const approved = allFiles
    .map((file) => ({ file, source: sourceForSharePointPath(file.path, manifest) }))
    .filter(
      (entry): entry is { file: (typeof allFiles)[number]; source: (typeof manifest)[number] } =>
        entry.source !== null,
    )
  const discoveredKeys = new Set(approved.map((entry) => entry.source.sourceKey))
  const missingRequired = manifest.filter(
    (source) => source.required && !discoveredKeys.has(source.sourceKey),
  )
  const counts: IngestionCounts = {
    discovered: approved.length,
    changed: 0,
    indexed: 0,
    failed: 0,
  }

  const runId = await startIngestionRun()
  try {
    await createOrUpdateKnowledgeIndex()

    for (const missing of missingRequired) {
      counts.failed += 1
      await recordIngestionFailure({
        runId,
        sourceKey: missing.sourceKey,
        stage: "discover",
        error: new Error(`Required allowlisted source is missing at ${missing.sharePointPath}.`),
      })
    }

    for (const { file, source } of approved) {
      try {
        const bytes = await downloadSharePointFile(fetch, config.driveId, file.id, accessToken)
        const result = await syncSource(
          { source, file, bytes },
          {
            repository: neonKnowledgeRepository,
            extract: extractDocument,
            upload: (chunks) => uploadChunks(chunks),
            deleteOlder: (sourceKey, versionId) =>
              deleteOlderSourceChunks(sourceKey, versionId),
          },
        )
        if (result.status === "indexed") {
          counts.changed += 1
          counts.indexed += 1
        }
      } catch (error) {
        counts.failed += 1
        await recordIngestionFailure({
          runId,
          sourceKey: source.sourceKey,
          stage: "source-sync",
          error,
          retryable: error instanceof TypeError,
        })
      }
    }

    const status = counts.failed === 0 ? "succeeded" : counts.indexed > 0 ? "partial" : "failed"
    await finishIngestionRun(runId, status, counts)
    console.log(
      `Knowledge sync ${status}: ${counts.discovered} discovered, ${counts.indexed} indexed, ${counts.failed} failed.`,
    )
    if (counts.failed > 0) process.exitCode = 1
  } catch (error) {
    counts.failed += 1
    await recordIngestionFailure({
      runId,
      sourceKey: "knowledge-system",
      stage: "run",
      error,
      retryable: error instanceof TypeError,
    })
    await finishIngestionRun(runId, "failed", counts)
    throw error
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Knowledge sync failed.")
  process.exitCode = 1
})
