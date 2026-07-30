-- CodeRace Migration: Strictly Private Profiles & Follow Requests System

-- 1. Create Follows Table
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted')) not null default 'pending',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(follower_id, following_id)
);

-- 2. Mark existing profiles approved so legacy logic won't block access
update public.profiles set approved = true where approved = false or approved is null;

-- 3. Row Level Security Policies
alter table public.follows enable row level security;

drop policy if exists "Allow select follows for authenticated users" on public.follows;
create policy "Allow select follows for authenticated users"
  on public.follows for select
  to authenticated
  using (true);

drop policy if exists "Allow insert follows for authenticated users" on public.follows;
create policy "Allow insert follows for authenticated users"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "Allow update follows for follower or following" on public.follows;
create policy "Allow update follows for follower or following"
  on public.follows for update
  to authenticated
  using (auth.uid() = following_id or auth.uid() = follower_id);

drop policy if exists "Allow delete follows for follower or following" on public.follows;
create policy "Allow delete follows for follower or following"
  on public.follows for delete
  to authenticated
  using (auth.uid() = following_id or auth.uid() = follower_id);
