-- PM Toolkit — Full Supabase Schema
-- Execute in Supabase SQL Editor (public schema)

-- 1. Enable uuid-ossp
create extension if not exists "uuid-ossp";

-- Helper: each table has ownerId with RLS policy for auth.uid()

-- ─── Project ─────────────────────────────────────────────────────────────────
create table if not exists "Project" (
  id uuid primary key default gen_random_uuid(),
  "ownerId" uuid not null default auth.uid(),
  name text not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table "Project" enable row level security;
drop policy if exists "owner_full_access_project" on "Project";
create policy "owner_full_access_project" on "Project"
  for all using (auth.uid() = "ownerId");

-- ─── BacklogItem ─────────────────────────────────────────────────────────────
create table if not exists "BacklogItem" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade not null,
  "ownerId" uuid not null default auth.uid(),
  title text not null,
  description text,
  reach double precision,
  impact double precision,
  confidence double precision,
  effort double precision,
  "riceScore" double precision,
  "iceImpact" double precision,
  "iceConfidence" double precision,
  "iceEase" double precision,
  "iceScore" double precision,
  "kanoCategory" text,
  status text default 'backlog' not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table "BacklogItem" enable row level security;
drop policy if exists "owner_full_access_backlog" on "BacklogItem";
create policy "owner_full_access_backlog" on "BacklogItem"
  for all using (auth.uid() = "ownerId");

-- ─── MetricSnapshot ──────────────────────────────────────────────────────────
create table if not exists "MetricSnapshot" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade not null,
  "ownerId" uuid not null default auth.uid(),
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  "metricName" text not null,
  "metricType" text not null,
  value double precision not null,
  unit text not null,
  "normalMin" double precision,
  "normalMax" double precision
);
alter table "MetricSnapshot" enable row level security;
drop policy if exists "owner_full_access_metrics" on "MetricSnapshot";
create policy "owner_full_access_metrics" on "MetricSnapshot"
  for all using (auth.uid() = "ownerId");

-- ─── Experiment (A/B Testing) ────────────────────────────────────────────────
create table if not exists "Experiment" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade not null,
  "ownerId" uuid not null default auth.uid(),
  name text not null,
  "baselineRate" double precision not null,
  mde double precision not null,
  alpha double precision not null,
  power double precision not null,
  n1 integer not null,
  x1 integer not null,
  n2 integer not null,
  x2 integer not null,
  status text default 'planned' not null,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table "Experiment" enable row level security;
drop policy if exists "owner_full_access_experiment" on "Experiment";
create policy "owner_full_access_experiment" on "Experiment"
  for all using (auth.uid() = "ownerId");

-- ─── Funnel ──────────────────────────────────────────────────────────────────
create table if not exists "Funnel" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade not null,
  "ownerId" uuid not null default auth.uid(),
  name text not null,
  steps jsonb not null default '[]'::jsonb,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table "Funnel" enable row level security;
drop policy if exists "owner_full_access_funnel" on "Funnel";
create policy "owner_full_access_funnel" on "Funnel"
  for all using (auth.uid() = "ownerId");

-- ─── CohortEntry ─────────────────────────────────────────────────────────────
create table if not exists "CohortEntry" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade not null,
  "ownerId" uuid not null default auth.uid(),
  "cohortName" text not null,
  size integer not null,
  periods double precision[] not null default '{}'::double precision[]
);
alter table "CohortEntry" enable row level security;
drop policy if exists "owner_full_access_cohort" on "CohortEntry";
create policy "owner_full_access_cohort" on "CohortEntry"
  for all using (auth.uid() = "ownerId");

-- ─── PricingSettings ─────────────────────────────────────────────────────────
create table if not exists "PricingSettings" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade not null,
  "ownerId" uuid not null default auth.uid(),
  "tooCheap" double precision not null,
  cheap double precision not null,
  expensive double precision not null,
  "tooExpensive" double precision not null,
  attractive integer not null,
  performance integer not null,
  "mustBe" integer not null,
  indifferent integer not null,
  unique("projectId")
);
alter table "PricingSettings" enable row level security;
drop policy if exists "owner_full_access_pricing" on "PricingSettings";
create policy "owner_full_access_pricing" on "PricingSettings"
  for all using (auth.uid() = "ownerId");

-- ─── OKR ─────────────────────────────────────────────────────────────────────
create table if not exists "OKR" (
  id uuid primary key default gen_random_uuid(),
  "projectId" uuid references "Project"(id) on delete cascade not null,
  "ownerId" uuid not null default auth.uid(),
  objective text not null,
  quarter text not null,
  "keyResults" jsonb not null default '[]'::jsonb,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table "OKR" enable row level security;
drop policy if exists "owner_full_access_okrs" on "OKR";
create policy "owner_full_access_okrs" on "OKR"
  for all using (auth.uid() = "ownerId");
