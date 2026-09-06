alter table public.bonsais
  add column if not exists care_plan_species_id text,
  add column if not exists care_plan_active boolean not null default false,
  add column if not exists care_plan_version text,
  add column if not exists care_plan_activated_at timestamptz,
  add column if not exists care_plan_replaced_at timestamptz;

alter table public.reminders
  add column if not exists source text not null default 'USER',
  add column if not exists care_type text,
  add column if not exists care_plan_version text,
  add column if not exists care_plan_species_id text,
  add column if not exists care_plan_rule_id text,
  add column if not exists care_plan_target_month date;

alter table public.reminders
  add constraint reminders_source_check check (source in ('USER', 'CARE_PLAN')) not valid,
  add constraint reminders_care_plan_origin_check check (
    source = 'USER'
    or (
      care_type is not null
      and care_plan_version is not null
      and care_plan_species_id is not null
      and care_plan_rule_id is not null
      and care_plan_target_month is not null
    )
  ) not valid;

create unique index if not exists reminders_active_care_plan_origin_idx
  on public.reminders (
    user_id,
    bonsai_id,
    care_plan_version,
    care_plan_species_id,
    care_plan_rule_id,
    care_plan_target_month
  )
  where source = 'CARE_PLAN' and status in ('PENDING', 'SNOOZED');

create table if not exists public.stripe_customers (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_entitlements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null,
  active boolean not null default false,
  source text not null default 'stripe',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_subscription_status text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, feature)
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_customers enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.stripe_webhook_events enable row level security;

drop policy if exists stripe_customers_select_own on public.stripe_customers;
create policy stripe_customers_select_own on public.stripe_customers
  for select using (auth.uid() = user_id);

drop policy if exists user_entitlements_select_own on public.user_entitlements;
create policy user_entitlements_select_own on public.user_entitlements
  for select using (auth.uid() = user_id);
