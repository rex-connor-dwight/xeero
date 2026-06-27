create table funding_applications (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  slug text not null,
  funding_stage text not null,
  amount_raising text not null,
  use_of_funds text not null,
  additional_notes text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

alter table funding_applications enable row level security;

create policy "Owner can submit application"
  on funding_applications
  for insert
  with check (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

create policy "Owner can view their applications"
  on funding_applications
  for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );