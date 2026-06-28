import { describe, expect, it } from "vitest"

import { FixedWindowRateLimiter } from "@/lib/agent/rate-limit"

describe("FixedWindowRateLimiter", () => {
  it("rejects requests above the configured limit", () => {
    const limiter = new FixedWindowRateLimiter(2, 60_000)
    expect(limiter.take("buyer", 1_000)).toBe(true)
    expect(limiter.take("buyer", 1_001)).toBe(true)
    expect(limiter.take("buyer", 1_002)).toBe(false)
  })

  it("opens a fresh window after expiry", () => {
    const limiter = new FixedWindowRateLimiter(1, 1_000)
    expect(limiter.take("buyer", 1_000)).toBe(true)
    expect(limiter.take("buyer", 1_500)).toBe(false)
    expect(limiter.take("buyer", 2_001)).toBe(true)
  })
})
