-- Profiles table
create table profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,

  -- Startup info
  startup_name text,
  tagline text,
  problem text,
  solution text,
  stage text,
  industry text,
  business_model text,
  traction text,
  location text,

  -- Founder info
  founder_name text,
  founder_role text,
  founder_bio text,
  founder_linkedin text,
  founder_twitter text,
  founder_photo text,

  -- System
  slug text unique,
  is_live boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Only the owner can read or edit their profile
alter table profiles enable row level security;

create policy "Owner can manage their profile"
  on profiles
  for all
  using (auth.uid() = user_id);

-- Anyone can view a live profile
create policy "Public can view live profiles"
  on profiles
  for select
  using (is_live = true);