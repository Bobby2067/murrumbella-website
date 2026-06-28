import { describe, expect, it, vi } from "vitest"

import { generateGroundedAnswer } from "@/lib/agent/model"
import type { Evidence } from "@/lib/agent/types"

const evidence: Evidence[] = [
  {
    id: "claim:dwelling",
    title: "Verified planning wording",
    excerpt: "A dwelling is permitted subject to development consent.",
    sourceUrl: "https://example.test",
    page: 1,
    clause: "Land Use Table",
    accessTier: "public",
    authority: "planning_instrument",
  },
]

describe("generateGroundedAnswer", () => {
  it("parses a structured, cited answer", async () => {
    const create = vi.fn(async () => ({
      output_text: JSON.stringify({
        answer: "A dwelling is permitted subject to development consent; approval is not guaranteed.",
        citedEvidenceIds: ["claim:dwelling"],
        followUpQuestion: "Would you like the planning pathway explained?",
        handoffSuggested: false,
      }),
    }))

    const result = await generateGroundedAnswer(
      { question: "Can I build?", evidence, tier: "public" },
      { responses: { create } },
    )

    expect(result.citedEvidenceIds).toEqual(["claim:dwelling"])
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ model: expect.any(String), store: false }),
    )
  })

  it("replaces an invented citation with a safe answer", async () => {
    const create = vi.fn(async () => ({
      output_text: JSON.stringify({
        answer: "You can definitely build.",
        citedEvidenceIds: ["invented"],
        followUpQuestion: null,
        handoffSuggested: false,
      }),
    }))

    const result = await generateGroundedAnswer(
      { question: "Can I build?", evidence, tier: "public" },
      { responses: { create } },
    )
    expect(result.citedEvidenceIds).toEqual([])
    expect(result.answer).toMatch(/verified evidence/i)
  })
})
