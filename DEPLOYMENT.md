# Deployment

## Hosting

| Setting | Value |
| --- | --- |
| Application | https://pact-theta-one.vercel.app |
| Vercel project | `pact` |
| Repository | `sammielawrenzo-lang/PACT` |
| Production branch | `main` |
| Install command | `npm ci` |
| Build command | `npm run build` |

Changes to `main` deploy automatically. The root application uses Next.js.

## Environment variables

Configure these variables in Vercel for Production and Preview. For local development, use an ignored `.env.local`.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project API URL |
| `SUPABASE_PUBLISHABLE_KEY` | Session authentication client |
| `SUPABASE_SECRET_KEY` | Server-only database access |
| `PACT_OWNER_EMAIL` | Exact email allowed into the workspace |
| `CRON_SECRET` | Background-job bearer credential |
| `PAYPAL_CLIENT_ID` | PayPal sandbox app client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal sandbox app secret |
| `PAYPAL_MERCHANT_ID` | Sandbox business account ID |
| `OPENAI_API_KEY` | Server-only AI credential |
| `OPENAI_MODEL` | AI model; currently `gpt-6.1-terra` |

Store credentials as sensitive variables. Provider secrets must never use the `NEXT_PUBLIC_` prefix or appear in source, browser bundles, screenshots, or logs. Redeploy after changing runtime variables.

AI requests use low reasoning effort and `store:false`. The API project needs available credits for drafting and evidence review.

## Database and authentication

1. Apply [database/setup.sql](database/setup.sql) to the Supabase project.
2. Set the Supabase Site URL to `https://pact-theta-one.vercel.app` and allow the exact `https://pact-theta-one.vercel.app/auth/callback` redirect.
3. Set `PACT_OWNER_EMAIL` to the workspace owner's email.
4. Configure the scheduler using [OPERATIONS.md](OPERATIONS.md) and [database/deadline-scheduler.sql](database/deadline-scheduler.sql).

Sign-in uses an emailed link with a PKCE session. The server verifies the user before reading pacts or executing actions. Database policies allow owner-only reads and reject client writes; server updates compare the stored version atomically. The sign-in page is public, while application data and actions require authentication. State is not imported automatically from the earlier Sites D1 database.

## Validation

Checks completed on November 12, 2026:

| Check | Result |
| --- | --- |
| Type checking, production build, and 19 domain/job-authorization tests | Passed |
| Hosted owner sign-in, pact creation, and persistence after reload | Passed |
| Live AI drafts for personal goals, shared goals, and three-person challenges | Passed schema and pact-creation validation |
| AI review of incomplete evidence and a consistent three-person log | Returned insufficient evidence and the expected participant, respectively |
| Instruction injection within incomplete evidence | Remained insufficient |
| Hosted AI personal-goal drafting and evidence review | Passed, including persistence after reload |
| Keypad entry, simulated contribution, and simulated refund | Passed |
| Scheduled refund of an expired simulated contribution | Completed and persisted |
| PayPal sandbox buyer approval, $1 capture, and refund | Completed; capture and refund references verified in the hosted receipt |
| PayPal winner payout | Provider-level acceptance test pending |

The live AI scenario checks used the real OpenAI API with test doubles for authentication and storage. A separate hosted personal-goal walkthrough exercised actual authentication and database persistence. The PayPal checkout check used a sandbox buyer; no live-money transaction was performed. Scheduled refunds of PayPal captures still need a separate end-to-end check.
