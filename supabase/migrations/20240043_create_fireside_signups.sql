create table fireside_signups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  track text not null default 'interest' check (track in ('interest', 'funding')),
  xeero_slug text,
  is_live_at_signup boolean,
  created_at timestamp with time zone default now()
);

alter table fireside_signups enable row level security;

create policy "Anyone can sign up"
  on fireside_signups for insert
  with check (true);

create policy "Admin can view all signups"
  on fireside_signups for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');