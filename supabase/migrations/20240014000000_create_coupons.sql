create table coupons (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  discount_percent integer not null check (discount_percent between 1 and 100),
  max_uses integer default null, -- null = unlimited
  uses integer default 0,
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table coupons enable row level security;

-- Only service role can access (admin only, no public access)
create policy "Service role only"
  on coupons
  for all
  using (false);

-- Insert your test coupons
insert into coupons (code, discount_percent, max_uses) values
  ('XEERO98', 98, null),
  ('XEEROFOUND', 100, null);