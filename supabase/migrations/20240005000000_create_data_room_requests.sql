create table data_room_requests (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  investor_name text not null,
  investor_email text not null,
  note text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

alter table data_room_requests enable row level security;

-- Anyone can submit a request
create policy "Anyone can request access"
  on data_room_requests
  for insert
  with check (true);

-- Only profile owner can view requests
create policy "Owner can view requests"
  on data_room_requests
  for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- Only profile owner can update status
create policy "Owner can update request status"
  on data_room_requests
  for update
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );