create table data_room_documents (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  section text not null,
  doc_type text not null,
  title text not null,
  file_url text,
  content_json jsonb,
  status text default 'empty',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table data_room_documents enable row level security;

create policy "Owner can manage their documents"
  on data_room_documents
  for all
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

create policy "Anyone can view documents"
  on data_room_documents
  for select
  using (true);