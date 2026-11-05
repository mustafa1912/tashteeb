-- ============================================================================
-- Tashteeb (تشطيب) — Initial PostgreSQL Schema & Row-Level Security (Supabase)
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. User Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text default '',
  role text not null default 'homeowner' check (role in ('homeowner', 'contractor')),
  governorate text not null default 'cairo',
  locale text not null default 'en' check (locale in ('en', 'ar')),
  notify_price_alerts boolean not null default true,
  notify_monthly_digest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Contractor Profiles
create table if not exists public.contractor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null default '',
  company_name_ar text default '',
  logo_url text default '',
  tax_card text default '',
  default_overhead_pct numeric(5,2) not null default 7.00,
  default_markup_pct numeric(5,2) not null default 18.00,
  default_vat_pct numeric(5,2) not null default 0.00,
  validity_days integer not null default 14,
  terms_en text default '',
  terms_ar text default '',
  updated_at timestamptz not null default now()
);

-- 3. Governorate Cost Multipliers
create table if not exists public.governorate_factors (
  code text primary key,
  label_en text not null,
  label_ar text not null,
  factor numeric(4,2) not null default 1.00
);

-- 4. Finishing Materials Catalog
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  tier text not null default 'standard',
  is_calculator_item boolean not null default true,
  calc_mode text not null default 'coverage',
  label_en text not null,
  label_ar text not null,
  brand text default '',
  unit text not null,
  unit_ar text default '',
  sale_unit text not null,
  sale_unit_ar text default '',
  coverage_per_unit numeric(8,3) not null default 1.000,
  waste_pct numeric(5,3) not null default 0.050,
  labour_price integer not null default 0,
  store_tip_en text default '',
  store_tip_ar text default '',
  created_at timestamptz not null default now()
);

-- 5. Daily Material Price Snapshots
create table if not exists public.material_prices (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  governorate text not null default 'cairo' references public.governorate_factors(code),
  price integer not null check (price > 0),
  min_price integer not null check (min_price > 0),
  max_price integer not null check (max_price > 0),
  change_30d numeric(6,2) not null default 0.00,
  source text not null default 'seed',
  flagged_for_review boolean not null default false,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_material_prices_lookup
  on public.material_prices (material_id, governorate, fetched_at desc);

-- 6. User Saved Estimates
create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  title_ar text default '',
  status text not null default 'ready' check (status in ('draft', 'in_progress', 'ready')),
  apartment jsonb not null,
  package_key text not null default 'standard',
  selections jsonb not null default '{}'::jsonb,
  extras jsonb not null default '[]'::jsonb,
  contingency_pct numeric(4,2) not null default 0.12,
  include_labour boolean not null default true,
  materials_total integer not null default 0,
  labour_total integer not null default 0,
  contingency_amount integer not null default 0,
  grand_total integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_estimates_user_updated
  on public.estimates (user_id, updated_at desc);

-- 7. Per-Estimate Manual Price Overrides
create table if not exists public.estimate_item_overrides (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  material_slug text not null,
  original_price integer not null,
  used_price integer not null,
  reason text default '',
  created_at timestamptz not null default now(),
  unique (estimate_id, material_slug)
);

-- 8. Shopping List Purchased Checkmarks
create table if not exists public.shopping_list_checks (
  estimate_id uuid not null references public.estimates(id) on delete cascade,
  item_key text not null,
  is_purchased boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (estimate_id, item_key)
);

-- 9. Public Read-Only Shared Links
create table if not exists public.shared_links (
  token text primary key,
  estimate_id uuid references public.estimates(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  snapshot jsonb not null,
  views_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- 10. Material Price Watchlists
create table if not exists public.watchlists (
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_slug text not null,
  alert_threshold_pct numeric(5,2) not null default 5.00,
  created_at timestamptz not null default now(),
  primary key (user_id, material_slug)
);

-- ============================================================================
-- Auth Trigger: Auto-create profile row on signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'homeowner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Row-Level Security (RLS) Policies
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.contractor_profiles enable row level security;
alter table public.governorate_factors enable row level security;
alter table public.materials enable row level security;
alter table public.material_prices enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_item_overrides enable row level security;
alter table public.shopping_list_checks enable row level security;
alter table public.shared_links enable row level security;
alter table public.watchlists enable row level security;

-- Public read access for market & reference tables
create policy "Public read governorates" on public.governorate_factors for select using (true);
create policy "Public read materials" on public.materials for select using (true);
create policy "Public read approved prices" on public.material_prices
  for select using (flagged_for_review = false);

-- Public read access for non-expired shared estimate snapshots
create policy "Public read valid shared links" on public.shared_links
  for select using (expires_at is null or expires_at > now());

create policy "Authenticated users create share links" on public.shared_links
  for insert with check (auth.uid() = created_by);

-- Owner-only policies
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users delete own profile" on public.profiles for delete using (auth.uid() = id);

create policy "Contractors manage own business profile" on public.contractor_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Owners manage own estimates" on public.estimates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Owners manage own overrides" on public.estimate_item_overrides
  for all using (
    exists (
      select 1 from public.estimates e
      where e.id = estimate_id and e.user_id = auth.uid()
    )
  );

create policy "Owners manage own shopping checks" on public.shopping_list_checks
  for all using (
    exists (
      select 1 from public.estimates e
      where e.id = estimate_id and e.user_id = auth.uid()
    )
  );

create policy "Users manage own watchlist" on public.watchlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
