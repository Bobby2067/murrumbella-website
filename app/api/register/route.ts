import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { recordLead } from "@/lib/db"
import { notifyOwner } from "@/lib/notify"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  let body: {
    name?: string
    email?: string
    phone?: string
    interest?: string
    message?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  if (!body.email || !body.email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
  }

  const { userId } = await auth()

  await recordLead({
    clerkUserId: userId ?? null,
    name: body.name ?? null,
    email: body.email,
    phone: body.phone ?? null,
    interest: body.interest ?? null,
    message: body.message ?? null,
  })

  await notifyOwner("Murrumbella — new enquiry", [
    `Name: ${body.name || "(not given)"}`,
    `Email: ${body.email}`,
    body.phone ? `Phone: ${body.phone}` : null,
    body.interest ? `Interest: ${body.interest}` : null,
    body.message ? `Message: ${body.message}` : null,
  ])

  return NextResponse.json({ ok: true })
}
