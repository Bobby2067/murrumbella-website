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

/** Insert a registration, but only once per Clerk user (best-effort).
 *  Returns true only when a NEW row was inserted, so callers can react
 *  (e.g. notify the owner) without firing on every repeat visit. */
export async function ensureRegistration(input: RegistrationInput): Promise<boolean> {
  try {
    const sql = getDb()
    if (input.clerkUserId) {
      // Single statement (not check-then-insert) so two concurrent first
      // visits can't both pass a separate existence check and double-insert.
      const rows = await sql`
        insert into registrations (clerk_user_id, name, email, phone, interest, message)
        select ${input.clerkUserId}, ${input.name ?? null}, ${input.email},
               ${input.phone ?? null}, ${input.interest ?? null}, ${input.message ?? null}
        where not exists (
          select 1 from registrations where clerk_user_id = ${input.clerkUserId}
        )
        returning id
      `
      return rows.length > 0
    }
    await sql`
      insert into registrations (clerk_user_id, name, email, phone, interest, message)
      values (${input.clerkUserId ?? null}, ${input.name ?? null}, ${input.email},
              ${input.phone ?? null}, ${input.interest ?? null}, ${input.message ?? null})
    `
    return true
  } catch (e) {
    console.error("ensureRegistration failed:", e)
    return false
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
