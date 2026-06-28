import { describe, expect, it } from "vitest"

import { tierFromMetadata } from "@/lib/agent/identity"

describe("tierFromMetadata", () => {
  it("defaults a signed-in buyer to registered", () => {
    expect(tierFromMetadata(undefined)).toBe("registered")
    expect(tierFromMetadata("unexpected")).toBe("registered")
  })

  it("accepts only the qualified upgrade", () => {
    expect(tierFromMetadata("qualified")).toBe("qualified")
    expect(tierFromMetadata("public")).toBe("registered")
  })
})
