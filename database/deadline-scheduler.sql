-- Apply to Pact's Supabase project after deploying the matching CRON_SECRET.
-- Provision that secret securely in Vault as pact_deadline_cron_secret first.
-- Never paste a credential into this file or commit one to Git.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'pact_deadline_cron_secret') then
    raise exception 'Provision pact_deadline_cron_secret in Vault before enabling the scheduler';
  end if;
end;
$$;

select cron.schedule(
  'pact-deadline-refunds',
  '* * * * *',
  $job$
    select net.http_post(
      url := 'https://pact-theta-one.vercel.app/api/deadlines',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets
          where name = 'pact_deadline_cron_secret'
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    ) as request_id;
  $job$
);
