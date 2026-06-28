import { describe, expect, it, vi } from "vitest"

import { handleChatTurn } from "@/lib/agent/chat-service"
import type { StoredConversation } from "@/lib/agent/repository"
import type { Evidence } from "@/lib/agent/types"

const evidence: Evidence = {
  id: "claim:area",
  title: "Murrumbella property website",
  excerpt: "The property is approximately 406 acres.",
  sourceUrl: "/",
  page: null,
  clause: null,
  accessTier: "public",
  authority: "seller_verified",
}

function dependencies() {
  return {
    createConversation: vi.fn(async () => "00000000-0000-4000-8000-000000000001"),
    getConversation: vi.fn<(id: string) => Promise<StoredConversation | null>>(async () => null),
    listRecentMessages: vi.fn(async () => []),
    appendMessage: vi.fn(async () => "00000000-0000-4000-8000-000000000002"),
    retrieveEvidence: vi.fn(async () => [evidence]),
    generateAnswer: vi.fn(async () => ({
      answer: "The property is approximately 406 acres.",
      citedEvidenceIds: [evidence.id],
      followUpQuestion: "What would you like to use the land for?",
      handoffSuggested: false,
    })),
  }
}

describe("handleChatTurn", () => {
  it("rejects an empty buyer message", async () => {
    await expect(
      handleChatTurn({ message: "" }, { clerkUserId: null, accessTier: "public" }, dependencies()),
    ).rejects.toMatchObject({ status: 400 })
  })

  it("retrieves, answers, cites, and persists a public turn", async () => {
    const deps = dependencies()
    const result = await handleChatTurn(
      { message: "How large is it?" },
      { clerkUserId: null, accessTier: "public" },
      deps,
    )

    expect(deps.retrieveEvidence).toHaveBeenCalledWith("How large is it?", "public")
    expect(deps.generateAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ tier: "public", evidence: [evidence] }),
    )
    expect(deps.appendMessage).toHaveBeenCalledTimes(2)
    expect(result.citations).toEqual([
      expect.objectContaining({ id: evidence.id, title: evidence.title }),
    ])
  })

  it("does not continue a conversation owned by another signed-in user", async () => {
    const deps = dependencies()
    deps.getConversation.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000099",
      clerkUserId: "user_other",
      accessTier: "qualified",
      status: "active",
    })
    await handleChatTurn(
      {
        conversationId: "00000000-0000-4000-8000-000000000099",
        message: "Continue",
      },
      { clerkUserId: "user_current", accessTier: "registered" },
      deps,
    )
    expect(deps.createConversation).toHaveBeenCalled()
    expect(deps.listRecentMessages).not.toHaveBeenCalled()
  })
})
