# Murrumbella system inventory

Updated 30 June 2026. This file deliberately contains no passwords, API keys or connection strings. The actual local values are in the ignored `.env.local` file; production values belong in Hostinger's environment-variable settings.

## Working services

| Component | Configuration | Purpose | Status |
|---|---|---|---|
| Website | Node.js / Next.js on Hostinger | Public site and Murrumbella Guide | Application built; production deployment still required |
| Database | Neon project `Murrumbella`, Sydney, Postgres 18, branch `production` | Source governance, ingestion history, conversations and handoffs | Connected and migrated |
| Search | Azure AI Search `search-murrumbella-prod` in `rg-murrumbella-prod`, Australia East | Searchable document chunks | Live and queried successfully |
| Authentication | Clerk | Registered and qualified-user access | Keys configured locally; production setup still required |
| Source documents | SharePoint management site, Murrumbella dossier folder | Original documents and controlled knowledge library | Connected read-only through Microsoft Graph |
| Ingestion identity | Entra app `Murrumbella SharePoint Ingestion` | Scheduled SharePoint-to-search synchronisation | `Sites.Selected` only, limited to the selected site |
| Language model | OpenAI-compatible model client | Cited sales-guide responses | OpenAI is the currently implemented provider; alternative provider keys are only reserved variables |

## Knowledge status

- 29 allowlisted documents are indexed successfully.
- Property evidence includes the planning certificate, title search, Crown plan, five deposited plans and three Section 88B instruments.
- The five plans and three Section 88B instruments have a searchable OCR layer while preserving their original visual pages.
- Current Yass material includes the Yass Valley LEP 2013, the Yass Valley DCP 2024, council plans, policies, strategies and regional economic/tourism reports.
- Historical planning material includes the LEP consolidation immediately preceding Amendment No. 1 and the final repealed consolidation of Yass LEP 1987. The latter is not represented as the exact point-in-time text applying to the 1990 development consent.
- Other older instruments and the shortlisted NSW/Commonwealth legislation remain in the manifest as non-blocking `PENDING` work.
- Public, registered and qualified access labels are stored on every search chunk. Title plans and Section 88B instruments are `qualified` evidence.

## Security state

- The SharePoint application receives only the Microsoft Graph `Sites.Selected` application role.
- It has a site-specific `read` grant for the dossier's SharePoint site.
- A fresh-token verification confirmed selected-site read succeeds and tenant-wide site enumeration is blocked.
- SharePoint, Azure, database and model credentials are server-only and must never be placed in browser code.

## Configuration map

The complete variable-name template is `.env.example`. Values are stored in:

1. Local development: `.env.local` (ignored by Git).
2. Production: Hostinger Node.js environment variables (not yet configured).
3. Source-of-truth consoles: Clerk, Neon, Azure/Entra, and the model provider.

Use `docs/operations/credential-rotation.md` whenever a key, password or client secret must be replaced.
