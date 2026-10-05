-- Gloop: database voor accounts. Plak dit in Supabase → SQL Editor → Run. Opnieuw draaien kan geen kwaad.
-- Alleen de server van Gloop (met de service_role-sleutel) mag erbij: RLS staat aan en er zijn geen policies.

create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_key    text not null unique,          -- naam in kleine letters, voor uniek zijn
  salt        text not null,
  hash        text not null,                 -- scrypt-hash van de pincode
  data        jsonb not null default '{}'::jsonb,  -- records, gespeelde potjes, dagelijkse uitdaging
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);

create table if not exists public.sessions (
  token_hash  text primary key,              -- sha256 van de cookie; de cookie zelf staat nergens
  player_id   uuid not null references public.players(id) on delete cascade,
  expires_at  timestamptz not null
);
create index if not exists sessions_player_idx on public.sessions(player_id);

create table if not exists public.rate_limits (
  key       text primary key,
  hits      int not null,
  reset_at  timestamptz not null
);

alter table public.players     enable row level security;
alter table public.sessions    enable row level security;
alter table public.rate_limits enable row level security;

-- Teller tegen raden en spam: verhoogt atomair en begint opnieuw na het tijdvak.
create or replace function public.gloop_hit(k text, window_sec int)
returns int language sql security definer set search_path = public as $$
  insert into rate_limits as r (key, hits, reset_at)
  values (k, 1, now() + make_interval(secs => window_sec))
  on conflict (key) do update
    set hits     = case when r.reset_at < now() then 1 else r.hits + 1 end,
        reset_at = case when r.reset_at < now() then excluded.reset_at else r.reset_at end
  returning hits;
$$;
revoke all on function public.gloop_hit(text, int) from public, anon, authenticated;
grant execute on function public.gloop_hit(text, int) to service_role;

-- Opruimen (handmatig of met pg_cron dagelijks): verlopen sessies en accounts die ruim een jaar niet zijn gebruikt.
create or replace function public.gloop_cleanup()
returns void language sql security definer set search_path = public as $$
  delete from sessions    where expires_at < now();
  delete from rate_limits where reset_at   < now();
  delete from players     where last_seen  < now() - interval '400 days';
$$;
revoke all on function public.gloop_cleanup() from public, anon, authenticated;
grant execute on function public.gloop_cleanup() to service_role;
-- Met pg_cron (Database → Extensions → pg_cron aanzetten):
-- select cron.schedule('gloop-cleanup', '17 3 * * *', 'select public.gloop_cleanup()');
