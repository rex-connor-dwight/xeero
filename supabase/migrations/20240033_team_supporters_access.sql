create policy "Team members can view supporters"
  on supporters for select
  using (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );

create policy "Team members can view support application status"
  on support_applications for select
  using (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );