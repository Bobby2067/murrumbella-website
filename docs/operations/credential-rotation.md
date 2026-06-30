# Changing Murrumbella credentials

Use this runbook when a credential expires, is exposed or needs routine replacement. Never paste a secret into this file, Git, SharePoint, a support ticket or browser-side code.

The safe order is always: **create new credential → update local and production settings → redeploy or restart → verify → revoke old credential**. Change one service at a time so a failure has one obvious cause.

## Where values live

- Local development: `.env.local` in the repository root. It is ignored by Git.
- Production: Hostinger hPanel → the Murrumbella Node.js application → environment variables.
- Variable-name checklist: `.env.example`.
- Provider source of truth: the relevant Clerk, Neon, Azure/Entra or model-provider console.

After changing Hostinger values, restart or redeploy the Node.js application. Editing `.env.local` does not update Hostinger.

## Microsoft Entra client secret

The current app is `Murrumbella SharePoint Ingestion`. Its secret is scheduled to expire on **27 December 2027**.

1. Open Microsoft Entra admin center → App registrations → `Murrumbella SharePoint Ingestion` → Certificates & secrets.
2. Add a new client secret and copy its **Value** immediately; the value is shown only once. Do not copy the secret ID.
3. Replace `MICROSOFT_CLIENT_SECRET` in `.env.local` and Hostinger.
4. Run the SharePoint verification and a knowledge sync.
5. Only after both pass, delete the old client secret in Entra.

Do not change `MICROSOFT_CLIENT_ID`, tenant ID or object IDs when merely rotating the secret. The final API-permission state must remain `Sites.Selected`; do not leave `Sites.ReadWrite.All` configured.

Official reference: [Add and manage app credentials in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/how-to-add-credentials).

## Azure AI Search keys

`AZURE_SEARCH_ADMIN_API_KEY` is for index creation and ingestion. `AZURE_SEARCH_QUERY_API_KEY` should be used for read-only runtime search when the application supports separate keys. `AZURE_SEARCH_API_KEY` is the key currently consumed by the application, so keep it aligned with the operation being run.

To rotate an admin key without downtime:

1. Azure portal → `search-murrumbella-prod` → Settings → Keys.
2. Copy the secondary admin key and temporarily set `AZURE_SEARCH_ADMIN_API_KEY` and `AZURE_SEARCH_API_KEY` to it everywhere they are used.
3. Restart/redeploy and verify a live search and ingestion.
4. Regenerate the primary key.
5. Replace the variables with the new primary key, restart/redeploy and verify again.
6. Optionally regenerate the secondary key after nothing uses it.

Never regenerate both admin keys at once. Query keys can be replaced by creating a new named query key, deploying it, checking live search, then deleting the old query key.

Official reference: [Azure AI Search API keys and regeneration](https://learn.microsoft.com/en-us/azure/search/search-security-api-keys).

## Neon database password

1. Open the Neon `Murrumbella` project and select the production branch/database role.
2. Reset the role password or create a replacement role with the required privileges.
3. Copy the new connection string and replace the complete `DATABASE_URL` in `.env.local` and Hostinger.
4. Run `pnpm db:migrate`, `pnpm test`, and one knowledge freshness check.
5. Redeploy and verify authentication, chat persistence and a knowledge query before disabling an old role.

Keep `sslmode=require` (and channel binding when supplied) in the Neon connection string. Use a pooled production connection string if the Hostinger workload requires pooling.

Official reference: [Connect to Neon](https://neon.com/docs/connect/connect-from-any-app).

## Clerk keys

The browser-safe publishable key is `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`; the private backend key is `CLERK_SECRET_KEY`.

1. Clerk Dashboard → Murrumbella application and correct environment → API keys.
2. Add a new secret key with a descriptive name.
3. Replace `CLERK_SECRET_KEY` locally and in Hostinger, redeploy, and test sign-in plus a server-authenticated route.
4. Confirm the new key shows recent use, then delete the old secret key.

Clerk can keep more than one secret key active, so do not delete the old one before verification. The publishable key normally does not need rotation merely because it is visible in frontend code.

Official reference: [Rotate Clerk API keys](https://clerk.com/docs/guides/secure/rotate-api-keys).

## Language-model API key

The current implementation reads `OPENAI_API_KEY` and `OPENAI_MODEL`. `GEMINI_API_KEY`, `GROQ_API_KEY` and `OPENROUTER_API_KEY` are reserved but are not currently used by the runtime.

1. Create a new API key in the chosen provider's console.
2. Replace the matching environment variable locally and in Hostinger.
3. Redeploy and run a cited chat test. Confirm the answer contains only supplied evidence and includes citations.
4. Revoke the old key after the test passes.

Changing to Gemini, Groq or OpenRouter requires a code/provider configuration change as well as setting the key.

## Emergency response

If a secret is pasted into chat, email, a commit or a screenshot, treat it as exposed: rotate it immediately, then check provider usage and audit logs. Removing the text later is not a substitute for rotation.

## Verification commands

Run from the repository root in PowerShell:

```powershell
node --env-file=.env.local ./node_modules/tsx/dist/cli.mjs scripts/knowledge/check-freshness.ts
node --env-file=.env.local scripts/knowledge/verify-sharepoint-access.mjs
node --env-file=.env.local ./node_modules/tsx/dist/cli.mjs scripts/knowledge/verify-live-search.ts
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

The SharePoint check must report only `Sites.Selected` and confirm tenant-wide enumeration is blocked. The live-search check must retrieve both the current Yass LEP and qualified OCR title evidence.
