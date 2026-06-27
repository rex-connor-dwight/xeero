create table profile_views (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  viewer_ip text,
  created_at timestamp with time zone default now()
);

alter table profile_views enable row level security;

-- Anyone can log a view (public page)
create policy "Anyone can log a profile view"
  on profile_views
  for insert
  with check (true);

-- Only owner can see their views
create policy "Owner can see their views"
  on profile_views
  for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );