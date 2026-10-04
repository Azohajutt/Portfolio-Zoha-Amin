-- Run this once in Supabase → SQL Editor → New query → Run

create extension if not exists pgcrypto;

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  name text not null,
  headline text not null,
  positioning text not null,
  summary text not null,
  location text not null,
  email text not null,
  phone text,
  avatar text,
  resume_path text,
  github text,
  linkedin text,
  chat_starters jsonb not null default '[]'::jsonb,
  welcome_message text,
  updated_at timestamptz not null default now()
);

create table if not exists stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  sort_order int not null default 0,
  visible boolean not null default true
);

create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  start_label text not null,
  end_label text,
  location text not null,
  highlights jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  visible boolean not null default true,
  status text not null default 'published'
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null,
  tier text not null check (tier in ('flagship', 'range')),
  problem text not null,
  solution text not null,
  impact text not null,
  tech jsonb not null default '[]'::jsonb,
  cover_image text,
  repo_url text,
  demo_url text,
  confidential boolean not null default false,
  diagram jsonb not null,
  sort_order int not null default 0,
  visible boolean not null default true,
  status text not null default 'published'
);

create table if not exists skill_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  skills jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  visible boolean not null default true
);

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  years text not null,
  grade text not null
);

create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  url text,
  sort_order int not null default 0,
  visible boolean not null default true
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  ip_hash text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text,
  unanswered boolean not null default false,
  injection_flagged boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);

alter table site_settings enable row level security;
alter table stats enable row level security;
alter table experiences enable row level security;
alter table projects enable row level security;
alter table skill_groups enable row level security;
alter table education enable row level security;
alter table certifications enable row level security;
alter table contact_messages enable row level security;
alter table chat_logs enable row level security;

create policy "public read settings" on site_settings for select using (true);
create policy "public read stats" on stats for select using (visible = true);
create policy "public read experiences" on experiences for select using (visible = true and status = 'published');
create policy "public read projects" on projects for select using (visible = true and status = 'published');
create policy "public read skills" on skill_groups for select using (visible = true);
create policy "public read education" on education for select using (true);
create policy "public read certifications" on certifications for select using (visible = true);

-- Writes go through the service role from Next.js server routes / seed script.

alter table site_settings add column if not exists welcome_message text;
