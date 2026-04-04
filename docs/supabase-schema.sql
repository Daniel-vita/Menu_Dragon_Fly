-- ============================================================
-- DragonFly Menu Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists public.categories (
  id text primary key,
  name text not null,
  icon text not null default '',
  image text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  descriptions text[] not null default '{}'::text[],
  price text,
  image text not null default '',
  format text,
  vegan boolean not null default false,
  sold_out boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists descriptions text[] not null default '{}'::text[];

create table if not exists public.product_prices (
  id uuid primary key default uuid_generate_v4(),
  product_id text not null references public.products(id) on delete cascade,
  label text not null,
  value text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_allergens (
  id uuid primary key default uuid_generate_v4(),
  product_id text not null references public.products(id) on delete cascade,
  allergen text not null,
  position integer not null default 0
);

create table if not exists public.addon_groups (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.addon_options (
  id uuid primary key default uuid_generate_v4(),
  addon_group_id text not null references public.addon_groups(id) on delete cascade,
  name text not null,
  price text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_sort_order on public.products(sort_order);
create index if not exists idx_products_sold_out on public.products(sold_out);
create index if not exists idx_products_vegan on public.products(vegan);
create index if not exists idx_products_name on public.products(name);
create index if not exists idx_categories_sort_order on public.categories(sort_order);
create index if not exists idx_product_prices_product on public.product_prices(product_id);
create index if not exists idx_product_allergens_product on public.product_allergens(product_id);
create index if not exists idx_addon_groups_product on public.addon_groups(product_id);
create index if not exists idx_addon_options_group on public.addon_options(addon_group_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = _user_id
  );
$$;

alter table public.categories enable row level security;
create policy "Public read categories" on public.categories
  for select to anon, authenticated using (true);
create policy "Admin insert categories" on public.categories
  for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "Admin update categories" on public.categories
  for update to authenticated using (public.is_admin(auth.uid()));
create policy "Admin delete categories" on public.categories
  for delete to authenticated using (public.is_admin(auth.uid()));

alter table public.products enable row level security;
create policy "Public read products" on public.products
  for select to anon, authenticated using (true);
create policy "Admin insert products" on public.products
  for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "Admin update products" on public.products
  for update to authenticated using (public.is_admin(auth.uid()));
create policy "Admin delete products" on public.products
  for delete to authenticated using (public.is_admin(auth.uid()));

alter table public.product_prices enable row level security;
create policy "Public read prices" on public.product_prices
  for select to anon, authenticated using (true);
create policy "Admin manage prices" on public.product_prices
  for all to authenticated using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

alter table public.product_allergens enable row level security;
create policy "Public read allergens" on public.product_allergens
  for select to anon, authenticated using (true);
create policy "Admin manage allergens" on public.product_allergens
  for all to authenticated using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

alter table public.addon_groups enable row level security;
create policy "Public read addon_groups" on public.addon_groups
  for select to anon, authenticated using (true);
create policy "Admin manage addon_groups" on public.addon_groups
  for all to authenticated using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

alter table public.addon_options enable row level security;
create policy "Public read addon_options" on public.addon_options
  for select to anon, authenticated using (true);
create policy "Admin manage addon_options" on public.addon_options
  for all to authenticated using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

alter table public.admins enable row level security;
create policy "Admins can read own" on public.admins
  for select to authenticated using (user_id = auth.uid());
