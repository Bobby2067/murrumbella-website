import { z } from "zod"

import { AgentServiceError } from "./chat-service"
import {
  createHandoff,
  recordConsent,
  upsertBuyerProfile,
  type BuyerProfileInput,
  type ConsentInput,
  type CreateHandoffInput,
} from "./repository"
import type { ConversationIdentity } from "./types"

const HandoffSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).nullable().optional(),
  summary: z.string().trim().max(1000).nullable().optional(),
  consent: z.literal(true),
})

export interface HandoffDependencies {
  upsertBuyerProfile: (input: BuyerProfileInput) => Promise<string | null>
  recordConsent: (input: ConsentInput) => Promise<string | null>
  createHandoff: (input: CreateHandoffInput) => Promise<string | null>
}

const DEFAULT_DEPENDENCIES: HandoffDependencies = {
  upsertBuyerProfile,
  recordConsent,
  createHandoff,
}

export async function handleHandoff(
  body: unknown,
  identity: ConversationIdentity,
  dependencies: HandoffDependencies = DEFAULT_DEPENDENCIES,
) {
  const parsed = HandoffSchema.safeParse(body)
  if (!parsed.success) {
    throw new AgentServiceError(
      "Name, a valid email address, and explicit contact consent are required.",
      400,
    )
  }

  const buyerProfileId = await dependencies.upsertBuyerProfile({
    clerkUserId: identity.clerkUserId,
    accessTier: identity.accessTier,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone || null,
    conversationSummary: parsed.data.summary || null,
  })
  if (!buyerProfileId) {
    throw new AgentServiceError(
      "Your request could not be saved just now. Please contact the owner directly.",
      503,
    )
  }

  const conversationId = parsed.data.conversationId || null
  const consentId = await dependencies.recordConsent({
    buyerProfileId,
    conversationId,
    purpose: "human_contact",
    policyVersion: "2026-06-28",
  })
  if (!consentId) {
    throw new AgentServiceError(
      "Your contact consent could not be saved. Please contact the owner directly.",
      503,
    )
  }

  const handoffId = await dependencies.createHandoff({
    buyerProfileId,
    conversationId,
    summary: parsed.data.summary || null,
  })
  if (!handoffId) {
    throw new AgentServiceError(
      "Your contact request could not be saved. Please contact the owner directly.",
      503,
    )
  }

  return { ok: true as const, handoffId }
}
