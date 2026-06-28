import { describe, expect, it } from "vitest"

import { clerkMiddlewareEnabled } from "@/lib/auth/middleware-mode"

describe("clerkMiddlewareEnabled", () => {
  it("bypasses Clerk when no server secret is configured", () => {
    expect(clerkMiddlewareEnabled(undefined)).toBe(false)
    expect(clerkMiddlewareEnabled("   ")).toBe(false)
  })

  it("enables Clerk when a server secret is configured", () => {
    expect(clerkMiddlewareEnabled("sk_test_example")).toBe(true)
  })
})
