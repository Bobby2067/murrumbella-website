import { randomUUID } from "node:crypto"

import { getDb } from "@/lib/db"

import type {
  AccessTier,
  ConversationIdentity,
  ConversationTurn,
  Evidence,
} from "./types"

export interface StoredConversation extends ConversationIdentity {
  id: string
  status: "active" | "closed" | "handed_off"
}

export interface AppendMessageInput {
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  citedEvidenceIds?: string[]
  retrievalIds?: string[]
}

export interface BuyerProfileInput {
  clerkUserId: string | null
  accessTier: AccessTier
  name: string
  email: string
  phone: string | null
  conversationSummary?: string | null
}

export interface ConsentInput {
  buyerProfileId: string
  conversationId: string | null
  purpose: string
  policyVersion: string
}

export interface CreateHandoffInput {
  buyerProfileId: string
  conversationId: string | null
  summary: string | null
}

const TIER_RANK: Record<AccessTier, number> = {
  public: 0,
  registered: 1,
  qualified: 2,
}

function value(row: Record<string, unknown>, key: string): string | null {
  const item = row[key]
  return typeof item === "string" ? item : null
}

function numberValue(row: Record<string, unknown>, key: string): number | null {
  const item = row[key]
  return typeof item === "number" ? item : null
}

function mapEvidenceRow(row: Record<string, unknown>): Evidence | null {
  const id = value(row, "evidence_id")
  const title = value(row, "title")
  const excerpt = value(row, "approved_wording")
  const accessTier = value(row, "access_tier")
  const authority = value(row, "authority")

  if (
    !id ||
    !title ||
    !excerpt ||
    !accessTier ||
    !["public", "registered", "qualified"].includes(accessTier) ||
    !authority ||
    !["legislation", "planning_instrument", "council", "title", "seller_verified"].includes(
      authority,
    )
  ) {
    return null
  }

  return {
    id,
    title,
    excerpt,
    sourceUrl: value(row, "canonical_url"),
    page: numberValue(row, "page"),
    clause: value(row, "clause"),
    accessTier: accessTier as AccessTier,
    authority: authority as Evidence["authority"],
  }
}

export async function listApprovedClaims(tier: AccessTier): Promise<Evidence[]> {
  const sql = getDb()
  if (!sql) return []

  try {
    const rows = await sql`
      select
        'claim:' || c.claim_key as evidence_id,
        c.approved_wording,
        s.title,
        s.canonical_url,
        s.access_tier,
        s.authority,
        cs.page,
        cs.clause
      from claims c
      join claim_sources cs on cs.claim_id = c.id
      join knowledge_sources s on s.id = cs.source_id
      where c.status = 'approved'
        and (c.review_due_at is null or c.review_due_at > now())
        and case s.access_tier
          when 'public' then 0
          when 'registered' then 1
          when 'qualified' then 2
          else 99
        end <= ${TIER_RANK[tier]}
      order by c.risk_level desc, c.claim_key, s.source_key
    `

    return rows
      .map((row) => mapEvidenceRow(row as Record<string, unknown>))
      .filter((item): item is Evidence => item !== null)
  } catch (error) {
    console.error("listApprovedClaims failed:", error)
    return []
  }
}

export async function createConversation(identity: ConversationIdentity): Promise<string> {
  const sql = getDb()
  if (!sql) return randomUUID()

  try {
    const rows = await sql`
      insert into conversations (clerk_user_id, access_tier)
      values (${identity.clerkUserId}, ${identity.accessTier})
      returning id
    `
    return String(rows[0].id)
  } catch (error) {
    console.error("createConversation failed:", error)
    return randomUUID()
  }
}

export async function getConversation(id: string): Promise<StoredConversation | null> {
  const sql = getDb()
  if (!sql) return null

  try {
    const rows = await sql`
      select id, clerk_user_id, access_tier, status
      from conversations
      where id = ${id}
      limit 1
    `
    if (rows.length === 0) return null
    const row = rows[0] as Record<string, unknown>
    const accessTier = value(row, "access_tier")
    const status = value(row, "status")
    if (
      !accessTier ||
      !["public", "registered", "qualified"].includes(accessTier) ||
      !status ||
      !["active", "closed", "handed_off"].includes(status)
    ) {
      return null
    }
    return {
      id: String(row.id),
      clerkUserId: value(row, "clerk_user_id"),
      accessTier: accessTier as AccessTier,
      status: status as StoredConversation["status"],
    }
  } catch (error) {
    console.error("getConversation failed:", error)
    return null
  }
}

export async function appendMessage(input: AppendMessageInput): Promise<string | null> {
  const sql = getDb()
  if (!sql) return null

  try {
    const rows = await sql`
      insert into messages (
        conversation_id, role, content, cited_evidence_ids, retrieval_ids
      ) values (
        ${input.conversationId},
        ${input.role},
        ${input.content},
        ${JSON.stringify(input.citedEvidenceIds ?? [])}::jsonb,
        ${JSON.stringify(input.retrievalIds ?? [])}::jsonb
      )
      returning id
    `
    await sql`
      update conversations
      set last_activity_at = now(), updated_at = now()
      where id = ${input.conversationId}
    `
    return String(rows[0].id)
  } catch (error) {
    console.error("appendMessage failed:", error)
    return null
  }
}

export async function listRecentMessages(
  conversationId: string,
  limit = 8,
): Promise<ConversationTurn[]> {
  const sql = getDb()
  if (!sql) return []

  try {
    const safeLimit = Math.max(1, Math.min(limit, 12))
    const rows = await sql`
      select role, content
      from messages
      where conversation_id = ${conversationId}
        and role in ('user', 'assistant')
        and (retained_with_consent = true or expires_at > now())
      order by created_at desc
      limit ${safeLimit}
    `
    return rows
      .map((row) => {
        const record = row as Record<string, unknown>
        const role = value(record, "role")
        const content = value(record, "content")
        if (!content || (role !== "user" && role !== "assistant")) return null
        return { role, content }
      })
      .filter((turn): turn is ConversationTurn => turn !== null)
      .reverse()
  } catch (error) {
    console.error("listRecentMessages failed:", error)
    return []
  }
}

export async function upsertBuyerProfile(input: BuyerProfileInput): Promise<string | null> {
  const sql = getDb()
  if (!sql) return null

  try {
    const existing = await sql`
      select id
      from buyer_profiles
      where (${input.clerkUserId}::text is not null and clerk_user_id = ${input.clerkUserId})
         or lower(email) = lower(${input.email})
      order by created_at asc
      limit 1
    `

    if (existing.length > 0) {
      const id = String(existing[0].id)
      await sql`
        update buyer_profiles
        set clerk_user_id = coalesce(${input.clerkUserId}, clerk_user_id),
            name = ${input.name},
            email = ${input.email},
            phone = ${input.phone},
            access_tier = ${input.accessTier},
            conversation_summary = coalesce(${input.conversationSummary ?? null}, conversation_summary),
            updated_at = now()
        where id = ${id}
      `
      return id
    }

    const inserted = await sql`
      insert into buyer_profiles (
        clerk_user_id, name, email, phone, access_tier, conversation_summary
      ) values (
        ${input.clerkUserId}, ${input.name}, ${input.email}, ${input.phone},
        ${input.accessTier}, ${input.conversationSummary ?? null}
      )
      returning id
    `
    return String(inserted[0].id)
  } catch (error) {
    console.error("upsertBuyerProfile failed:", error)
    return null
  }
}

export async function recordConsent(input: ConsentInput): Promise<string | null> {
  const sql = getDb()
  if (!sql) return null

  try {
    const rows = await sql`
      insert into consents (
        buyer_profile_id, conversation_id, purpose, policy_version, granted, granted_at
      ) values (
        ${input.buyerProfileId}, ${input.conversationId}, ${input.purpose},
        ${input.policyVersion}, true, now()
      )
      returning id
    `
    return String(rows[0].id)
  } catch (error) {
    console.error("recordConsent failed:", error)
    return null
  }
}

export async function createHandoff(input: CreateHandoffInput): Promise<string | null> {
  const sql = getDb()
  if (!sql) return null

  try {
    const rows = await sql`
      insert into handoffs (buyer_profile_id, conversation_id, reason, summary)
      values (${input.buyerProfileId}, ${input.conversationId}, 'buyer_requested_contact', ${input.summary})
      returning id
    `
    if (input.conversationId) {
      await sql`
        update conversations
        set status = 'handed_off', updated_at = now()
        where id = ${input.conversationId}
      `
    }
    return String(rows[0].id)
  } catch (error) {
    console.error("createHandoff failed:", error)
    return null
  }
}
