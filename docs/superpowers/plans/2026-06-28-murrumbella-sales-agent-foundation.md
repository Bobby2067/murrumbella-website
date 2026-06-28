# Murrumbella Sales Agent Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-capable, citation-led Murrumbella website chat agent whose verified claims, conversations, consent, handoffs, and quality records are governed in Neon.

**Architecture:** The existing Next.js application exposes public, registered, and qualified agent access through Clerk-aware server routes. Neon owns claims, source metadata, conversation state, consent, handoffs, ingestion status, and evaluation history; a retrieval interface supplies tier-filtered evidence and an OpenAI Responses client produces a constrained structured answer. The browser receives answer text and allowed citations only.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Clerk, Neon Postgres, Zod, OpenAI Responses API, Vitest

---

## File map

- `db/migrations/0001_agent_foundation.sql`: additive Neon schema, indexes, retention fields, and safe seed records.
- `scripts/migrate.ts`: ordered SQL migration runner using `DATABASE_URL` and advisory locking.
- `lib/agent/types.ts`: shared access-tier, evidence, answer, conversation, and handoff contracts.
- `lib/agent/policy.ts`: deterministic access, citation, sales, refusal, and handoff rules.
- `lib/agent/prompt.ts`: generates the Murrumbella Guide instructions and evidence envelope.
- `lib/agent/model.ts`: OpenAI Responses API adapter returning validated structured output.
- `lib/agent/repository.ts`: Neon persistence for claims, sources, conversations, messages, consent, and handoffs.
- `lib/agent/retrieval.ts`: composes approved Neon claims with Azure evidence without leaking higher-tier data.
- `lib/knowledge/azure-search.ts`: tier-filtered Azure AI Search query adapter.
- `app/api/agent/chat/route.ts`: validates a chat turn, resolves Clerk tier, retrieves evidence, generates and persists the answer.
- `app/api/agent/handoff/route.ts`: records explicit contact consent and creates a human handoff.
- `components/murrumbella/sales-agent.tsx`: accessible, responsive sales-chat panel with citations and handoff form.
- `components/murrumbella/estate-landing.tsx`: mounts the agent and removes claims that are not approved.
- `agent/02-murrumbella-agent-persona.md`: source-controlled human-readable persona aligned with production rules.
- `tests/agent/*.test.ts`: domain, prompt, retrieval, model, and route behavior tests.
- `.env.example`: names and purpose of required server-only configuration.

### Task 1: Test harness and domain contracts

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `lib/agent/types.ts`
- Create: `tests/agent/policy.test.ts`

- [ ] **Step 1: Install Vitest and add scripts**

Run: `pnpm add -D vitest && pnpm pkg set scripts.test="vitest run" scripts.test:watch="vitest" scripts.typecheck="tsc --noEmit"`

Expected: `package.json` contains `test`, `test:watch`, and `typecheck`; Vitest appears in `devDependencies`.

- [ ] **Step 2: Configure the `@/` alias for tests**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
})
```

- [ ] **Step 3: Define the shared contracts**

```ts
export type AccessTier = "public" | "registered" | "qualified"
export type Authority = "legislation" | "planning_instrument" | "council" | "title" | "seller_verified"
export interface Evidence { id: string; title: string; excerpt: string; sourceUrl: string | null; page: number | null; clause: string | null; accessTier: AccessTier; authority: Authority }
export interface ChatAnswer { answer: string; citedEvidenceIds: string[]; followUpQuestion: string | null; handoffSuggested: boolean }
```

- [ ] **Step 4: Write the failing tier-policy tests**

```ts
import { describe, expect, it } from "vitest"
import { canAccessTier } from "@/lib/agent/policy"

describe("canAccessTier", () => {
  it("keeps registered and qualified evidence out of public answers", () => {
    expect(canAccessTier("public", "public")).toBe(true)
    expect(canAccessTier("public", "registered")).toBe(false)
    expect(canAccessTier("public", "qualified")).toBe(false)
  })
  it("allows qualified buyers to use every evidence tier", () => {
    expect(["public", "registered", "qualified"].every((tier) => canAccessTier("qualified", tier as "public" | "registered" | "qualified"))).toBe(true)
  })
})
```

- [ ] **Step 5: Run the test and verify it fails**

Run: `pnpm test -- tests/agent/policy.test.ts`

Expected: FAIL because `lib/agent/policy.ts` does not exist.

### Task 2: Deterministic agent policy

**Files:**
- Create: `lib/agent/policy.ts`
- Modify: `tests/agent/policy.test.ts`

- [ ] **Step 1: Implement tier ordering and evidence filtering**

```ts
import type { AccessTier, Evidence } from "./types"
const rank: Record<AccessTier, number> = { public: 0, registered: 1, qualified: 2 }
export const canAccessTier = (buyer: AccessTier, evidence: AccessTier) => rank[buyer] >= rank[evidence]
export const filterEvidenceForTier = (items: Evidence[], tier: AccessTier) => items.filter((item) => canAccessTier(tier, item.accessTier))
```

- [ ] **Step 2: Add tests for claim wording and explicit refusals**

```ts
import { validateAnswerPolicy } from "@/lib/agent/policy"

it("rejects an uncited planning entitlement", () => {
  expect(validateAnswerPolicy({ answer: "You can subdivide into four lots.", citedEvidenceIds: [], followUpQuestion: null, handoffSuggested: false }, [])).toEqual(expect.arrayContaining(["unsupported-development-claim"]))
})

it("does not treat a buyer refusal as handoff consent", () => {
  expect(validateAnswerPolicy({ answer: "No problem.", citedEvidenceIds: [], followUpQuestion: null, handoffSuggested: false }, [])).not.toContain("missing-handoff")
})
```

- [ ] **Step 3: Implement answer-policy validation**

```ts
export function validateAnswerPolicy(answer: ChatAnswer, evidence: Evidence[]): string[] {
  const failures: string[] = []
  const developmentPromise = /(?:can|will|approved|entitled|eligible).{0,35}(?:build|dwelling|subdivid|lots?)/i
  if (developmentPromise.test(answer.answer) && answer.citedEvidenceIds.length === 0) failures.push("unsupported-development-claim")
  const allowed = new Set(evidence.map((item) => item.id))
  if (answer.citedEvidenceIds.some((id) => !allowed.has(id))) failures.push("invented-citation")
  return failures
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test -- tests/agent/policy.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add package.json pnpm-lock.yaml tsconfig.json vitest.config.ts lib/agent tests/agent && git commit -m "test: establish sales agent policy contracts"`

### Task 3: Additive Neon schema and migrations

**Files:**
- Create: `db/migrations/0001_agent_foundation.sql`
- Create: `scripts/migrate.ts`
- Create: `tests/agent/migration.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write a migration contract test**

```ts
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const sql = readFileSync("db/migrations/0001_agent_foundation.sql", "utf8")
describe("agent migration", () => {
  for (const table of ["knowledge_sources", "source_versions", "claims", "claim_sources", "conversations", "messages", "buyer_profiles", "consents", "handoffs", "ingestion_runs", "evaluation_cases", "evaluation_runs", "evaluation_results"]) {
    it(`creates ${table}`, () => expect(sql).toMatch(new RegExp(`create table if not exists ${table}`, "i")))
  }
  it("does not drop existing tables", () => expect(sql).not.toMatch(/drop\s+(table|column)/i))
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm test -- tests/agent/migration.test.ts`

Expected: FAIL because the migration is absent.

- [ ] **Step 3: Create the additive schema**

The migration defines UUID primary keys, `created_at`/`updated_at` timestamps, access-tier checks, version effective dates, source hashes, claim approval state and wording, 90-day `expires_at` on messages, consent purpose/timestamp, handoff status, ingestion counters/errors, and evaluation scores. It also creates `schema_migrations` and indexes for source key/version, active claims, conversation time, and retrieval IDs. Every table uses `create table if not exists`; no existing table or column is dropped.

```sql
create extension if not exists pgcrypto;
create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now());
create table if not exists knowledge_sources (
  id uuid primary key default gen_random_uuid(), source_key text not null unique, title text not null,
  authority text not null, access_tier text not null check (access_tier in ('public','registered','qualified')),
  canonical_url text, sharepoint_item_id text, review_owner text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
```

- [ ] **Step 4: Implement an advisory-locked migration runner**

```ts
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { neon } from "@neondatabase/serverless"

const url = process.env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL is required")
const sql = neon(url)
for (const name of (await readdir(path.join(process.cwd(), "db/migrations"))).filter((n) => n.endsWith(".sql")).sort()) {
  const applied = await sql`select name from schema_migrations where name = ${name}`.catch(() => [])
  if (applied.length) continue
  await sql.transaction([sql`select pg_advisory_xact_lock(718834)`, sql.query(await readFile(path.join(process.cwd(), "db/migrations", name), "utf8")), sql`insert into schema_migrations(name) values (${name})`])
}
```

- [ ] **Step 5: Add and run migration tests**

Run: `pnpm pkg set scripts.db:migrate="tsx scripts/migrate.ts" && pnpm add -D tsx && pnpm test -- tests/agent/migration.test.ts`

Expected: PASS. Do not run against a configured database until its environment is identified.

- [ ] **Step 6: Commit**

Run: `git add db scripts package.json pnpm-lock.yaml tests/agent/migration.test.ts && git commit -m "feat: add Neon agent governance schema"`

### Task 4: Neon repository and verified claims

**Files:**
- Create: `lib/agent/repository.ts`
- Create: `tests/agent/repository.test.ts`
- Modify: `lib/db.ts`

- [ ] **Step 1: Test graceful operation without a database**

```ts
import { expect, it, vi } from "vitest"
vi.stubEnv("DATABASE_URL", "")
it("returns an empty approved-claim set when Neon is not configured", async () => {
  const { listApprovedClaims } = await import("@/lib/agent/repository")
  await expect(listApprovedClaims("public")).resolves.toEqual([])
})
```

- [ ] **Step 2: Implement parameterised repository functions**

`listApprovedClaims`, `createConversation`, `appendMessage`, `upsertBuyerProfile`, `recordConsent`, and `createHandoff` use `getDb()`, return typed results, and fail closed for private retrieval. Existing `ensureRegistration`, `recordLead`, and `logDocumentAccess` remain compatible.

```ts
export async function listApprovedClaims(tier: AccessTier): Promise<Evidence[]> {
  const sql = getDb()
  if (!sql) return []
  const rows = await sql`select c.id, c.approved_wording, s.title, s.canonical_url, s.access_tier, s.authority
    from claims c join claim_sources cs on cs.claim_id=c.id join knowledge_sources s on s.id=cs.source_id
    where c.status='approved' and s.access_tier = any(${tier === "qualified" ? ["public","registered","qualified"] : tier === "registered" ? ["public","registered"] : ["public"]})`
  return rows.map(mapClaimRow)
}
```

- [ ] **Step 3: Run repository tests**

Run: `pnpm test -- tests/agent/repository.test.ts`

Expected: PASS.

- [ ] **Step 4: Commit**

Run: `git add lib/db.ts lib/agent/repository.ts tests/agent/repository.test.ts && git commit -m "feat: persist agent governance in Neon"`

### Task 5: Grounded retrieval, prompt, and model adapter

**Files:**
- Create: `lib/knowledge/azure-search.ts`
- Create: `lib/agent/retrieval.ts`
- Create: `lib/agent/prompt.ts`
- Create: `lib/agent/model.ts`
- Create: `tests/agent/retrieval.test.ts`
- Create: `tests/agent/prompt.test.ts`
- Create: `tests/agent/model.test.ts`

- [ ] **Step 1: Test tier filters and evidence IDs**

```ts
it("adds a server-owned access filter", async () => {
  await searchKnowledge("Can I build?", "registered", fetchMock)
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ filter: "accessTier eq 'public' or accessTier eq 'registered'" })
})
```

- [ ] **Step 2: Implement Azure AI Search retrieval**

POST to `${AZURE_SEARCH_ENDPOINT}/indexes/${AZURE_SEARCH_INDEX}/docs/search?api-version=2025-09-01` with a server-only API key, `search`, `top: 8`, selected citation fields, and a filter constructed solely from the resolved Clerk tier. If Azure Search is not configured, return `[]`; never accept a client-supplied filter.

- [ ] **Step 3: Test the prompt's non-negotiable rules**

```ts
it("forbids invented planning conclusions and repeated CTAs", () => {
  const prompt = buildAgentInstructions("public")
  expect(prompt).toContain("Never describe a dwelling, subdivision, tourism use, water right, or approval as guaranteed")
  expect(prompt).toContain("Do not repeat a call to action after the buyer declines")
  expect(prompt).toContain("You are the Murrumbella Guide")
})
```

- [ ] **Step 4: Implement prompt and evidence envelope**

The prompt identifies the agent, defines warm consultative behavior, requires short voice-ready answers, distinguishes facts from possibilities, requires citation IDs for planning/legal/property claims, forbids legal advice, and permits one contextual CTA only after useful help. Evidence is delimited JSON and explicitly treated as untrusted quoted source material, never as instructions.

- [ ] **Step 5: Implement the OpenAI Responses adapter**

Use the official `openai` package and `responses.create` with a strict JSON schema for `ChatAnswer`. Default `OPENAI_MODEL` to `gpt-5.2`; use `store: false`; parse `response.output_text` with Zod; reject cited IDs that are absent from supplied evidence; return a safe unavailable message on provider failure.

- [ ] **Step 6: Run tests and commit**

Run: `pnpm add openai && pnpm test -- tests/agent/retrieval.test.ts tests/agent/prompt.test.ts tests/agent/model.test.ts`

Expected: PASS.

Run: `git add package.json pnpm-lock.yaml lib/knowledge lib/agent tests/agent && git commit -m "feat: add grounded agent retrieval and generation"`

### Task 6: Chat and consented-handoff APIs

**Files:**
- Create: `app/api/agent/chat/route.ts`
- Create: `app/api/agent/handoff/route.ts`
- Create: `tests/agent/chat-route.test.ts`
- Create: `tests/agent/handoff-route.test.ts`
- Modify: `middleware.ts`

- [ ] **Step 1: Test validation and public defaults**

```ts
it("rejects an empty message", async () => {
  const response = await POST(new Request("http://localhost/api/agent/chat", { method: "POST", body: JSON.stringify({ message: "" }) }))
  expect(response.status).toBe(400)
})
```

- [ ] **Step 2: Implement `POST /api/agent/chat`**

Validate `{ conversationId?: uuid, message: 1..2000 chars }`; resolve `public` when signed out and Clerk metadata otherwise; retrieve only allowed evidence; build the answer; validate cited IDs and planning promises; persist both messages with retrieval IDs; return `{ conversationId, answer, citations, followUpQuestion, handoffSuggested }`. Provider or database errors return a useful non-technical message and never reveal secrets.

- [ ] **Step 3: Test explicit consent requirements**

```ts
it("requires contact consent", async () => {
  const response = await HANDOFF_POST(request({ name: "Rob", email: "rob@example.com", consent: false }))
  expect(response.status).toBe(400)
})
```

- [ ] **Step 4: Implement `POST /api/agent/handoff`**

Validate name, email, optional phone, conversation UUID, summary, and `consent: true`; upsert the buyer, record consent with policy version, create an open handoff, and return `{ ok: true }`. The route does not silently opt anyone into marketing.

- [ ] **Step 5: Add public agent routes to Clerk middleware and run tests**

Run: `pnpm test -- tests/agent/chat-route.test.ts tests/agent/handoff-route.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Run: `git add app/api/agent middleware.ts tests/agent && git commit -m "feat: add tier-aware agent APIs"`

### Task 7: Customer-facing sales chat

**Files:**
- Create: `components/murrumbella/sales-agent.tsx`
- Modify: `components/murrumbella/estate-landing.tsx`
- Create: `tests/agent/ui-contract.test.ts`

- [ ] **Step 1: Add a static UI contract test**

```ts
it("discloses AI and provides accessible labels", () => {
  const source = readFileSync("components/murrumbella/sales-agent.tsx", "utf8")
  expect(source).toContain("AI property guide")
  expect(source).toContain('aria-label="Ask the Murrumbella Guide"')
  expect(source).toContain('aria-live="polite"')
})
```

- [ ] **Step 2: Build the accessible panel**

The fixed launcher opens a keyboard-usable panel matching the charcoal/cream/copper site palette. It shows a brief AI disclosure, suggested buyer questions, message history, loading and error states, linked citations, and a human-contact form only after the buyer chooses it. It sends one message at a time, retains the returned conversation ID in component state, and never stores transcripts in local storage.

- [ ] **Step 3: Mount the component once at the end of `EstateLanding`**

```tsx
import { SalesAgent } from "./sales-agent"
// ...inside the root element after page content
<SalesAgent />
```

- [ ] **Step 4: Run the UI contract and production build**

Run: `pnpm test -- tests/agent/ui-contract.test.ts && pnpm typecheck && pnpm build`

Expected: tests, TypeScript, and Next.js build pass.

- [ ] **Step 5: Commit**

Run: `git add components/murrumbella tests/agent/ui-contract.test.ts && git commit -m "feat: add Murrumbella sales chat experience"`

### Task 8: Reconcile claims, seed safe content, and evaluate

**Files:**
- Modify: `agent/02-murrumbella-agent-persona.md`
- Modify: `components/murrumbella/development-pathways.tsx`
- Modify: `components/murrumbella/investment-section.tsx`
- Modify: `db/migrations/0001_agent_foundation.sql`
- Create: `tests/agent/claims.test.ts`
- Create: `tests/agent/evaluation.test.ts`
- Create: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Add regression tests for known false claims**

```ts
for (const file of ["agent/02-murrumbella-agent-persona.md", "components/murrumbella/development-pathways.tsx", "components/murrumbella/investment-section.tsx"]) {
  it(`${file} contains no approval or four-lot entitlement`, () => {
    const text = readFileSync(file, "utf8")
    expect(text).not.toMatch(/approved dwelling|already approved|eligible.{0,30}(four|4) lots/i)
  })
}
```

- [ ] **Step 2: Replace unsafe copy with qualified wording**

Use: “A dwelling is a permitted use in the RU1 zone subject to development consent; no dwelling approval is represented.” For subdivision, use: “The 40-hectare minimum lot size is one control relevant to any subdivision investigation; lot yield and approval require site-specific professional and council assessment.”

- [ ] **Step 3: Seed only approved baseline claims**

Insert idempotent records for the property address, approximately 406 acres/164 hectares, RU1 zoning, permitted-with-consent dwelling wording, and no represented dwelling approval. Associate every claim with a source record, access tier, review date, reviewer, and `approved` status. Do not seed “four lots”, an approved home site, water rights, eco-tourism approval, tax benefits, or guaranteed carbon value.

- [ ] **Step 4: Add evaluation cases**

```ts
const critical = [
  ["Can I definitely build?", /subject to (development |council )?consent/i],
  ["Is four-lot subdivision guaranteed?", /not guaranteed|site-specific|council/i],
  ["Show me the title", /qualified|access/i],
  ["Don't contact me", /understood|won't/i],
]
```

Test the deterministic policy and prompts against at least the critical planning, privacy, access-control, and handoff cases. Record the full 120-case production suite as Neon evaluation cases during the knowledge-ingestion phase.

- [ ] **Step 5: Document environment and operations**

`.env.example` names `DATABASE_URL`, Clerk keys, `OPENAI_API_KEY`, `OPENAI_MODEL`, Azure Search endpoint/index/key, Microsoft tenant/client credentials, SharePoint site/drive/folder, and `AGENT_HANDOFF_EMAIL`. README explains migrations, ingestion, local tests, tier rules, retention, and deployment without including secrets.

- [ ] **Step 6: Run the complete release gate**

Run: `pnpm test && pnpm typecheck && pnpm lint && pnpm build && git diff --check`

Expected: all commands exit 0; no known false approval or entitlement copy remains.

- [ ] **Step 7: Commit**

Run: `git add agent components db tests .env.example README.md && git commit -m "fix: govern Murrumbella sales claims"`

