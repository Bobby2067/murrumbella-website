export type AccessTier = "public" | "registered" | "qualified"

export type Authority =
  | "legislation"
  | "planning_instrument"
  | "council"
  | "title"
  | "seller_verified"

export interface Evidence {
  id: string
  title: string
  excerpt: string
  sourceUrl: string | null
  page: number | null
  clause: string | null
  accessTier: AccessTier
  authority: Authority
  effectiveFrom?: string | null
  effectiveTo?: string | null
  temporalStatus?: "current" | "historical" | "superseded"
}

export interface ChatAnswer {
  answer: string
  citedEvidenceIds: string[]
  followUpQuestion: string | null
  handoffSuggested: boolean
}

export interface ChatCitation {
  id: string
  title: string
  sourceUrl: string | null
  page: number | null
  clause: string | null
  authority: Authority
}

export interface ConversationIdentity {
  clerkUserId: string | null
  accessTier: AccessTier
}

export interface ConversationTurn {
  role: "user" | "assistant"
  content: string
}

export interface HandoffInput {
  conversationId: string | null
  name: string
  email: string
  phone?: string | null
  summary?: string | null
  consent: true
}
