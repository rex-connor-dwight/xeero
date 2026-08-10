drop policy if exists "Founder can update their own draft application" on pordware_applications;

create policy "Founder can update their own draft application"
  on pordware_applications for update
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
    and status in ('draft', 'submitted')
  )
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );