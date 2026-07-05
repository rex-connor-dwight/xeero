create policy "Team members with deck_upload can update deck_url"
  on profiles for update
  using (
    id in (
      select profile_id from team_profiles
      where user_id = auth.uid()
      and permissions ? 'deck_upload'
    )
  );