# Vercel deployment

The root app builds with Next.js. Run `npm ci`, `npm test`, and `npm run build`.

## Connected destinations

- Vercel project: `pact`, project ID `prj_rfBP3wjauIWcsx2z0XDBrmmo3OAc`
- Team: Samuel Zion's projects (`team_bKoPdXG032tFprgdseodq4x0`)
- Linked Git repository: `sammielawrenzo-lang/PACT`, production branch `main`
- Production URL: https://pact-theta-one.vercel.app
- The complete app source, approved visuals, and deployment configuration are committed to GitHub. Changes to `main` deploy automatically.
- PayPal sandbox credentials have been saved as sensitive Vercel variables for Production and Preview. The existing credentials passed an OAuth authentication check.
- Supabase project: `Pact` (`vcmvpqtkeybkzvpzepjy`), in the owner-selected Leck organization. Database and Auth API connectivity are verified.
- OpenAI is configured for Production and Preview with a server-only sensitive `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-6.1-terra`. Requests use low reasoning effort and do not store responses. The key authenticated successfully; the first draft request returned `429 credit_balance_exhausted` / `insufficient_quota`. Add API credit in the selected OpenAI project before AI acceptance testing can continue.

## Required runtime variables

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Pact project's API URL |
| `SUPABASE_PUBLISHABLE_KEY` | Session authentication client |
| `SUPABASE_SECRET_KEY` | Server-only database access |
| `PACT_OWNER_EMAIL` | Exact email allowed into this private workspace |
| `CRON_SECRET` | Strong random background-job credential |
| `PAYPAL_CLIENT_ID` | Existing sandbox app ID |
| `PAYPAL_CLIENT_SECRET` | Existing sandbox app secret |
| `PAYPAL_MERCHANT_ID` | Sandbox business Account ID |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Optional AI drafting and evidence review, enabled only with owner approval |

Keep secret values in Vercel settings. No provider secret uses `NEXT_PUBLIC_`.

## Database and sign-in

`database/setup.sql` has been applied to the separate Pact project. Database checks confirmed owner-only reads, rejected client writes, and rejection of stale version updates. New app state is not imported automatically from the former Sites D1 database.

Supabase Site URL is `https://pact-theta-one.vercel.app`; its exact `/auth/callback` redirect is allowlisted. `PACT_OWNER_EMAIL` is `leckwotsamuel@gmail.com`. The root UI retains the approved design; private workspace sign-in uses an emailed link with a PKCE session. The server verifies the user remotely before accessing any pact or executing an action. Separate participant accounts and invitations remain outside this workspace's current capabilities.

## Deployment and checks

The production alias serves the sign-in page publicly; the application data and actions require the workspace owner. Vercel's existing protection settings were preserved. No automation bypass credential was created. The background scheduler authenticates to `/api/deadlines` with a server-only bearer credential stored in Supabase Vault and Vercel.

Verified on 2026-11-12: local production build and 19 domain/job-authorization tests passed; Vercel builds passed; PayPal sandbox OAuth succeeded; Supabase REST and Auth endpoints returned 200; unauthenticated deadline requests returned 401; the deployed sign-in form sent an email successfully. A scheduler request processed an expired pact with simulated funds and persisted the refunded state (one checked, one completed, zero pending).

Remaining acceptance checks: owner completes the email sign-in; create/read/update through the deployed UI; sandbox buyer approval, capture, and provider-confirmed refund; AI draft and evidence review after API credits are available. No live-money transaction has been performed. API authentication is verified, but successful AI generation has not yet been verified.
