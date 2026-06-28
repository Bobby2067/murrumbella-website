import { filterEvidenceForTier } from "./policy"
import { listApprovedClaims } from "./repository"
import type { AccessTier, Evidence } from "./types"
import { searchKnowledge } from "../knowledge/azure-search"

export interface RetrievalDependencies {
  listClaims?: (tier: AccessTier) => Promise<Evidence[]>
  search?: (query: string, tier: AccessTier) => Promise<Evidence[]>
}

export async function retrieveEvidence(
  query: string,
  tier: AccessTier,
  dependencies: RetrievalDependencies = {},
): Promise<Evidence[]> {
  const claimReader = dependencies.listClaims ?? listApprovedClaims
  const search = dependencies.search ?? searchKnowledge

  const [claims, searchResults] = await Promise.all([
    claimReader(tier).catch(() => []),
    search(query, tier).catch((error) => {
      console.error("Knowledge search failed:", error)
      return []
    }),
  ])

  const allowed = filterEvidenceForTier([...claims, ...searchResults], tier)
  const unique = new Map<string, Evidence>()
  for (const item of allowed) {
    if (!unique.has(item.id)) unique.set(item.id, item)
  }

  return [...unique.values()].slice(0, 12)
}
