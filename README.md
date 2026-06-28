# Murrumbella

Private property website and grounded AI sales guide for Murrumbella, 424 Horseshoe Road, Mullion NSW.

## What is built

- A public Murrumbella Guide with citations, controlled follow-up questions and an explicit owner handoff.
- Server-resolved `public`, `registered` and `qualified` access tiers.
- OpenAI Responses API generation with structured output and `store: false`.
- Neon Postgres for approved claims, source versions, ingestion health, conversations, 90-day message retention, consent and handoffs.
- Azure AI Search for access-labelled legislation, planning instruments and property-document chunks.
- A controlled Microsoft Graph synchroniser for the allowlisted SharePoint folder.

SharePoint remains the original-document store. Azure Search holds searchable text chunks. Neon holds governance, provenance and application state. The browser never receives SharePoint, Azure or database credentials.

## Local setup

1. Install Node.js 20+ and pnpm.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env.local` and fill the environment variables for the intended environment.
4. Run `pnpm db:migrate` against the intended Neon branch.
5. Run `pnpm dev`.

Without OpenAI, Neon or Azure variables the public site still loads and the guide fails closed: it does not invent an answer. Handoffs require Neon so consent is not silently lost.

## Knowledge corpus

`config/knowledge-sources.json` is the explicit allowlist. It is deliberately scoped to Murrumbella, Yass Valley and the directly relevant NSW/Commonwealth controls. It contains:

- the property planning certificate, title, deposited plans and section 88B instruments;
- the current Yass Valley LEP and DCP;
- a prior Yass Valley LEP consolidation and the earlier Yass, Gunning and Yarrowlumla instruments;
- the principal planning, water, biodiversity, fire and title legislation; and
- the property-relevant SEPPs.

Adding a document to SharePoint does not make it searchable. A source must also be reviewed and added to the manifest with an authority, access tier, temporal status, review owner and review interval. This prevents an accidental upload from becoming bot evidence.

### SharePoint permissions

Create a Microsoft Entra application for the ingestion worker. Prefer `Sites.Selected` application permission and grant it access only to the management site that contains the Murrumbella folder. Grant admin consent, then configure the tenant, client, secret, drive ID and folder path from `.env.example`. Do not use a staff member's interactive token for scheduled ingestion.

### First and scheduled sync

Run:

```bash
pnpm db:migrate
pnpm knowledge:sync
pnpm knowledge:freshness
```

The sync enumerates only the configured folder, ignores files outside the manifest, hashes each approved file, skips unchanged content, extracts page-aware text, uploads the new source version, then removes older search chunks. Empty/image-only documents fail for OCR review instead of being marked indexed.

Schedule `knowledge:sync` daily or after controlled document changes, followed by `knowledge:freshness`. A non-zero freshness result means a required, stale or failed source needs attention. Current and historical instruments are separate sources; a historical document is never promoted to current by retrieval.

## Database and retention

Migrations are additive and live in `db/migrations`. The initial agent migration preserves the existing `registrations` and `document_access` tables. Public and authenticated conversations are stored only when Neon is configured. Messages expire after 90 days unless a user has explicitly consented to longer retention. Handoff contact details and consent are recorded separately.

## Release checks

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
git diff --check
```

Run a real desktop and mobile chat check after configuring the deployment credentials. Planning, subdivision, water, price and approval answers are critical evaluation cases and must remain cited and cautious.

## Hostinger deployment

Build with `pnpm build` and run with `pnpm start` on the Hostinger Node.js service. Configure all production variables in Hostinger rather than committing a local env file. Run database migrations and the first knowledge sync as controlled release steps; do not make ingestion part of every web-process startup.
