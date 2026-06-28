import { afterEach, describe, expect, it, vi } from "vitest"

import {
  appendMessage,
  createHandoff,
  createConversation,
  getConversation,
  listApprovedClaims,
  listRecentMessages,
  recordConsent,
  upsertBuyerProfile,
} from "@/lib/agent/repository"

describe("agent repository without Neon configuration", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("returns an empty approved-claim set", async () => {
    vi.stubEnv("DATABASE_URL", "")
    await expect(listApprovedClaims("public")).resolves.toEqual([])
  })

  it("still creates a valid ephemeral conversation identifier", async () => {
    vi.stubEnv("DATABASE_URL", "")
    await expect(
      createConversation({ clerkUserId: null, accessTier: "public" }),
    ).resolves.toMatch(/^[0-9a-f-]{36}$/)
  })

  it("reports that a message was not persisted", async () => {
    vi.stubEnv("DATABASE_URL", "")
    await expect(
      appendMessage({
        conversationId: "00000000-0000-4000-8000-000000000000",
        role: "user",
        content: "Hello",
      }),
    ).resolves.toBeNull()
  })

  it("does not invent persisted buyer or handoff records", async () => {
    vi.stubEnv("DATABASE_URL", "")
    await expect(
      upsertBuyerProfile({
        clerkUserId: null,
        accessTier: "public",
        name: "Rob",
        email: "rob@example.com",
        phone: null,
      }),
    ).resolves.toBeNull()
    await expect(
      recordConsent({
        buyerProfileId: "00000000-0000-4000-8000-000000000000",
        conversationId: null,
        purpose: "human_contact",
        policyVersion: "2026-06-28",
      }),
    ).resolves.toBeNull()
    await expect(
      createHandoff({
        buyerProfileId: "00000000-0000-4000-8000-000000000000",
        conversationId: null,
        summary: "Interested buyer",
      }),
    ).resolves.toBeNull()
  })

  it("does not claim an ephemeral conversation is persisted", async () => {
    vi.stubEnv("DATABASE_URL", "")
    await expect(
      getConversation("00000000-0000-4000-8000-000000000000"),
    ).resolves.toBeNull()
  })

  it("returns no invented conversation history", async () => {
    vi.stubEnv("DATABASE_URL", "")
    await expect(
      listRecentMessages("00000000-0000-4000-8000-000000000000"),
    ).resolves.toEqual([])
  })
})
