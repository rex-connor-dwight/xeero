create policy "Team members can view funding applications"
  on funding_applications for select
  using (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );

create policy "Team members can create funding applications"
  on funding_applications for insert
  with check (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );

create policy "Team members can view support applications"
  on support_applications for select
  using (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );
-- Note: no insert policy for team members on support_applications — founder only