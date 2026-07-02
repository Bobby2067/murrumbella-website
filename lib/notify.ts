/** Owner email notifications via Resend's REST API (no SDK dependency).
 *  Guarded like lib/db.ts: if RESEND_API_KEY or NOTIFY_EMAIL is unset the
 *  call is a silent no-op, so the site never depends on email being up. */

const FROM = "Murrumbella <onboarding@resend.dev>"

export async function notifyOwner(
  subject: string,
  lines: Array<string | null | undefined>,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.NOTIFY_EMAIL
  if (!apiKey || !to) return

  const text = lines.filter(Boolean).join("\n")
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, text }),
    })
    if (!r.ok) {
      console.error("notifyOwner failed:", r.status, await r.text())
    }
  } catch (e) {
    console.error("notifyOwner failed:", e)
  }
}
