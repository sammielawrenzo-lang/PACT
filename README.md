# PACT

**Your word. Backed.**

PACT turns personal goals, shared commitments, and group challenges into clear agreements. Participants agree on the terms, contribute through PayPal sandbox, submit evidence, and review the outcome. AI helps draft measurable terms and assess the supplied evidence.

[Open PACT](https://pact-theta-one.vercel.app)

## Features

- Personal and shared goals, plus challenges with up to 20 participants.
- Separate setup pages for participants, terms, contributions, and review.
- Custom contribution amounts with a numeric keypad.
- PayPal sandbox checkout, captures, refunds, and winner-payout integration.
- AI agreement drafting and advisory text-evidence review.
- Payment references, receipts, and activity history.

## Development

Install dependencies with `npm ci`. Configure an ignored `.env.local` using the variables in [DEPLOYMENT.md](DEPLOYMENT.md), then start the app with `npm run dev`.

```sh
npm run typecheck
npm test
npm run build
```

The app uses Next.js, React, TypeScript, Vercel Functions, and Supabase Postgres/Auth. The earlier Sites runtime is retained in `platform/sites` as a migration reference. Server-side validation checks terms and money values; versioned database updates protect payment state from stale writes.

## Payment rules

Everyone must accept the terms before funding. Every participant must fund and confirm the same winner before a challenge payout starts. New evidence resets the review and confirmations. AI reviews are advisory and cannot initiate money movement.

Personal and shared goals return contributions. At the deadline, unresolved contributions become due for refund to their original payment captures. New payouts cannot begin after the deadline; a payout already started remains on its reconciliation path. Scheduling and provider processing can delay refund completion.

## Current scope

The app supports PayPal sandbox and a simulated walkthrough, with the payment environment shown at review and checkout. Card and bank details stay in PayPal. Sandbox captures go into the configured sandbox business account; they are not held in a separate escrow account.

Sign-in is restricted to the workspace owner, who can switch participant views. Independent participant accounts, invitations, photo/video uploads, and live-money payments are not enabled. Evidence review evaluates supplied text and cannot authenticate real-world events.

Hosted sandbox checkout, capture, and refund checks have passed. The winner-payout integration still needs a provider-level acceptance test. See [DEPLOYMENT.md](DEPLOYMENT.md) for setup and validation coverage, and [OPERATIONS.md](OPERATIONS.md) for deadline jobs and reconciliation.

## License

MIT licensed. See [LICENSE](LICENSE). Third-party assets and dependencies retain their respective license notices.
