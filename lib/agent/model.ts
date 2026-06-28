import OpenAI from "openai"
import { z } from "zod"

import { validateAnswerPolicy } from "./policy"
import { buildAgentInstructions, buildEvidenceInput } from "./prompt"
import type { AccessTier, ChatAnswer, ConversationTurn, Evidence } from "./types"

const ChatAnswerSchema = z.object({
  answer: z.string().min(1).max(2400),
  citedEvidenceIds: z.array(z.string()).max(12),
  followUpQuestion: z.string().min(1).max(300).nullable(),
  handoffSuggested: z.boolean(),
})

interface ModelResponse {
  output_text: string
}

interface ModelClient {
  responses: {
    create: (input: Record<string, unknown>) => Promise<ModelResponse>
  }
}

export interface GenerateAnswerInput {
  question: string
  evidence: Evidence[]
  tier: AccessTier
  history?: ConversationTurn[]
}

const SAFE_UNAVAILABLE: ChatAnswer = {
  answer:
    "I don't have enough verified evidence to answer that safely yet. I can still help you identify the right document or person to confirm it.",
  citedEvidenceIds: [],
  followUpQuestion: "What would you most like confirmed?",
  handoffSuggested: false,
}

function configuredClient(): ModelClient | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey }) as unknown as ModelClient
}

export async function generateGroundedAnswer(
  input: GenerateAnswerInput,
  suppliedClient?: ModelClient,
): Promise<ChatAnswer> {
  const client = suppliedClient ?? configuredClient()
  if (!client) return SAFE_UNAVAILABLE

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: buildAgentInstructions(input.tier),
      input: buildEvidenceInput(input.question, input.evidence, input.history),
      store: false,
      max_output_tokens: 900,
      reasoning: { effort: "low" },
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "murrumbella_answer",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              answer: { type: "string" },
              citedEvidenceIds: { type: "array", items: { type: "string" } },
              followUpQuestion: { type: ["string", "null"] },
              handoffSuggested: { type: "boolean" },
            },
            required: [
              "answer",
              "citedEvidenceIds",
              "followUpQuestion",
              "handoffSuggested",
            ],
          },
        },
      },
    })

    const parsed = ChatAnswerSchema.parse(JSON.parse(response.output_text))
    const policyFailures = validateAnswerPolicy(parsed, input.evidence)
    if (policyFailures.length > 0) return SAFE_UNAVAILABLE
    return parsed
  } catch (error) {
    console.error("Agent generation failed:", error)
    return SAFE_UNAVAILABLE
  }
}
