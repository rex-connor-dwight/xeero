create table payments (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete set null,
  amount_usd numeric not null,
  amount_ngn numeric,
  paystack_reference text unique,
  payment_type text not null check (payment_type in ('subscription', 'commission')),
  status text default 'success',
  created_at timestamp with time zone default now()
);

alter table payments enable row level security;

-- Founder can view their own payments
create policy "Owner can view their payments"
  on payments
  for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- Service role only for insert
create policy "Service role can insert"
  on payments
  for insert
  with check (true);