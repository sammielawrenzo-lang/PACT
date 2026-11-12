# Operations

## Deadline processing

The `/api/deadlines` route processes up to 20 expired pacts per call. Browser POST requests require the authenticated workspace owner and the same origin. Background requests require an exact `Authorization: Bearer <CRON_SECRET>` credential. Use a cryptographically random secret of at least 32 characters.

Supabase Cron job `pact-deadline-refunds` runs every minute (`* * * * *`). It calls `https://pact-theta-one.vercel.app/api/deadlines` through `pg_net`, using Vault secret `pact_deadline_cron_secret`. [database/deadline-scheduler.sql](database/deadline-scheduler.sql) contains the scheduler configuration without credentials.

[vercel.json](vercel.json) defines a daily fallback sweep. The browser also requests a check every 30 seconds while open. Contributions become due for refund at the deadline; checks, retries, provider processing, and infrastructure availability can delay completion. A paused Supabase project cannot run its scheduler.

## Monitoring and maintenance

- Inspect `cron.job_run_details` for scheduler executions and `net._http_response` for HTTP results. A successful SQL job only confirms that the request was queued.
- Confirm the HTTP status and the response fields `checked`, `completed`, and `pending`. Pending operations require reconciliation.
- Keep Vercel `CRON_SECRET` and the Vault value synchronized. Redeploy after changing the Vercel environment value.
- To pause this job, select its ID by name and call `cron.alter_job(jobid, active := false)`.
- Never log authorization headers, decrypted Vault values, or provider credentials.

## Payment state

The database stores provider operation IDs, versions, and leases. Only the server can update financial state. Atomic version comparisons prevent stale requests from overwriting newer payment state. Pending refunds remain eligible for retries; payouts reserved before expiry stay on their existing reconciliation path.

All provider requests use the PayPal sandbox API. Captures go into the configured sandbox business account, and refunds go to the original captures. Hosted checkout, capture, and a manually requested provider-confirmed refund have passed. The scheduler has completed an expired simulated refund; scheduled refunds of PayPal captures need a separate end-to-end check. Winner payouts also need a provider-level acceptance test.

## Access and credentials

Database policies permit owner-only reads and reject client writes. Keep Supabase secret keys, PayPal secrets, cron credentials, and OpenAI keys server-side. The `pg_net` extension is installed in the `extensions` schema.

Authentication currently uses email links. Leaked-password protection is disabled; review [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) before adding password sign-in.
