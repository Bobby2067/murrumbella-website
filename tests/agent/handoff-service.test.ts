import { describe, expect, it, vi } from "vitest"

import { handleHandoff } from "@/lib/agent/handoff-service"
import type { BuyerProfileInput } from "@/lib/agent/repository"

function dependencies() {
  return {
    upsertBuyerProfile: vi.fn<
      (input: BuyerProfileInput) => Promise<string | null>
    >(async () => "00000000-0000-4000-8000-000000000001"),
    recordConsent: vi.fn(async () => "00000000-0000-4000-8000-000000000002"),
    createHandoff: vi.fn(async () => "00000000-0000-4000-8000-000000000003"),
  }
}

describe("handleHandoff", () => {
  it("requires explicit contact consent", async () => {
    await expect(
      handleHandoff(
        { name: "Rob", email: "rob@example.com", consent: false },
        { clerkUserId: null, accessTier: "public" },
        dependencies(),
      ),
    ).rejects.toMatchObject({ status: 400 })
  })

  it("stores buyer, consent, and handoff in order", async () => {
    const deps = dependencies()
    await expect(
      handleHandoff(
        {
          name: "Rob",
          email: "ROB@example.com",
          phone: "0400000000",
          summary: "Interested in conservation",
          consent: true,
        },
        { clerkUserId: "user_1", accessTier: "registered" },
        deps,
      ),
    ).resolves.toMatchObject({ ok: true })
    expect(deps.upsertBuyerProfile).toHaveBeenCalledWith(
      expect.objectContaining({ email: "rob@example.com" }),
    )
    expect(deps.recordConsent).toHaveBeenCalled()
    expect(deps.createHandoff).toHaveBeenCalled()
  })

  it("does not claim success when Neon did not save the buyer", async () => {
    const deps = dependencies()
    deps.upsertBuyerProfile.mockResolvedValue(null)
    await expect(
      handleHandoff(
        { name: "Rob", email: "rob@example.com", consent: true },
        { clerkUserId: null, accessTier: "public" },
        deps,
      ),
    ).rejects.toMatchObject({ status: 503 })
  })
})
