create extension if not exists pgcrypto;

create table team_invites (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  email text not null,
  role text not null,
  permissions jsonb default '[]',
  token text unique not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  accepted boolean default false,
  expires_at timestamp with time zone default (now() + interval '7 days'),
  created_at timestamp with time zone default now()
);

alter table team_invites enable row level security;

create policy "Owner can view their invites"
  on team_invites for select
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

create policy "Owner can create invites"
  on team_invites for insert
  with check (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

create policy "Service role can update invites"
  on team_invites for update
  using (true);

create policy "Anyone can read invite by token"
  on team_invites for select
  using (true);