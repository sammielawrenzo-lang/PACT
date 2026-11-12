# PACT

MIT licensed. See [LICENSE](LICENSE).

PACT turns shared promises and goals into clear agreements with accountable contributions. The interface follows the approved warm ivory, navy, mint, and teal designs, with separate setup pages, a custom amount keypad, personal goals, and groups of up to 20 participants.

## Run and check

- Install: `npm ci`
- Preview: `npm run dev`
- Type check: `npm run typecheck`
- Payment-state tests: `npm test`
- Build: `npm run build`

The app uses Next.js, React, TypeScript, Vercel Functions, and Supabase Postgres/Auth. The earlier Sites-specific runtime is retained in `platform/sites` for migration reference. Terms and money values are validated on the server. Participant confirmations and provider operations are stored with optimistic concurrency control.

## Payment rules

Everyone accepts before funding. Every participant must fund and confirm the same winner before a challenge payout starts. Personal and shared goals return contributions. At the deadline, unresolved contributions become due for refund without a 24-hour grace period. Refunds go to the original payment captures. New payouts cannot begin after the deadline. AI never initiates payments.

## Connections

PayPal sandbox uses the server-only `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_MERCHANT_ID`. OpenAI drafting and evidence review use `OPENAI_API_KEY` and `OPENAI_MODEL`. Keep credentials out of source and client bundles. Configure the AI model and credential with the project owner before making API requests.

The payment environment is disclosed at review and checkout. No success is fabricated while a provider is disconnected. The fallback walkthrough uses simulated funds. Card and bank details are managed in PayPal, not collected by Pact.

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel setup and [OPERATIONS.md](OPERATIONS.md) for deadline jobs.

## Current boundaries

The workspace owner can switch participant views; independent participant sign-ins, invitations, uploaded photo/video evidence, and live-money payments are not enabled. Evidence review accepts supplied text. PayPal sandbox captures go into the configured sandbox business account; this is not a separate escrow account. Real deployment would require the appropriate PayPal product approval and a payment/custody design suitable for the business.
