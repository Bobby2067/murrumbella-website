import { NextResponse } from "next/server"

import {
  AgentServiceError,
  handleChatTurn,
} from "@/lib/agent/chat-service"
import { resolveConversationIdentity } from "@/lib/agent/identity"
import { FixedWindowRateLimiter, requestRateLimitKey } from "@/lib/agent/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const limiter = new FixedWindowRateLimiter(30, 60_000)

export async function POST(request: Request) {
  if (!limiter.take(requestRateLimitKey(request))) {
    return NextResponse.json(
      { error: "Too many questions just now. Please wait a moment and try again." },
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
    const result = await handleChatTurn(body, identity)
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
    console.error("Agent chat request failed:", error)
    return NextResponse.json(
      { error: "The Murrumbella Guide is temporarily unavailable." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
}
