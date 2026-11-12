-- Apply only to Pact's own Supabase project. Runtime data stays on the server.
create table if not exists public.pacts (
 id uuid primary key,
 owner_id uuid not null references auth.users(id),
 data jsonb not null,
 version bigint not null default 1 check (version > 0),
 deadline timestamptz not null,
 terminal boolean not null default false,
 updated_at timestamptz not null default now()
);
create index if not exists pacts_owner_updated_idx on public.pacts (owner_id, updated_at desc);
create index if not exists pacts_due_idx on public.pacts (deadline) where terminal = false;
alter table public.pacts enable row level security;
revoke all on public.pacts from anon, authenticated;
grant select on public.pacts to authenticated;
grant select,insert,update on public.pacts to service_role;
create policy pacts_read_own on public.pacts for select to authenticated
 using ((select auth.uid()) = owner_id);
-- Clients cannot write payment state directly. The server authenticates the owner,
-- validates domain actions, and performs an atomic version-checked update.
