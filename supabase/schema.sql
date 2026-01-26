create extension if not exists "pgcrypto";

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  item text not null,
  category text not null,
  original_amount numeric(12, 2) not null,
  original_currency text not null,
  hkd_amount numeric(12, 2) not null,
  fx_rate numeric(12, 6) not null,
  fx_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date);

create table if not exists public.category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null,
  keyword text not null,
  created_at timestamptz not null default now()
);

create index if not exists category_rules_user_category_idx
  on public.category_rules (user_id, category);

alter table public.transactions enable row level security;
alter table public.category_rules enable row level security;

create policy "Transactions are user-owned"
  on public.transactions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Rules are user-owned"
  on public.category_rules
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
