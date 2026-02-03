-- CYBERYNTHE GLOBAL STATE SCHEMA
-- SUPABASE POSTGRESQL V1.0

-- 1. PROFILES (Player Metadata)
create table profiles (
  id uuid references auth.users not null,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- 2. RUNS (Game Sessions)
create table runs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  seed text not null,
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  floor_reached int default 1,
  total_xp int default 0,
  total_ebits int default 0,
  outcome text check (outcome in ('ACTIVE', 'COMPLETED', 'DEATH_ELITE', 'DEATH_STD'))
);

-- 3. LEADERBOARD (View)
create view leaderboard as
  select username, floor_reached, total_xp, total_ebits
  from runs
  join profiles on runs.user_id = profiles.id
  where outcome != 'ACTIVE'
  order by floor_reached desc, total_xp desc;

-- 4. ANOMALIES (Community Events)
create table anomalies (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  sector_target int,
  active boolean default true,
  description text
);
