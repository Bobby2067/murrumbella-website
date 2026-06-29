import { getDb } from "@/lib/db"
import type { KnowledgeSourceManifest } from "./manifest"
import type { SharePointFile } from "./sharepoint"

export interface CurrentSourceVersion {
  id: string
  contentHash: string
}

export interface KnowledgeVersionRepository {
  upsertSource(source: KnowledgeSourceManifest, file: SharePointFile): Promise<string>
  currentVersion(sourceKey: string): Promise<CurrentSourceVersion | null>
  createVersion(
    sourceId: string,
    contentHash: string,
    source: KnowledgeSourceManifest,
    file: SharePointFile,
  ): Promise<string>
  markVersionIndexed(sourceId: string, versionId: string, chunkCount: number): Promise<void>
}

type Database = NonNullable<ReturnType<typeof getDb>>

function database(): Database {
  const sql = getDb()
  if (!sql) throw new Error("DATABASE_URL is required for knowledge ingestion.")
  return sql
}

function stringValue(row: Record<string, unknown>, key: string): string {
  const value = row[key]
  if (typeof value !== "string" || !value) throw new Error(`Database row is missing ${key}.`)
  return value
}

export const neonKnowledgeRepository: KnowledgeVersionRepository = {
  async upsertSource(source, file) {
    const sql = database()
    const rows = await sql`
      insert into knowledge_sources (
        source_key, title, authority, access_tier, jurisdiction, canonical_url,
        sharepoint_item_id, review_owner, review_due_at, updated_at
      ) values (
        ${source.sourceKey}, ${source.title}, ${source.authority}, ${source.accessTier},
        ${source.jurisdiction}, ${source.canonicalUrl ?? null}, ${file.id},
        ${source.reviewOwner}, now() + (${source.reviewIntervalDays} || ' days')::interval,
        now()
      )
      on conflict (source_key) do update set
        title = excluded.title,
        authority = excluded.authority,
        access_tier = excluded.access_tier,
        jurisdiction = excluded.jurisdiction,
        canonical_url = excluded.canonical_url,
        sharepoint_item_id = excluded.sharepoint_item_id,
        review_owner = excluded.review_owner,
        review_due_at = excluded.review_due_at,
        updated_at = now()
      returning id
    `
    return stringValue(rows[0] as Record<string, unknown>, "id")
  },

  async currentVersion(sourceKey) {
    const sql = database()
    const rows = await sql`
      select sv.id, sv.content_hash
      from source_versions sv
      join knowledge_sources s on s.id = sv.source_id
      where s.source_key = ${sourceKey}
      order by sv.created_at desc
      limit 1
    `
    if (rows.length === 0) return null
    const row = rows[0] as Record<string, unknown>
    return {
      id: stringValue(row, "id"),
      contentHash: stringValue(row, "content_hash"),
    }
  },

  async createVersion(sourceId, contentHash, source, file) {
    const sql = database()
    const rows = await sql`
      insert into source_versions (
        source_id, content_hash, sharepoint_etag, effective_from, effective_to,
        temporal_status
      ) values (
        ${sourceId}, ${contentHash}, ${file.eTag}, ${source.effectiveFrom ?? null},
        ${source.effectiveTo ?? null}, ${source.temporalStatus}
      )
      on conflict (source_id, content_hash) do update set
        sharepoint_etag = excluded.sharepoint_etag,
        effective_from = excluded.effective_from,
        effective_to = excluded.effective_to,
        temporal_status = excluded.temporal_status
      returning id
    `
    return stringValue(rows[0] as Record<string, unknown>, "id")
  },

  async markVersionIndexed(sourceId, versionId, chunkCount) {
    const sql = database()
    await sql`
      update source_versions
      set indexed_at = now(), chunk_count = ${chunkCount}
      where id = ${versionId} and source_id = ${sourceId}
    `
    await sql`
      update knowledge_sources
      set last_indexed_at = now(), updated_at = now()
      where id = ${sourceId}
    `
  },
}

export interface IngestionCounts {
  discovered: number
  changed: number
  indexed: number
  failed: number
}

export async function startIngestionRun(initiatedBy = "knowledge:sync"): Promise<string> {
  const sql = database()
  const rows = await sql`
    insert into ingestion_runs (initiated_by)
    values (${initiatedBy})
    returning id
  `
  return stringValue(rows[0] as Record<string, unknown>, "id")
}

export async function finishIngestionRun(
  runId: string,
  status: "succeeded" | "partial" | "failed",
  counts: IngestionCounts,
): Promise<void> {
  const sql = database()
  await sql`
    update ingestion_runs
    set status = ${status}, finished_at = now(),
        discovered_count = ${counts.discovered}, changed_count = ${counts.changed},
        indexed_count = ${counts.indexed}, failed_count = ${counts.failed}
    where id = ${runId}
  `
}

export async function recordIngestionFailure(input: {
  runId: string
  sourceKey: string
  sourceId?: string | null
  stage: string
  error: unknown
  retryable?: boolean
}): Promise<void> {
  const sql = database()
  const message = input.error instanceof Error ? input.error.message : "Unknown ingestion error."
  await sql`
    insert into ingestion_failures (
      ingestion_run_id, source_id, source_key, stage, error_message, retryable
    ) values (
      ${input.runId}, ${input.sourceId ?? null}, ${input.sourceKey}, ${input.stage},
      ${message.slice(0, 1000)}, ${input.retryable ?? false}
    )
  `
}

export interface FreshnessRow {
  sourceKey: string
  title: string
  temporalStatus: string | null
  contentHash: string | null
  indexedAt: string | null
  reviewDueAt: string | null
  lastError: string | null
}

export async function listKnowledgeFreshness(): Promise<FreshnessRow[]> {
  const sql = database()
  const rows = await sql`
    select
      s.source_key,
      s.title,
      v.temporal_status,
      v.content_hash,
      v.indexed_at,
      s.review_due_at,
      f.error_message as last_error
    from knowledge_sources s
    left join lateral (
      select temporal_status, content_hash, indexed_at
      from source_versions
      where source_id = s.id
      order by created_at desc
      limit 1
    ) v on true
    left join lateral (
      select error_message
      from ingestion_failures
      where (source_id = s.id or (source_id is null and source_key = s.source_key))
        and (v.indexed_at is null or created_at > v.indexed_at)
      order by created_at desc
      limit 1
    ) f on true
    order by s.source_key
  `
  return rows.map((item) => {
    const row = item as Record<string, unknown>
    const nullable = (key: string) => (typeof row[key] === "string" ? row[key] : null)
    const timestamp = (key: string) =>
      row[key] instanceof Date ? row[key].toISOString() : nullable(key)
    return {
      sourceKey: stringValue(row, "source_key"),
      title: stringValue(row, "title"),
      temporalStatus: nullable("temporal_status"),
      contentHash: nullable("content_hash"),
      indexedAt: timestamp("indexed_at"),
      reviewDueAt: timestamp("review_due_at"),
      lastError: nullable("last_error"),
    }
  })
}
