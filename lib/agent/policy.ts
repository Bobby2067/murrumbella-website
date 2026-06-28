import type { AccessTier, ChatAnswer, Evidence } from "./types"

const TIER_RANK: Record<AccessTier, number> = {
  public: 0,
  registered: 1,
  qualified: 2,
}

const DEVELOPMENT_PROMISE =
  /(?:can|will|approved|entitled|eligible).{0,45}(?:build|dwelling|subdivid|lots?)/i

export function canAccessTier(buyerTier: AccessTier, evidenceTier: AccessTier): boolean {
  return TIER_RANK[buyerTier] >= TIER_RANK[evidenceTier]
}

export function filterEvidenceForTier(
  evidence: Evidence[],
  buyerTier: AccessTier,
): Evidence[] {
  return evidence.filter((item) => canAccessTier(buyerTier, item.accessTier))
}

export function validateAnswerPolicy(answer: ChatAnswer, evidence: Evidence[]): string[] {
  const failures: string[] = []

  if (DEVELOPMENT_PROMISE.test(answer.answer) && answer.citedEvidenceIds.length === 0) {
    failures.push("unsupported-development-claim")
  }

  const allowedEvidenceIds = new Set(evidence.map((item) => item.id))
  if (answer.citedEvidenceIds.some((id) => !allowedEvidenceIds.has(id))) {
    failures.push("invented-citation")
  }

  return failures
}

export function citationsForAnswer(answer: ChatAnswer, evidence: Evidence[]) {
  const citedIds = new Set(answer.citedEvidenceIds)
  return evidence
    .filter((item) => citedIds.has(item.id))
    .map(({ id, title, sourceUrl, page, clause, authority }) => ({
      id,
      title,
      sourceUrl,
      page,
      clause,
      authority,
    }))
}
