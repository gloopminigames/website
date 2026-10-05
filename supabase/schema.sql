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

-- ============================================================
-- Wereldranglijst (toegevoegd later; opnieuw draaien van dit hele bestand kan geen kwaad)
-- ============================================================
alter table public.players add column if not exists on_board boolean not null default true;  -- speler wil op de ranglijst
alter table public.players add column if not exists hidden   boolean not null default false; -- door beheer verborgen (bijv. ongepaste naam of valsspelen)

create table if not exists public.scores (
  player_id   uuid not null references public.players(id) on delete cascade,
  game        text not null,
  score       int  not null,   -- bij Memo Mania: aantal zetten
  extra       int,             -- bij Memo Mania: tijd in seconden
  updated_at  timestamptz not null default now(),
  primary key (player_id, game)
);
create index if not exists scores_game_idx on public.scores(game, score);
alter table public.scores enable row level security;

-- Top n van een spel, plus de plek van speler `me`. Bij gelijke score dezelfde plek.
create or replace function public.gloop_board(g text, n int, me uuid default null)
returns json language sql stable security definer set search_path = public as $$
  with ranked as (
    select s.player_id, p.name, s.score, s.extra, s.updated_at,
      rank() over (order by
        case when g in ('reactie','gloopiegolf','memo') then s.score end asc,
        case when g not in ('reactie','gloopiegolf','memo') then s.score end desc,
        s.extra asc nulls last) as pos
    from scores s join players p on p.id = s.player_id
    where s.game = g and p.on_board and not p.hidden
  )
  select json_build_object(
    'top', coalesce((select json_agg(json_build_object('rank', pos, 'name', name, 'score', score, 'extra', extra, 'me', player_id = me) order by pos, updated_at)
                     from (select * from ranked order by pos, updated_at limit n) t), '[]'::json),
    'total', (select count(*) from ranked),
    'me', (select json_build_object('rank', pos, 'score', score, 'extra', extra) from ranked where player_id = me)
  );
$$;
revoke all on function public.gloop_board(text, int, uuid) from public, anon, authenticated;
grant execute on function public.gloop_board(text, int, uuid) to service_role;

-- ============================================================
-- Eigen Gloop per speler (kleur|gezicht), ook getoond op de ranglijst
-- ============================================================
alter table public.players add column if not exists avatar text not null default '#6BE38A|happy';

create or replace function public.gloop_board(g text, n int, me uuid default null)
returns json language sql stable security definer set search_path = public as $$
  with ranked as (
    select s.player_id, p.name, p.avatar, s.score, s.extra, s.updated_at,
      rank() over (order by
        case when g in ('reactie','gloopiegolf','memo') then s.score end asc,
        case when g not in ('reactie','gloopiegolf','memo') then s.score end desc,
        s.extra asc nulls last) as pos
    from scores s join players p on p.id = s.player_id
    where s.game = g and p.on_board and not p.hidden
  )
  select json_build_object(
    'top', coalesce((select json_agg(json_build_object('rank', pos, 'name', name, 'avatar', avatar, 'score', score, 'extra', extra, 'me', player_id = me) order by pos, updated_at)
                     from (select * from ranked order by pos, updated_at limit n) t), '[]'::json),
    'total', (select count(*) from ranked),
    'me', (select json_build_object('rank', pos, 'score', score, 'extra', extra) from ranked where player_id = me)
  );
$$;
revoke all on function public.gloop_board(text, int, uuid) from public, anon, authenticated;
grant execute on function public.gloop_board(text, int, uuid) to service_role;
