# Murrumbella Knowledge Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronise the authorised Murrumbella SharePoint corpus into a tier-labelled Azure AI Search index while storing source versions, hashes, ingestion health, and review state in Neon.

**Architecture:** A controlled Node.js command uses Microsoft Graph application credentials to enumerate the configured SharePoint folder, download supported files, extract and chunk text, and push replaceable search documents to Azure AI Search. Neon records the canonical source and every observed version; the original files remain in SharePoint and are never copied into Neon.

**Tech Stack:** TypeScript, Microsoft Graph REST v1.0, Azure AI Search REST API, Neon Postgres, PDF extraction, Vitest

---

## File map

- `lib/knowledge/sharepoint.ts`: Graph token, folder listing, pagination, and file download.
- `lib/knowledge/extract.ts`: PDF, text, HTML, and Word text extraction with page anchors where available.
- `lib/knowledge/chunk.ts`: heading/page-aware chunks with stable IDs and overlap.
- `lib/knowledge/azure-admin.ts`: create/update index schema and batch document uploads/deletes.
- `lib/knowledge/source-repository.ts`: source version, hash, run, failure, and freshness writes in Neon.
- `scripts/knowledge/sync-sharepoint.ts`: orchestrated idempotent sync command.
- `scripts/knowledge/check-freshness.ts`: non-mutating stale/failed-source report.
- `config/knowledge-sources.json`: explicit corpus allowlist, tier, authority, jurisdiction, and historical/current classification.
- `tests/knowledge/*.test.ts`: Graph pagination, chunk stability, tier metadata, and idempotency tests.

### Task 1: Corpus manifest and Graph client

**Files:**
- Create: `config/knowledge-sources.json`
- Create: `lib/knowledge/sharepoint.ts`
- Create: `tests/knowledge/sharepoint.test.ts`

- [ ] **Step 1: Create an explicit allowlist manifest**

The manifest includes `sourceKey`, SharePoint path, title, `authority`, `accessTier`, jurisdiction, `temporalStatus`, and review owner. Initial entries cover public current NSW/Commonwealth law relevant to Murrumbella, current Yass Valley instruments, historical Yass Valley LEP 2013 versions, Yass LEP 1987, Gunning LEP 1997, Yarrowlumla LEP 2002, public council material, the registered planning certificate, and qualified title/plan/88B files.

- [ ] **Step 2: Test Graph pagination and path encoding**

```ts
it("follows @odata.nextLink and preserves ampersands in folder names", async () => {
  const items = await listSharePointFiles(fakeFetch, env)
  expect(items.map((item) => item.name)).toEqual(["a.pdf", "b.pdf"])
  expect(fakeFetch.mock.calls[0][0]).toContain("Murrumbella%20-%20Property%20Dossier%20%26%20IM")
})
```

- [ ] **Step 3: Implement least-privilege Graph access**

Request a client-credentials token from the configured Microsoft tenant with `https://graph.microsoft.com/.default`; enumerate `/drives/{drive-id}/root:/{folder-path}:/children`; follow `@odata.nextLink`; recurse only inside the configured folder; and download file content from `/drives/{drive-id}/items/{item-id}/content`. Reject items outside the manifest.

- [ ] **Step 4: Run tests and commit**

Run: `pnpm test -- tests/knowledge/sharepoint.test.ts`

Expected: PASS.

Run: `git add config lib/knowledge/sharepoint.ts tests/knowledge && git commit -m "feat: add controlled SharePoint corpus client"`

### Task 2: Extraction and stable chunking

**Files:**
- Create: `lib/knowledge/extract.ts`
- Create: `lib/knowledge/chunk.ts`
- Create: `tests/knowledge/chunk.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Test stable, bounded chunks**

```ts
it("produces stable IDs and keeps page anchors", () => {
  const first = chunkPages("yass-lep-2013", [{ page: 1, text: "Clause 4.1 " + "land ".repeat(500) }])
  const second = chunkPages("yass-lep-2013", [{ page: 1, text: "Clause 4.1 " + "land ".repeat(500) }])
  expect(first).toEqual(second)
  expect(first.every((chunk) => chunk.text.length <= 6000 && chunk.page === 1)).toBe(true)
})
```

- [ ] **Step 2: Implement extraction**

Extract text from PDF page-by-page and from UTF-8 text/HTML/Word formats supported by the selected libraries. Normalise whitespace without removing clause numbers. Unsupported or image-only files create an ingestion failure requiring OCR/review; they are never marked successfully indexed with empty content.

- [ ] **Step 3: Implement chunking**

Create approximately 3,500-character chunks with 400-character overlap, preferring page and heading boundaries. Stable chunk IDs are SHA-256 of `sourceKey:versionHash:page:ordinal`; metadata carries source/version IDs, title, page, clause when detected, access tier, authority, effective dates, temporal status, and canonical URL.

- [ ] **Step 4: Run tests and commit**

Run: `pnpm test -- tests/knowledge/chunk.test.ts`

Expected: PASS.

Run: `git add package.json pnpm-lock.yaml lib/knowledge tests/knowledge && git commit -m "feat: extract and chunk knowledge sources"`

### Task 3: Azure Search indexing and Neon version records

**Files:**
- Create: `lib/knowledge/azure-admin.ts`
- Create: `lib/knowledge/source-repository.ts`
- Create: `tests/knowledge/indexing.test.ts`

- [ ] **Step 1: Test mandatory access and temporal metadata**

```ts
it("rejects an upload without tier or temporal status", async () => {
  await expect(uploadChunks([{ id: "x", text: "law" } as never], fakeFetch)).rejects.toThrow(/accessTier|temporalStatus/)
})
```

- [ ] **Step 2: Create the Azure index schema**

Define `id` as key; searchable `title`, `text`, and `clause`; filterable/facetable `sourceKey`, `sourceVersionId`, `accessTier`, `authority`, `jurisdiction`, `temporalStatus`; filterable dates; and retrievable page/canonical URL fields. Configure English analysis and semantic fields when available. Use the stable `2025-09-01` data-plane API.

- [ ] **Step 3: Implement batched replaceable uploads**

Validate all chunks, upload in batches no larger than 500 actions, inspect per-document statuses, retry transient failures with bounded exponential backoff, and delete old chunks only after the new version succeeds. Never log document text or credentials.

- [ ] **Step 4: Implement Neon source/run persistence**

Upsert `knowledge_sources` by `source_key`; insert `source_versions` only when the SHA-256 content hash changes; record each `ingestion_run` and per-source failure; set last-successful timestamps and chunk counts after Azure confirms success.

- [ ] **Step 5: Run tests and commit**

Run: `pnpm test -- tests/knowledge/indexing.test.ts`

Expected: PASS.

Run: `git add lib/knowledge tests/knowledge && git commit -m "feat: index governed source versions"`

### Task 4: Idempotent sync and freshness operations

**Files:**
- Create: `scripts/knowledge/sync-sharepoint.ts`
- Create: `scripts/knowledge/check-freshness.ts`
- Create: `tests/knowledge/sync.test.ts`
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: Test no-op re-ingestion**

```ts
it("does not re-upload an unchanged source", async () => {
  const result = await syncSource(fileWithHash("abc"), repositoryWithCurrentHash("abc"), search)
  expect(result.status).toBe("unchanged")
  expect(search.upload).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Implement the sync command**

The command validates all required environment variables, starts an ingestion run, lists manifest-approved files, hashes each download, skips unchanged versions, extracts and indexes changed sources, records failures without aborting unrelated files, finishes the run with counts, and exits non-zero if any source failed.

- [ ] **Step 3: Implement freshness reporting**

Print source key, current version, effective date, last successful index, review due date, and last error. Exit non-zero when a current legal/planning source is stale, missing, or failed so deployment/monitoring can alert.

- [ ] **Step 4: Add scripts and operational documentation**

Add `knowledge:sync` and `knowledge:freshness` package scripts. Document required Microsoft Graph application permissions and admin consent, Azure Search setup, corpus allowlisting, first sync, scheduled sync, historical instrument handling, and rollback by source version.

- [ ] **Step 5: Run the ingestion release gate**

Run: `pnpm test -- tests/knowledge && pnpm typecheck && pnpm lint && pnpm build && git diff --check`

Expected: all commands exit 0. A live sync runs only when the SharePoint, Azure, and Neon variables point to the intended project resources.

- [ ] **Step 6: Commit**

Run: `git add scripts/knowledge package.json pnpm-lock.yaml README.md tests/knowledge && git commit -m "feat: automate governed knowledge ingestion"`

