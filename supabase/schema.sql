-- ============================================================
-- InvoiceFlow Database Schema
-- Run this entire file in Supabase → SQL Editor → New query
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
-- One row per user, linked to Supabase auth.users via id.
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  full_name     text,
  business_name text,
  email         text,
  phone         text,
  address       text,
  website       text,
  bank_name     text,
  account_number text,
  account_name  text,
  logo          text,        -- base64 encoded image
  signature     text,        -- base64 encoded image
  accent_color  text default '#3b82f6',
  is_admin      boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can only read/write their own profile
create policy "profiles: own read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

-- Admins can read all profiles
create policy "profiles: admin read" on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- ── clients ─────────────────────────────────────────────────
create table if not exists public.clients (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade not null,
  name         text not null,
  company      text,
  email        text,
  phone        text,
  address      text,
  country      text,
  country_code text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.clients enable row level security;

create policy "clients: own all" on public.clients for all using (auth.uid() = user_id);

-- ── services ────────────────────────────────────────────────
create table if not exists public.services (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  name        text not null,
  description text,
  rate        numeric default 0,
  terms       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.services enable row level security;

create policy "services: own all" on public.services for all using (auth.uid() = user_id);

-- ── invoices ────────────────────────────────────────────────
create table if not exists public.invoices (
  id                   uuid default gen_random_uuid() primary key,
  user_id              uuid references auth.users on delete cascade not null,
  invoice_number       text not null,
  invoice_date         date not null,
  due_date             date not null,
  currency             text default 'NGN',
  client_id            uuid references public.clients on delete set null,
  client_snapshot      jsonb,   -- snapshot of client data at invoice time
  tax_rate             numeric default 0,
  discount             jsonb,
  notes                text,
  payment_instructions text,
  terms                text,
  status               text default 'draft',
  template             text default 'minimal',
  subtotal             numeric default 0,
  discount_amount      numeric default 0,
  tax_amount           numeric default 0,
  total                numeric default 0,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

alter table public.invoices enable row level security;

create policy "invoices: own all" on public.invoices for all using (auth.uid() = user_id);

-- ── invoice_items ────────────────────────────────────────────
create table if not exists public.invoice_items (
  id           uuid default gen_random_uuid() primary key,
  invoice_id   uuid references public.invoices on delete cascade not null,
  service_id   uuid references public.services on delete set null,
  service_name text,
  description  text,
  quantity     numeric default 1,
  rate         numeric default 0,
  amount       numeric default 0,
  sort_order   integer default 0
);

alter table public.invoice_items enable row level security;

-- Items are accessible if the parent invoice belongs to the user
create policy "invoice_items: own all" on public.invoice_items for all
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_items.invoice_id and i.user_id = auth.uid()
    )
  );

-- ── auto-update updated_at ───────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at  before update on public.profiles  for each row execute procedure public.handle_updated_at();
create trigger clients_updated_at   before update on public.clients   for each row execute procedure public.handle_updated_at();
create trigger services_updated_at  before update on public.services  for each row execute procedure public.handle_updated_at();
create trigger invoices_updated_at  before update on public.invoices  for each row execute procedure public.handle_updated_at();

-- ── auto-create profile on signup ───────────────────────────
-- Creates a blank profile row whenever a new user registers.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
