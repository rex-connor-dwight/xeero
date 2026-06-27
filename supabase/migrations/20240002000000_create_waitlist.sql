-- Waitlist table
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  email text not null,
  name text,
  created_at timestamp with time zone default now()
);

-- Enable row level security
alter table waitlist enable row level security;

-- Only the profile owner can view their waitlist
create policy "Owner can view their waitlist"
  on waitlist
  for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- Anyone can join a waitlist
create policy "Anyone can join a waitlist"
  on waitlist
  for insert
  with check (true);