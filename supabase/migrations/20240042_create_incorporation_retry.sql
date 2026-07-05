create table if not exists incorporation_requests (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  country text not null check (country in ('nigeria', 'ghana', 'delaware')),
  entity_type text not null,
  proposed_name text not null,
  alt_name_1 text,
  alt_name_2 text,
  installment_months integer not null check (installment_months in (6, 12)),
  total_cost_usd numeric not null,
  amount_per_installment numeric not null,
  deposit_amount_usd numeric,
  paid_installments integer default 0,
  status text not null default 'pending_review' check (status in ('pending_review', 'name_reserved', 'in_progress', 'completed', 'rejected')),
  next_payment_due timestamp with time zone,
  admin_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table incorporation_requests enable row level security;

drop policy if exists "Founder can view their own incorporation requests" on incorporation_requests;
create policy "Founder can view their own incorporation requests"
  on incorporation_requests for select
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

drop policy if exists "Founder can create incorporation requests" on incorporation_requests;
create policy "Founder can create incorporation requests"
  on incorporation_requests for insert
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

drop policy if exists "Team members can view incorporation requests" on incorporation_requests;
create policy "Team members can view incorporation requests"
  on incorporation_requests for select
  using (
    profile_id in (select profile_id from team_profiles where user_id = auth.uid())
  );

drop policy if exists "Service role can update incorporation requests" on incorporation_requests;
create policy "Service role can update incorporation requests"
  on incorporation_requests for update
  using (true);

create table if not exists incorporation_payments (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references incorporation_requests(id) on delete cascade not null,
  amount_usd numeric not null,
  amount_ngn numeric,
  paystack_reference text unique,
  installment_number integer not null,
  status text default 'success',
  created_at timestamp with time zone default now()
);

alter table incorporation_payments enable row level security;

drop policy if exists "Founder can view their incorporation payments" on incorporation_payments;
create policy "Founder can view their incorporation payments"
  on incorporation_payments for select
  using (
    request_id in (
      select id from incorporation_requests where profile_id in (
        select id from profiles where user_id = auth.uid()
      )
    )
  );

drop policy if exists "Service role can insert incorporation payments" on incorporation_payments;
create policy "Service role can insert incorporation payments"
  on incorporation_payments for insert
  with check (true);