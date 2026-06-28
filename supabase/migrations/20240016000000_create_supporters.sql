create table supporters (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  supporter_name text not null,
  supporter_email text not null,
  amount integer not null, -- in USD
  tier text not null,
  is_public boolean default true,
  paystack_reference text unique,
  created_at timestamp with time zone default now()
);

alter table supporters enable row level security;

-- Founder can view supporters of their own profile
create policy "Owner can view their supporters"
  on supporters
  for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- Anyone can insert (anonymous supporters)
create policy "Anyone can support"
  on supporters
  for insert
  with check (true);

-- Public can view public supporters
create policy "Anyone can view public supporters"
  on supporters
  for select
  using (is_public = true);