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
- OpenAI is configured for Production and Preview with a server-only sensitive `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-6.1-terra`. Requests use low reasoning effort and `store:false`. API credits are available. Live provider requests returned HTTP 200 for drafting and evidence review.
- AI drafts infer personal goals, shared goals, or challenges and populate all named participants (up to 20). The existing page design is unchanged. Challenge drafts separate the result cutoff from the later refund deadline so participants can review and confirm in time.

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

Live AI checks on 2026-11-12 passed for a personal goal, a three-person shared goal, and a three-person challenge. Drafts passed the app's schema and pact-creation validation. Evidence review correctly returned `insufficient` for an incomplete goal containing an instruction to ignore the rules, and selected the expected participant from a consistent three-person evidence log. These checks invoked the actual AI route with the real OpenAI API; authentication and database persistence were test doubles. Type checking and all 19 domain/job-authorization tests passed.

Hosted UI checks passed on 2026-11-12: owner sign-in; AI-generated personal goal; keypad entry of a $1 simulated contribution; pact creation and reload; evidence submission; AI review supporting the supplied goal evidence; review persistence after reload; and a completed simulated refund. PayPal sandbox order creation also succeeded and opened the buyer checkout.

Hosted PayPal sandbox checks also passed: a Personal sandbox buyer approved a $1 checkout, PACT captured the payment and recorded the funded state, and the owner requested a refund through the UI. PayPal returned a completed refund, and PACT displayed both capture and refund references in the receipt.

The winner-payout path still needs a separate provider-level acceptance test. No live-money transaction has been performed.
