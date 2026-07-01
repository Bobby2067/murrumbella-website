import { neon } from "@neondatabase/serverless"

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "Database not configured. Set DATABASE_URL env var to enable registration and audit logging.",
    )
  }
  return neon(url)
}

export interface RegistrationInput {
  clerkUserId?: string | null
  name?: string | null
  email: string
  phone?: string | null
  interest?: string | null
  message?: string | null
}

/** Insert a registration, but only once per Clerk user (best-effort). */
export async function ensureRegistration(input: RegistrationInput): Promise<void> {
  try {
    const sql = getDb()
    if (input.clerkUserId) {
      const existing = await sql`select id from registrations where clerk_user_id = ${input.clerkUserId} limit 1`
      if (existing.length > 0) return
    }
    await sql`
      insert into registrations (clerk_user_id, name, email, phone, interest, message)
      values (${input.clerkUserId ?? null}, ${input.name ?? null}, ${input.email},
              ${input.phone ?? null}, ${input.interest ?? null}, ${input.message ?? null})
    `
  } catch (e) {
    console.error("ensureRegistration failed:", e)
  }
}

/** Always insert a lead (used by the public enquiry form). */
export async function recordLead(input: RegistrationInput): Promise<void> {
  try {
    const sql = getDb()
    await sql`
      insert into registrations (clerk_user_id, name, email, phone, interest, message)
      values (${input.clerkUserId ?? null}, ${input.name ?? null}, ${input.email},
              ${input.phone ?? null}, ${input.interest ?? null}, ${input.message ?? null})
    `
  } catch (e) {
    console.error("recordLead failed:", e)
  }
}

export async function logDocumentAccess(input: {
  clerkUserId?: string | null
  email?: string | null
  documentKey: string
}): Promise<void> {
  try {
    const sql = getDb()
    await sql`
      insert into document_access (clerk_user_id, email, document_key)
      values (${input.clerkUserId ?? null}, ${input.email ?? null}, ${input.documentKey})
    `
  } catch (e) {
    console.error("logDocumentAccess failed:", e)
  }
}
