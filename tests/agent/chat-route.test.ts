import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  handleChatTurn: vi.fn(),
  resolveIdentity: vi.fn(async () => ({ clerkUserId: null, accessTier: "public" as const })),
}))

vi.mock("@/lib/agent/identity", () => ({
  resolveConversationIdentity: mocks.resolveIdentity,
}))

vi.mock("@/lib/agent/chat-service", async () => {
  const actual = await vi.importActual<typeof import("@/lib/agent/chat-service")>(
    "@/lib/agent/chat-service",
  )
  return { ...actual, handleChatTurn: mocks.handleChatTurn }
})

import { POST } from "@/app/api/agent/chat/route"

describe("POST /api/agent/chat", () => {
  beforeEach(() => {
    mocks.handleChatTurn.mockReset()
    mocks.handleChatTurn.mockResolvedValue({
      conversationId: "00000000-0000-4000-8000-000000000001",
      answer: "Welcome to Murrumbella.",
      citations: [],
      followUpQuestion: null,
      handoffSuggested: false,
    })
  })

  it("returns a chat result", async () => {
    const response = await POST(
      new Request("http://localhost/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.1" },
        body: JSON.stringify({ message: "Tell me about the property" }),
      }),
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      answer: "Welcome to Murrumbella.",
    })
  })

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "127.0.0.2" },
        body: "{",
      }),
    )
    expect(response.status).toBe(400)
  })
})
