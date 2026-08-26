-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  product_description text not null,
  delivery_date date not null,
  status text not null default 'Pending'
    check (status in ('Pending','Preparing','Ready','Delivered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reminder_sent boolean not null default false
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists orders_user_delivery_idx on public.orders(user_id, delivery_date);
create index if not exists orders_user_status_idx on public.orders(user_id, status);
create index if not exists notifications_user_read_idx on public.notifications(user_id, read_at);

alter table public.orders enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "orders_update_own" on public.orders;
drop policy if exists "orders_delete_own" on public.orders;

create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders_update_own" on public.orders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orders_delete_own" on public.orders for delete using (auth.uid() = user_id);

drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "notifications_update_own" on public.notifications;

create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The reminder cron uses the service role in production.
-- Set up a Vercel environment variable named SUPABASE_SERVICE_ROLE_KEY and
-- replace the anon client in app/api/reminders/route.ts with the service-role client
-- for server-side reminder creation. Never expose the service role key to the browser.
