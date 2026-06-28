import { z } from "zod"

import { generateGroundedAnswer } from "./model"
import { citationsForAnswer } from "./policy"
import {
  appendMessage,
  createConversation,
  getConversation,
  listRecentMessages,
  type AppendMessageInput,
  type StoredConversation,
} from "./repository"
import { retrieveEvidence } from "./retrieval"
import type {
  AccessTier,
  ChatAnswer,
  ConversationIdentity,
  ConversationTurn,
  Evidence,
} from "./types"

const ChatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(2000),
})

export class AgentServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = "AgentServiceError"
  }
}

export interface ChatDependencies {
  createConversation: (identity: ConversationIdentity) => Promise<string>
  getConversation: (id: string) => Promise<StoredConversation | null>
  listRecentMessages: (id: string) => Promise<ConversationTurn[]>
  appendMessage: (input: AppendMessageInput) => Promise<string | null>
  retrieveEvidence: (query: string, tier: AccessTier) => Promise<Evidence[]>
  generateAnswer: (input: {
    question: string
    evidence: Evidence[]
    tier: AccessTier
    history?: ConversationTurn[]
  }) => Promise<ChatAnswer>
}

const DEFAULT_DEPENDENCIES: ChatDependencies = {
  createConversation,
  getConversation,
  listRecentMessages,
  appendMessage,
  retrieveEvidence,
  generateAnswer: generateGroundedAnswer,
}

export async function handleChatTurn(
  body: unknown,
  identity: ConversationIdentity,
  dependencies: ChatDependencies = DEFAULT_DEPENDENCIES,
) {
  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    throw new AgentServiceError("Enter a message between 1 and 2,000 characters.", 400)
  }

  let conversationId: string | null = null
  let history: ConversationTurn[] = []

  if (parsed.data.conversationId) {
    const existing = await dependencies.getConversation(parsed.data.conversationId)
    const canContinue =
      existing?.status === "active" &&
      existing.clerkUserId === identity.clerkUserId &&
      existing.accessTier === identity.accessTier

    if (canContinue && existing) {
      conversationId = existing.id
      history = await dependencies.listRecentMessages(existing.id)
    }
  }

  if (!conversationId) {
    conversationId = await dependencies.createConversation(identity)
  }

  const evidence = await dependencies.retrieveEvidence(
    parsed.data.message,
    identity.accessTier,
  )

  await dependencies.appendMessage({
    conversationId,
    role: "user",
    content: parsed.data.message,
    retrievalIds: evidence.map((item) => item.id),
  })

  const answer = await dependencies.generateAnswer({
    question: parsed.data.message,
    evidence,
    tier: identity.accessTier,
    history,
  })

  await dependencies.appendMessage({
    conversationId,
    role: "assistant",
    content: answer.answer,
    citedEvidenceIds: answer.citedEvidenceIds,
    retrievalIds: evidence.map((item) => item.id),
  })

  return {
    conversationId,
    answer: answer.answer,
    citations: citationsForAnswer(answer, evidence),
    followUpQuestion: answer.followUpQuestion,
    handoffSuggested: answer.handoffSuggested,
  }
}
