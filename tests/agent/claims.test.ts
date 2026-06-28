import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

const riskyFiles = [
  "agent/02-murrumbella-agent-persona.md",
  "components/murrumbella/development-pathways.tsx",
  "components/murrumbella/investment-section.tsx",
  "components/murrumbella/the-river-section.tsx",
  "components/murrumbella/story-section.tsx",
  "components/murrumbella/estate-landing.tsx",
]

function combinedCopy() {
  return riskyFiles
    .map((file) => readFileSync(resolve(process.cwd(), file), "utf8"))
    .join("\n")
}

describe("property claim safety", () => {
  it("does not represent unverified approvals, lot yield, or water rights as facts", () => {
    const copy = combinedCopy()

    expect(copy).not.toMatch(/approved dwelling consent/i)
    expect(copy).not.toMatch(/already approved/i)
    expect(copy).not.toMatch(/subdivid(?:e|ed|ing)[^\n]{0,80}(?:four|4) (?:separate )?lots/i)
    expect(copy).not.toMatch(/riparian water rights/i)
    expect(copy).not.toMatch(/riparian rights for irrigation/i)
    expect(copy).not.toMatch(/potential tax benefits/i)
  })

  it("states the verified dwelling and subdivision position with its limits", () => {
    const copy = combinedCopy()

    expect(copy).toMatch(/dwelling is a permitted use[^\n]{0,120}subject to development consent/i)
    expect(copy).toMatch(/no dwelling approval is represented/i)
    expect(copy).toMatch(/40-hectare minimum lot size[^\n]{0,180}site-specific/i)
  })
})
