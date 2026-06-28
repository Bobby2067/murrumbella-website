import type { KnowledgeChunk } from "./chunk"

const API_VERSION = "2025-09-01"
const MAX_BATCH_SIZE = 500

export interface AzureAdminOptions {
  fetchImpl?: typeof fetch
  endpoint?: string
  indexName?: string
  apiKey?: string
  semanticConfiguration?: string
}

interface ResolvedOptions {
  fetchImpl: typeof fetch
  endpoint: string
  indexName: string
  apiKey: string
  semanticConfiguration: string | null
}

function resolveOptions(options: AzureAdminOptions): ResolvedOptions {
  const endpoint = options.endpoint ?? process.env.AZURE_SEARCH_ENDPOINT
  const indexName = options.indexName ?? process.env.AZURE_SEARCH_INDEX
  const apiKey = options.apiKey ?? process.env.AZURE_SEARCH_API_KEY
  if (!endpoint) throw new Error("AZURE_SEARCH_ENDPOINT is required.")
  if (!indexName) throw new Error("AZURE_SEARCH_INDEX is required.")
  if (!apiKey) throw new Error("AZURE_SEARCH_API_KEY is required.")
  return {
    fetchImpl: options.fetchImpl ?? fetch,
    endpoint: endpoint.replace(/\/$/, ""),
    indexName,
    apiKey,
    semanticConfiguration:
      options.semanticConfiguration ?? process.env.AZURE_SEARCH_SEMANTIC_CONFIG ?? null,
  }
}

function headers(apiKey: string) {
  return { "Content-Type": "application/json", "api-key": apiKey }
}

function isTransient(status: number): boolean {
  return status === 408 || status === 429 || status >= 500
}

async function requestWithRetry(
  resolved: ResolvedOptions,
  url: string,
  init: RequestInit,
): Promise<Response> {
  let lastResponse: Response | null = null
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await resolved.fetchImpl(url, {
      ...init,
      signal: AbortSignal.timeout(30_000),
    })
    if (response.ok || !isTransient(response.status)) return response
    lastResponse = response
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 150 * 2 ** attempt))
    }
  }
  return lastResponse as Response
}

function validateChunk(chunk: KnowledgeChunk): void {
  const requiredStrings: Array<keyof KnowledgeChunk> = [
    "id",
    "sourceKey",
    "sourceVersionId",
    "title",
    "text",
    "accessTier",
    "authority",
    "jurisdiction",
    "temporalStatus",
  ]
  for (const field of requiredStrings) {
    if (typeof chunk[field] !== "string" || !String(chunk[field]).trim()) {
      throw new Error(`Knowledge chunk ${field} is required.`)
    }
  }
  if (!(["public", "registered", "qualified"] as const).includes(chunk.accessTier)) {
    throw new Error("Knowledge chunk accessTier is invalid.")
  }
  if (!(["current", "historical", "superseded"] as const).includes(chunk.temporalStatus)) {
    throw new Error("Knowledge chunk temporalStatus is invalid.")
  }
}

function chunksOf<T>(values: T[], size: number): T[][] {
  const batches: T[][] = []
  for (let index = 0; index < values.length; index += size) {
    batches.push(values.slice(index, index + size))
  }
  return batches
}

export async function createOrUpdateKnowledgeIndex(
  options: AzureAdminOptions = {},
): Promise<void> {
  const resolved = resolveOptions(options)
  const fields = [
    { name: "id", type: "Edm.String", key: true, filterable: true },
    { name: "sourceKey", type: "Edm.String", filterable: true, facetable: true },
    { name: "sourceVersionId", type: "Edm.String", filterable: true },
    { name: "title", type: "Edm.String", searchable: true, retrievable: true, analyzer: "en.lucene" },
    { name: "text", type: "Edm.String", searchable: true, retrievable: true, analyzer: "en.lucene" },
    { name: "page", type: "Edm.Int32", filterable: true, retrievable: true },
    { name: "clause", type: "Edm.String", searchable: true, filterable: true, retrievable: true },
    { name: "accessTier", type: "Edm.String", filterable: true, facetable: true },
    { name: "authority", type: "Edm.String", filterable: true, facetable: true },
    { name: "jurisdiction", type: "Edm.String", filterable: true, facetable: true },
    { name: "temporalStatus", type: "Edm.String", filterable: true, facetable: true },
    { name: "canonicalUrl", type: "Edm.String", filterable: false, retrievable: true },
    { name: "effectiveFrom", type: "Edm.DateTimeOffset", filterable: true, sortable: true },
    { name: "effectiveTo", type: "Edm.DateTimeOffset", filterable: true, sortable: true },
  ]
  const body: Record<string, unknown> = { name: resolved.indexName, fields }
  if (resolved.semanticConfiguration) {
    body.semantic = {
      configurations: [
        {
          name: resolved.semanticConfiguration,
          prioritizedFields: {
            titleField: { fieldName: "title" },
            prioritizedContentFields: [{ fieldName: "text" }],
            prioritizedKeywordsFields: [{ fieldName: "clause" }],
          },
        },
      ],
    }
  }

  const response = await requestWithRetry(
    resolved,
    `${resolved.endpoint}/indexes/${encodeURIComponent(resolved.indexName)}?api-version=${API_VERSION}`,
    { method: "PUT", headers: headers(resolved.apiKey), body: JSON.stringify(body) },
  )
  if (!response.ok) {
    throw new Error(`Azure Search index update failed with status ${response.status}.`)
  }
}

async function sendIndexActions(
  actions: Array<Record<string, unknown>>,
  resolved: ResolvedOptions,
): Promise<void> {
  const response = await requestWithRetry(
    resolved,
    `${resolved.endpoint}/indexes/${encodeURIComponent(resolved.indexName)}/docs/index?api-version=${API_VERSION}`,
    {
      method: "POST",
      headers: headers(resolved.apiKey),
      body: JSON.stringify({ value: actions }),
    },
  )
  if (!response.ok) {
    throw new Error(`Azure Search document batch failed with status ${response.status}.`)
  }
  const payload = (await response.json()) as {
    value?: Array<{ key?: unknown; status?: unknown; statusCode?: unknown }>
  }
  const failed = (payload.value ?? []).filter((result) => result.status !== true)
  if (failed.length > 0) {
    const keys = failed
      .map((result) => (typeof result.key === "string" ? result.key : "unknown"))
      .slice(0, 10)
      .join(", ")
    throw new Error(`Azure Search rejected ${failed.length} document(s): ${keys}.`)
  }
}

export async function uploadChunks(
  chunks: KnowledgeChunk[],
  options: AzureAdminOptions = {},
): Promise<void> {
  for (const chunk of chunks) validateChunk(chunk)
  const resolved = resolveOptions(options)
  for (const batch of chunksOf(chunks, MAX_BATCH_SIZE)) {
    await sendIndexActions(
      batch.map((chunk) => ({ "@search.action": "mergeOrUpload", ...chunk })),
      resolved,
    )
  }
}

function escapeOData(value: string): string {
  return value.replace(/'/g, "''")
}

export async function deleteOlderSourceChunks(
  sourceKey: string,
  keepVersionId: string,
  options: AzureAdminOptions = {},
): Promise<number> {
  const resolved = resolveOptions(options)
  const response = await requestWithRetry(
    resolved,
    `${resolved.endpoint}/indexes/${encodeURIComponent(resolved.indexName)}/docs/search?api-version=${API_VERSION}`,
    {
      method: "POST",
      headers: headers(resolved.apiKey),
      body: JSON.stringify({
        search: "*",
        filter: `sourceKey eq '${escapeOData(sourceKey)}' and sourceVersionId ne '${escapeOData(keepVersionId)}'`,
        select: "id",
        top: 1000,
      }),
    },
  )
  if (!response.ok) {
    throw new Error(`Azure Search old-version lookup failed with status ${response.status}.`)
  }
  const payload = (await response.json()) as { value?: Array<{ id?: unknown }> }
  const ids = (payload.value ?? [])
    .map((item) => (typeof item.id === "string" ? item.id : null))
    .filter((id): id is string => id !== null)
  for (const batch of chunksOf(ids, MAX_BATCH_SIZE)) {
    await sendIndexActions(
      batch.map((id) => ({ "@search.action": "delete", id })),
      resolved,
    )
  }
  return ids.length
}
