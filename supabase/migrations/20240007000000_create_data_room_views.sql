create table data_room_views (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  investor_email text not null,
  investor_name text,
  section_viewed text,
  duration_seconds integer default 0,
  created_at timestamp with time zone default now()
);

alter table data_room_views enable row level security;

create policy "Anyone can log a view"
  on data_room_views
  for insert
  with check (true);

create policy "Owner can see their views"
  on data_room_views
  for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );