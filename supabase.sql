-- So So sync table: one row per account holding its journal, gifts and friend.
-- Run once in Supabase → SQL Editor.
create table if not exists public.soso_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.soso_data enable row level security;

-- each person can only see and change their own row
create policy "own row: read" on public.soso_data for select using (auth.uid() = user_id);
create policy "own row: insert" on public.soso_data for insert with check (auth.uid() = user_id);
create policy "own row: update" on public.soso_data for update using (auth.uid() = user_id);
