alter table data_room_requests
add column if not exists access_token uuid default gen_random_uuid();

alter table data_room_requests
add column if not exists token_expires_at timestamp with time zone;

-- When founder approves, token expires in 24 hours from approval
-- We'll set this in the app when status changes to approved

-- Allow anyone to look up a token (needed for investor access)
create policy "Anyone can verify a data room token"
  on data_room_requests
  for select
  using (true);