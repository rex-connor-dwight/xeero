create policy "Team members can view notifications"
  on notifications for select
  using (
    profile_id in (
      select profile_id from team_profiles where user_id = auth.uid()
    )
  );