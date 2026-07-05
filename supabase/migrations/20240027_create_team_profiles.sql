create table team_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  role text not null,
  bio text,
  photo_url text,
  linkedin_url text,
  twitter_url text,
  permissions jsonb default '[]',
  created_at timestamp with time zone default now()
);

alter table team_profiles enable row level security;

-- Team member can view their own profile
create policy "Team member can view their profile"
  on team_profiles for select
  using (user_id = auth.uid());

-- Founder can view their team
create policy "Founder can view their team"
  on team_profiles for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- Service role inserts on invite acceptance
create policy "Service role can insert team profiles"
  on team_profiles for insert
  with check (true);

-- Team member can update their own profile
create policy "Team member can update their profile"
  on team_profiles for update
  using (user_id = auth.uid());

-- Public can view team members for a profile (for slug page)
create policy "Public can view team profiles"
  on team_profiles for select
  using (true);