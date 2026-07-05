-- Allow team members to view waitlist for their linked profile
create policy "Team members can view their startup waitlist"
  on waitlist
  for select
  using (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );

-- Allow team members to view waitlist emails history
create policy "Team members can view waitlist email history"
  on waitlist_emails
  for select
  using (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );

-- Allow team members to insert waitlist emails
create policy "Team members can insert waitlist emails"
  on waitlist_emails
  for insert
  with check (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );