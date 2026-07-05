create table waitlist_emails (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  subject text not null,
  header text not null,
  body text not null,
  sent_count integer default 0,
  created_at timestamp with time zone default now()
);

alter table waitlist_emails enable row level security;

create policy "Owner can view their email history"
  on waitlist_emails for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

create policy "Service role can insert"
  on waitlist_emails for insert
  with check (true);