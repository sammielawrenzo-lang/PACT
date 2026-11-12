# Vercel deployment

The root app builds with Next.js. Run `npm ci`, `npm test`, and `npm run build`.

## Connected destinations

- Vercel project: `pact`, project ID `prj_rfBP3wjauIWcsx2z0XDBrmmo3OAc`
- Team: Samuel Zion's projects (`team_bKoPdXG032tFprgdseodq4x0`)
- Linked Git repository: `sammielawrenzo-lang/PACT`, production branch `main`
- GitHub currently contains only its original README. The prepared source has not been pushed.
- PayPal sandbox credentials have been saved as sensitive Vercel variables for Production and Preview. The existing credentials passed an OAuth authentication check.
- Supabase and AI are not configured. No Vercel deployment has been published.

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

Create a separate Pact project in the owner-selected Supabase account. Apply `database/setup.sql`, then run Supabase advisors and verify an authenticated owner can read only their rows while unauthenticated requests and direct client writes are denied. New app state is not imported automatically from the former Sites D1 database.

Set the Supabase Site URL to the final Vercel URL and allow its `/auth/callback` redirect. Use the workspace owner's email in `PACT_OWNER_EMAIL`. The root UI retains the approved design; private workspace sign-in uses an emailed link with a PKCE session. The server verifies the user remotely before accessing any pact or executing an action. Separate participant accounts and invitations remain outside this workspace's current capabilities.

## Deployment and checks

After the GitHub connection can write PACT, push this reviewed source to the repository. Vercel is linked for automatic deployments. Preserve deployment protection during setup. Verify the deployed sign-in, create/read/update persistence, sandbox order approval and capture, refund, and scheduled deadline processing before declaring the move complete.

The local build and 19 domain/job-authorization tests pass. Provider OAuth was verified. The Supabase database and end-to-end hosted payment flow still require their connections and verification.
