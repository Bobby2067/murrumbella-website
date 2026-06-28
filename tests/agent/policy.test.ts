import { describe, expect, it } from "vitest"

import {
  canAccessTier,
  filterEvidenceForTier,
  validateAnswerPolicy,
} from "@/lib/agent/policy"
import type { ChatAnswer, Evidence } from "@/lib/agent/types"

const publicEvidence: Evidence = {
  id: "public-1",
  title: "Public source",
  excerpt: "A dwelling is permitted with development consent.",
  sourceUrl: "https://example.test/public",
  page: 1,
  clause: "Land Use Table",
  accessTier: "public",
  authority: "planning_instrument",
}

const qualifiedEvidence: Evidence = {
  ...publicEvidence,
  id: "qualified-1",
  title: "Qualified source",
  accessTier: "qualified",
}

describe("access policy", () => {
  it("keeps registered and qualified evidence out of public answers", () => {
    expect(canAccessTier("public", "public")).toBe(true)
    expect(canAccessTier("public", "registered")).toBe(false)
    expect(canAccessTier("public", "qualified")).toBe(false)
  })

  it("allows qualified buyers to use every evidence tier", () => {
    expect(
      (["public", "registered", "qualified"] as const).every((tier) =>
        canAccessTier("qualified", tier),
      ),
    ).toBe(true)
  })

  it("filters evidence using the buyer tier", () => {
    expect(filterEvidenceForTier([publicEvidence, qualifiedEvidence], "public")).toEqual([
      publicEvidence,
    ])
  })
})

describe("answer policy", () => {
  const answer = (overrides: Partial<ChatAnswer> = {}): ChatAnswer => ({
    answer: "The property is in Yass Valley.",
    citedEvidenceIds: [],
    followUpQuestion: null,
    handoffSuggested: false,
    ...overrides,
  })

  it("rejects an uncited planning entitlement", () => {
    expect(
      validateAnswerPolicy(
        answer({ answer: "You can subdivide into four lots." }),
        [publicEvidence],
      ),
    ).toContain("unsupported-development-claim")
  })

  it("rejects citations that were not supplied as evidence", () => {
    expect(
      validateAnswerPolicy(answer({ citedEvidenceIds: ["invented"] }), [publicEvidence]),
    ).toContain("invented-citation")
  })

  it("accepts a cautious, cited planning answer", () => {
    expect(
      validateAnswerPolicy(
        answer({
          answer: "A dwelling is permitted subject to development consent; approval is not guaranteed.",
          citedEvidenceIds: [publicEvidence.id],
        }),
        [publicEvidence],
      ),
    ).toEqual([])
  })
})
