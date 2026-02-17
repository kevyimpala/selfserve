-- Run in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  age integer,
  identity text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username is null or username ~ '^[a-z0-9_]{3,30}$'),
  constraint age_range check (age is null or (age between 13 and 120))
);

create table if not exists public.pantry_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity numeric not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.uploads (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_base64 text not null,
  ingredients_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pantry_items_user_id_idx on public.pantry_items (user_id);
create index if not exists uploads_user_id_idx on public.uploads (user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  desired_username text;
begin
  desired_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));

  insert into public.profiles (user_id, username, onboarding_completed)
  values (
    new.id,
    nullif(desired_username, ''),
    false
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.pantry_items enable row level security;
alter table public.uploads enable row level security;

-- Profiles policies
create policy if not exists "profiles_select_own"
on public.profiles for select
using (auth.uid() = user_id);

create policy if not exists "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = user_id);

create policy if not exists "profiles_update_own"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Allow username availability checks from client signup flow
create policy if not exists "profiles_select_username_lookup"
on public.profiles for select
using (true);

-- Pantry policies
create policy if not exists "pantry_select_own"
on public.pantry_items for select
using (auth.uid() = user_id);

create policy if not exists "pantry_insert_own"
on public.pantry_items for insert
with check (auth.uid() = user_id);

create policy if not exists "pantry_update_own"
on public.pantry_items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "pantry_delete_own"
on public.pantry_items for delete
using (auth.uid() = user_id);

-- Upload policies
create policy if not exists "uploads_select_own"
on public.uploads for select
using (auth.uid() = user_id);

create policy if not exists "uploads_insert_own"
on public.uploads for insert
with check (auth.uid() = user_id);

create policy if not exists "uploads_delete_own"
on public.uploads for delete
using (auth.uid() = user_id);
