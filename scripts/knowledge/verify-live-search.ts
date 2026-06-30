import { searchKnowledge } from "../../lib/knowledge/azure-search"

const checks = [
  {
    name: "current Yass planning instrument",
    query: "Yass Valley minimum subdivision lot size 40 hectares RU1",
    tier: "public" as const,
    expected: /Yass Valley Local Environmental Plan 2013/i,
  },
  {
    name: "OCR title instrument",
    query: "section 88B conveyancing act right of carriageway DP806324",
    tier: "qualified" as const,
    expected: /(Section 88B Instrument|Deposited Plan DP806324)/i,
  },
]

async function main() {
  for (const check of checks) {
    const results = await searchKnowledge(check.query, check.tier)
    const titles = results.map((item) => item.title)
    if (!titles.some((title) => check.expected.test(title))) {
      throw new Error(`${check.name} failed; returned: ${titles.join(", ") || "nothing"}`)
    }
    console.log(`${check.name}: ${titles.slice(0, 3).join(" | ")}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
