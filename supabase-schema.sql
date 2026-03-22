-- ─────────────────────────────────────────────
-- CampFire — Supabase SQL Schema
-- Run this entire file in your Supabase SQL editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ─────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── CAMPS ────────────────────────────────────
create table if not exists camps (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null unique,
  display_name text not null,
  description  text,
  icon         text not null default '🔥',
  color        text not null default 'rgba(249,115,22,.15)',
  member_count integer not null default 0,
  created_by   uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

-- ── POSTS ────────────────────────────────────
create table if not exists posts (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  body          text,
  image_url     text,
  link_url      text,
  camp_id       uuid references camps(id) on delete cascade,
  camp_name     text not null,
  camp_icon     text not null default '🔥',
  author_id     uuid references auth.users(id) on delete set null,
  author_name   text not null,
  author_avatar text,
  upvotes       integer not null default 1,
  downvotes     integer not null default 0,
  comment_count integer not null default 0,
  tags          text[] default '{}',
  awards        jsonb default '[]',
  created_at    timestamptz not null default now()
);

-- ── VOTES ────────────────────────────────────
create table if not exists votes (
  id       uuid primary key default uuid_generate_v4(),
  post_id  uuid references posts(id) on delete cascade not null,
  user_id  uuid references auth.users(id) on delete cascade not null,
  value    integer not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- ── COMMENTS ─────────────────────────────────
create table if not exists comments (
  id            uuid primary key default uuid_generate_v4(),
  post_id       uuid references posts(id) on delete cascade not null,
  parent_id     uuid references comments(id) on delete cascade,
  author_id     uuid references auth.users(id) on delete set null,
  author_name   text not null,
  author_avatar text,
  body          text not null,
  upvotes       integer not null default 1,
  downvotes     integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ── MEMBERSHIPS ──────────────────────────────
create table if not exists memberships (
  id        uuid primary key default uuid_generate_v4(),
  camp_id   uuid references camps(id) on delete cascade not null,
  user_id   uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz not null default now(),
  unique (camp_id, user_id)
);

-- ── HELPER FUNCTIONS ─────────────────────────
create or replace function adjust_votes(
  p_post_id        uuid,
  p_upvote_delta   integer,
  p_downvote_delta integer
) returns void language plpgsql security definer as $$
begin
  update posts set
    upvotes   = upvotes   + p_upvote_delta,
    downvotes = downvotes + p_downvote_delta
  where id = p_post_id;
end;
$$;

create or replace function increment_comment_count(p_post_id uuid)
returns void language plpgsql security definer as $$
begin
  update posts set comment_count = comment_count + 1 where id = p_post_id;
end;
$$;

-- ── RLS (Row Level Security) ──────────────────
alter table camps       enable row level security;
alter table posts       enable row level security;
alter table votes       enable row level security;
alter table comments    enable row level security;
alter table memberships enable row level security;

-- Camps: anyone can read, signed-in can create
create policy "camps_read"   on camps for select using (true);
create policy "camps_insert" on camps for insert with check (auth.uid() is not null);
create policy "camps_update" on camps for update using (auth.uid() is not null);

-- Posts: anyone can read, signed-in can create, author can delete
create policy "posts_read"   on posts for select using (true);
create policy "posts_insert" on posts for insert with check (auth.uid() is not null);
create policy "posts_update" on posts for update using (auth.uid() is not null);
create policy "posts_delete" on posts for delete using (auth.uid() = author_id);

-- Votes: signed-in only
create policy "votes_read"   on votes for select using (auth.uid() is not null);
create policy "votes_insert" on votes for insert with check (auth.uid() is not null);
create policy "votes_update" on votes for update using (auth.uid() = user_id);
create policy "votes_delete" on votes for delete using (auth.uid() = user_id);

-- Comments: anyone can read, signed-in can create, author can delete
create policy "comments_read"   on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() is not null);
create policy "comments_delete" on comments for delete using (auth.uid() = author_id);

-- Memberships
create policy "memberships_read"   on memberships for select using (true);
create policy "memberships_insert" on memberships for insert with check (auth.uid() is not null);
create policy "memberships_delete" on memberships for delete using (auth.uid() = user_id);

-- ── ENABLE REALTIME ───────────────────────────
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table comments;

-- ── SEED CAMPS ───────────────────────────────
insert into camps (name, display_name, description, icon, color, member_count) values
  ('gaming',      'c/gaming',      'All things gaming — reviews, clips, discussions.',    '🎮', 'rgba(59,130,246,.15)',  2100000),
  ('programming', 'c/programming', 'Code, projects, tutorials and tech talk.',             '💻', 'rgba(34,197,94,.15)',   4800000),
  ('memes',       'c/memes',       'The internet''s finest memes. Daily.',                 '😂', 'rgba(168,85,247,.15)',  18000000),
  ('football',    'c/football',    'Goals, transfers, match threads and hot takes.',       '⚽', 'rgba(239,68,68,.15)',   1300000),
  ('music',       'c/music',       'Share what you''re listening to.',                     '🎵', 'rgba(236,72,153,.15)',  3200000),
  ('photography', 'c/photography', 'Shots, tips, and gear talk.',                         '📸', 'rgba(20,184,166,.15)',  890000),
  ('science',     'c/science',     'Discoveries, research and the wonder of the world.',  '🧠', 'rgba(139,92,246,.15)',  2400000),
  ('tvshows',     'c/tvshows',     'Episode discussion, spoilers and reviews.',            '📺', 'rgba(234,179,8,.15)',   1100000),
  ('food',        'c/food',        'Recipes, restaurants, and food pics.',                 '🍔', 'rgba(249,115,22,.15)',  960000)
on conflict (name) do nothing;
