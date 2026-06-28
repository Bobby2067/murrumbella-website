import type { AccessTier, Authority, Evidence } from "@/lib/agent/types"

const API_VERSION = "2025-09-01"

export interface AzureSearchOptions {
  fetchImpl?: typeof fetch
  endpoint?: string
  indexName?: string
  apiKey?: string
  semanticConfiguration?: string
}

function accessFilter(tier: AccessTier): string {
  if (tier === "qualified") {
    return "accessTier eq 'public' or accessTier eq 'registered' or accessTier eq 'qualified'"
  }
  if (tier === "registered") {
    return "accessTier eq 'public' or accessTier eq 'registered'"
  }
  return "accessTier eq 'public'"
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

function evidenceFromSearchRow(row: Record<string, unknown>): Evidence | null {
  const id = stringOrNull(row.id)
  const title = stringOrNull(row.title)
  const excerpt = stringOrNull(row.text)
  const accessTier = stringOrNull(row.accessTier)
  const authority = stringOrNull(row.authority)

  if (
    !id ||
    !title ||
    !excerpt ||
    !accessTier ||
    !["public", "registered", "qualified"].includes(accessTier) ||
    !authority ||
    !["legislation", "planning_instrument", "council", "title", "seller_verified"].includes(
      authority,
    )
  ) {
    return null
  }

  const page = typeof row.page === "number" ? row.page : null
  const temporalStatus = stringOrNull(row.temporalStatus)

  return {
    id,
    title,
    excerpt,
    sourceUrl: stringOrNull(row.canonicalUrl),
    page,
    clause: stringOrNull(row.clause),
    accessTier: accessTier as AccessTier,
    authority: authority as Authority,
    effectiveFrom: stringOrNull(row.effectiveFrom),
    effectiveTo: stringOrNull(row.effectiveTo),
    temporalStatus:
      temporalStatus && ["current", "historical", "superseded"].includes(temporalStatus)
        ? (temporalStatus as Evidence["temporalStatus"])
        : undefined,
  }
}

export async function searchKnowledge(
  query: string,
  tier: AccessTier,
  options: AzureSearchOptions = {},
): Promise<Evidence[]> {
  const endpoint = options.endpoint ?? process.env.AZURE_SEARCH_ENDPOINT
  const indexName = options.indexName ?? process.env.AZURE_SEARCH_INDEX
  const apiKey = options.apiKey ?? process.env.AZURE_SEARCH_API_KEY
  const semanticConfiguration =
    options.semanticConfiguration ?? process.env.AZURE_SEARCH_SEMANTIC_CONFIG

  if (!endpoint || !indexName || !apiKey) return []

  const fetchImpl = options.fetchImpl ?? fetch
  const requestBody: Record<string, unknown> = {
    search: query,
    top: 8,
    filter: accessFilter(tier),
    select:
      "id,title,text,canonicalUrl,page,clause,accessTier,authority,effectiveFrom,effectiveTo,temporalStatus",
    queryType: semanticConfiguration ? "semantic" : "simple",
  }
  if (semanticConfiguration) {
    requestBody.semanticConfiguration = semanticConfiguration
  }

  const response = await fetchImpl(
    `${endpoint.replace(/\/$/, "")}/indexes/${encodeURIComponent(indexName)}/docs/search?api-version=${API_VERSION}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(8_000),
    },
  )

  if (!response.ok) {
    throw new Error(`Azure Search request failed with status ${response.status}.`)
  }

  const payload = (await response.json()) as { value?: unknown[] }
  if (!Array.isArray(payload.value)) return []

  return payload.value
    .map((row) =>
      row && typeof row === "object"
        ? evidenceFromSearchRow(row as Record<string, unknown>)
        : null,
    )
    .filter((item): item is Evidence => item !== null)
}
