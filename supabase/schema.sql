create table if not exists teams (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  created_at timestamptz default now() not null
);

create table if not exists matches (
  id text primary key,
  competition_id integer not null,
  phase text not null,
  match_date timestamptz not null,
  home_team text not null,
  away_team text not null,
  home_sets integer,
  away_sets integer,
  status text not null check (status in ('scheduled', 'finished')),
  source text not null default 'fpv',
  updated_at timestamptz default now() not null
);

create table if not exists standings_rows (
  id bigint generated always as identity primary key,
  phase text not null,
  rank integer not null,
  team text not null,
  points integer not null,
  played integer not null,
  won integer not null,
  lost integer not null,
  sets_won integer not null,
  sets_lost integer not null,
  fetched_at timestamptz default now() not null
);

create table if not exists subscriptions (
  id bigint generated always as identity primary key,
  endpoint text unique not null,
  p256dh text,
  auth text,
  content_encoding text,
  team_scope text,
  notify_start boolean default true not null,
  notify_result boolean default true not null,
  created_at timestamptz default now() not null
);

create table if not exists scraper_runs (
  id bigint generated always as identity primary key,
  source text not null,
  fetched_at timestamptz default now() not null,
  ok boolean not null,
  details jsonb
);

create table if not exists notification_events (
  id bigint generated always as identity primary key,
  event_key text unique not null,
  event_type text not null,
  match_id text,
  created_at timestamptz default now() not null
);
