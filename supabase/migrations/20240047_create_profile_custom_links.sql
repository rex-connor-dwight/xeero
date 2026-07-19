create table profile_custom_links (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  label text not null,
  url text not null,
  display_order integer default 0,
  created_at timestamp with time zone default now()
);

alter table profile_custom_links enable row level security;

create policy "Anyone can view custom links"
  on profile_custom_links for select
  using (true);

create policy "Founder can manage their own custom links"
  on profile_custom_links for all
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );

create policy "Team members can view custom links via profile"
  on profile_custom_links for select
  using (
    profile_id in (select profile_id from team_profiles where user_id = auth.uid())
  );