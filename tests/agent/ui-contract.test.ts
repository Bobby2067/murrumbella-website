import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

describe("sales agent UI contract", () => {
  it("discloses AI and provides accessible interaction states", () => {
    const source = readFileSync("components/murrumbella/sales-agent.tsx", "utf8")
    expect(source).toContain("AI property guide")
    expect(source).toContain('aria-label="Ask the Murrumbella Guide"')
    expect(source).toContain('aria-live="polite"')
    expect(source).toContain('role="dialog"')
  })

  it("uses the governed chat and handoff endpoints", () => {
    const source = readFileSync("components/murrumbella/sales-agent.tsx", "utf8")
    expect(source).toContain('/api/agent/chat')
    expect(source).toContain('/api/agent/handoff')
    expect(source).not.toContain("localStorage")
  })

  it("is mounted once on the property landing page", () => {
    const source = readFileSync("components/murrumbella/estate-landing.tsx", "utf8")
    expect(source.match(/<SalesAgent\s*\/>/g)).toHaveLength(1)
  })

  it("uses only the panel close control while open", () => {
    const css = readFileSync("components/murrumbella/sales-agent.module.css", "utf8")
    expect(css).toContain(
      '.shell[data-open="true"] .launcher {\n  display: none;\n}',
    )
  })
})
