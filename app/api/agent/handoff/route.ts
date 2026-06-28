import { NextResponse } from "next/server"

import { AgentServiceError } from "@/lib/agent/chat-service"
import { handleHandoff } from "@/lib/agent/handoff-service"
import { resolveConversationIdentity } from "@/lib/agent/identity"
import { FixedWindowRateLimiter, requestRateLimitKey } from "@/lib/agent/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const limiter = new FixedWindowRateLimiter(5, 10 * 60_000)

export async function POST(request: Request) {
  if (!limiter.take(requestRateLimitKey(request))) {
    return NextResponse.json(
      { error: "Too many contact requests. Please wait before trying again." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  try {
    const identity = await resolveConversationIdentity()
    const result = await handleHandoff(body, identity)
    return NextResponse.json(result, {
      status: 200,
      headers: { "Cache-Control": "private, no-store" },
    })
  } catch (error) {
    if (error instanceof AgentServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      )
    }
    console.error("Agent handoff request failed:", error)
    return NextResponse.json(
      { error: "Your contact request could not be saved just now." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
