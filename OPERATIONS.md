# Pact deadline refunds on Vercel

The `/api/deadlines` route processes up to 20 expired pacts per call. Browser POST requests require the authenticated workspace owner and the same origin. Background requests require an exact `Authorization: Bearer <CRON_SECRET>` credential; the obsolete Sites header is never sufficient on Vercel. Choose a cryptographically random secret with at least 32 characters and keep it in Vercel runtime settings.

`vercel.json` defines a daily safety sweep compatible with the current Hobby plan. This has not been deployed or scheduled yet. A daily sweep is not sufficient for prompt deadline refunds. Before accepting time-sensitive contributions on Vercel, connect a frequent background scheduler (for example Supabase Cron) and test it against the deployed, protected endpoint. The browser also requests a check every 30 seconds while open. The deadline makes funds due for refund; PayPal's actual completion time can be later. Do not claim an hourly or minute-by-minute job is active until it is configured and verified.

The database stores provider operation IDs, versions, and leases. Only the server can update financial state. Clients have an owner-only read policy and no write grants. Updates compare the stored version atomically, so stale requests cannot overwrite newer payment state. Pending refunds remain eligible for retries. Payouts already reserved before expiry stay on their existing reconciliation path.

All provider requests use the PayPal sandbox API. Captures go into the configured sandbox business account; refunds go to the original captures. No live-money or escrow claim is made. Never share Supabase secret keys, PayPal secrets, cron credentials, or OpenAI keys in source, browser bundles, screenshots, or logs.
