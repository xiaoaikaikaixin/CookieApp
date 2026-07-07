-- Lisa Handmade Cookies: orders + stock schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists products (
  id text primary key,
  name text not null,
  price numeric(10,2) not null,
  category text,
  image text not null,
  description text,
  ingredients text,
  rating numeric(2,1),
  reviews int default 0,
  stock_qty int not null default 0
);

create table if not exists gift_sets (
  id text primary key,
  name text not null,
  price numeric(10,2) not null,
  image text not null,
  description text,
  stock_qty int not null default 0
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  delivery_date date,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

-- Atomically checks stock, decrements it, and records the order.
-- Row-level locking (FOR UPDATE) prevents two concurrent orders from
-- both succeeding when only one unit of stock is left.
create or replace function place_order(
  p_order_number text,
  p_items jsonb,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_total numeric,
  p_delivery_date date
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

  insert into orders (order_number, items, subtotal, delivery_fee, total, delivery_date)
  values (p_order_number, p_items, p_subtotal, p_delivery_fee, p_total, p_delivery_date)
  returning * into new_order;

  return new_order;
end;
$$;

-- Row Level Security: block all client-side (anon key) access.
-- All reads/writes go through the server (service_role key), which bypasses RLS.
alter table products enable row level security;
alter table gift_sets enable row level security;
alter table orders enable row level security;
