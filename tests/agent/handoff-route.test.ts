import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  handleHandoff: vi.fn(),
  resolveIdentity: vi.fn(async () => ({ clerkUserId: null, accessTier: "public" as const })),
}))

vi.mock("@/lib/agent/identity", () => ({
  resolveConversationIdentity: mocks.resolveIdentity,
}))

vi.mock("@/lib/agent/handoff-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/agent/handoff-service")>(
    "@/lib/agent/handoff-service",
  )
  return { ...actual, handleHandoff: mocks.handleHandoff }
})

import { POST } from "@/app/api/agent/handoff/route"

describe("POST /api/agent/handoff", () => {
  beforeEach(() => {
    mocks.handleHandoff.mockReset()
    mocks.handleHandoff.mockResolvedValue({ ok: true, handoffId: "handoff-1" })
  })

  it("records an explicitly consented request", async () => {
    const response = await POST(
      new Request("http://localhost/api/agent/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.3" },
        body: JSON.stringify({
          name: "Rob",
          email: "rob@example.com",
          consent: true,
        }),
      }),
    )
    expect(response.status).toBe(200)
    expect(mocks.handleHandoff).toHaveBeenCalled()
  })
})
