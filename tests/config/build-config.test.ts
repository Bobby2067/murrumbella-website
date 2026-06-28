import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

const config = readFileSync(resolve(process.cwd(), "next.config.mjs"), "utf8")

describe("production build configuration", () => {
  it("does not suppress TypeScript build failures", () => {
    expect(config).not.toContain("ignoreBuildErrors: true")
  })

  it("traces from the repository instead of a parent lockfile", () => {
    expect(config).toContain("outputFileTracingRoot: process.cwd()")
  })
})
