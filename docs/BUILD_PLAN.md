# Pact — demo scope and remaining work

## Confirmed direction

Both people stake equal amounts on opposite outcomes. The first demonstration preserves that model in simulation and PayPal sandbox. AI assists with agreement clarity and evidence review. Participants control the final decision.

## Implemented

- Private owner workspace, persistent pacts, locked terms, and two participant previews.
- Acceptance, funding, evidence, confirmations, winner settlement, and refunds.
- Disputes block settlement. New evidence resets confirmations and review.
- Unresolved pacts can be refunded 24 hours after the agreed deadline.
- Sandbox adapter with order/capture checks, distinct buyer IDs, durable operation IDs, item-level payout validation, and refund reconciliation.
- Structured AI drafting and advisory review, with explicit disconnected states.
- Automated domain tests, database migration, setup instructions, and MIT license.

## Remaining provider validation

1. Configure sandbox merchant credentials and two sandbox personal buyers. Verify merchant identity and sufficient test balance.
2. Capture each stake through the actual approval redirect and inspect provider IDs and amounts.
3. Confirm one winner and verify the exact payout item, recipient, amount, and SUCCESS status. Test pending and failed states without claiming a successful payout.
4. Verify single-sided cancellation, mutual refunds, and timeout refunds against actual sandbox captures.
5. Exercise rejected requests, duplicate requests, lost responses, expired checkout, and reconciling an existing operation.
6. Configure an AI model/key; test drafting, insufficient evidence, conflicting evidence, and malicious instructions embedded in evidence. Confirm no AI response initiates a payment.

## Remaining product work

- Browser QA on desktop and mobile. Automatic approval review blocked the attempted browser preview because a usage limit was reached; visual and interactive QA remains unverified.
- Independent participant authentication, invitations, and authorization. The current owner deliberately controls both previews for the demonstration.
- Complete provider-error recovery, dispute operations, reconciliation jobs, and verified webhooks if moving beyond the private demo.
- Uploads and proof verification are outside this version. Text evidence is not independently authenticated.

## Submission preparation

The retrieved hackathon rules require a working PayPal sandbox integration, meaningful AI, public open-source code with setup instructions, and a public video under three minutes. The recorded submission deadline is November 12, 2026 at 2 PM Central. Verify the live page before submitting.

Suggested demo sequence: state the trust problem; create a clear pact with AI assistance; have both sandbox participants accept and fund; add evidence; show the advisory AI result; confirm the winner twice; show the confirmed payout and activity record; briefly demonstrate the dispute/refund path.

Do not present simulation as a real provider transaction, describe unconfigured AI as working, or claim this prototype is licensed escrow. No Devpost project has been submitted by this build.
