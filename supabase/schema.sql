-- Lisa Handmade Cookies: orders + stock schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists products (
  id text primary key,
  name text not null,
  price numeric(10,2) not null,
  category text,
  image text not null,
  images text[] not null default '{}',
  description text,
  ingredients text,
  rating numeric(2,1),
  reviews int default 0,
  stock_qty int not null default 0,
  sort_order int not null default 0
);

-- Safe to re-run: adds the column if this table already existed without it.
alter table products add column if not exists sort_order int not null default 0;
alter table products add column if not exists images text[] not null default '{}';

-- One-time backfill: any product with an empty gallery gets its existing
-- single "image" added as the first (and so far only) gallery photo.
update products set images = array[image] where cardinality(images) = 0;

-- One-time backfill: number any products still at the default 0 by their
-- current alphabetical order, leaving gaps of 10 so new products can be
-- slotted in between later without renumbering everything.
with ordered as (
  select id, row_number() over (order by name) as rn
  from products
  where sort_order = 0
)
update products p set sort_order = ordered.rn * 10
from ordered
where p.id = ordered.id;

create table if not exists gift_sets (
  id text primary key,
  name text not null,
  price numeric(10,2) not null,
  image text not null,
  images text[] not null default '{}',
  description text,
  stock_qty int not null default 0,
  sort_order int not null default 0
);

-- Safe to re-run: adds the columns if this table already existed without them.
alter table gift_sets add column if not exists sort_order int not null default 0;
alter table gift_sets add column if not exists images text[] not null default '{}';

-- One-time backfill: any gift set with an empty gallery gets its existing
-- single "image" added as the first (and so far only) gallery photo.
update gift_sets set images = array[image] where cardinality(images) = 0;

-- One-time backfill: number any gift sets still at the default 0 by their
-- current alphabetical order, leaving gaps of 10.
with ordered as (
  select id, row_number() over (order by name) as rn
  from gift_sets
  where sort_order = 0
)
update gift_sets g set sort_order = ordered.rn * 10
from ordered
where g.id = ordered.id;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  delivery_date date,
  delivery_address text,
  customer_name text,
  customer_phone text,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds the columns if this table already existed without them.
alter table orders add column if not exists delivery_address text;
alter table orders add column if not exists customer_name text;
alter table orders add column if not exists customer_phone text;

-- Atomically checks stock, decrements it, and records the order.
-- Row-level locking (FOR UPDATE) prevents two concurrent orders from
-- both succeeding when only one unit of stock is left.
-- Signature changed (added p_customer_name, p_customer_phone), so drop the
-- old version first: create-or-replace can't change a function's parameter list.
drop function if exists place_order(text, jsonb, numeric, numeric, numeric, date);
drop function if exists place_order(text, jsonb, numeric, numeric, numeric, date, text);

create or replace function place_order(
  p_order_number text,
  p_items jsonb,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_total numeric,
  p_delivery_date date,
  p_delivery_address text,
  p_customer_name text,
  p_customer_phone text
) returns orders
language plpgsql
as $$
declare
  item record;
  current_stock int;
  is_gift boolean;
  new_order orders;
begin
  for item in select * from jsonb_to_recordset(p_items) as x(id text, qty int, is_gift_set boolean)
  loop
    is_gift := coalesce(item.is_gift_set, false);

    if is_gift then
      select stock_qty into current_stock from gift_sets where id = item.id for update;
    else
      select stock_qty into current_stock from products where id = item.id for update;
    end if;

    if current_stock is null then
      raise exception 'Unknown item: %', item.id;
    end if;

    if current_stock < item.qty then
      raise exception 'Insufficient stock for %: have %, want %', item.id, current_stock, item.qty;
    end if;

    if is_gift then
      update gift_sets set stock_qty = stock_qty - item.qty where id = item.id;
    else
      update products set stock_qty = stock_qty - item.qty where id = item.id;
    end if;
  end loop;

  insert into orders (order_number, items, subtotal, delivery_fee, total, delivery_date, delivery_address, customer_name, customer_phone)
  values (p_order_number, p_items, p_subtotal, p_delivery_fee, p_total, p_delivery_date, p_delivery_address, p_customer_name, p_customer_phone)
  returning * into new_order;

  return new_order;
end;
$$;

-- Single-row table for store-wide settings (delivery fee, free-delivery threshold).
create table if not exists settings (
  id int primary key default 1,
  delivery_fee numeric(10,2) not null default 5,
  free_delivery_threshold numeric(10,2) not null default 100
);

insert into settings (id, delivery_fee, free_delivery_threshold)
values (1, 5, 100)
on conflict (id) do nothing;

-- Row Level Security: block all client-side (anon key) access.
-- All reads/writes go through the server (service_role key), which bypasses RLS.
alter table products enable row level security;
alter table gift_sets enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;

-- Public storage bucket for product photos uploaded via the admin "Add Product" form.
-- Uploads go through the server (service_role key, bypasses storage RLS); this
-- policy only allows anonymous READ so customers' browsers can load the images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for product images" on storage.objects;
create policy "Public read access for product images"
on storage.objects for select
using (bucket_id = 'product-images');
