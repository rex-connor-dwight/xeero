-- Allow founder to update team members' permissions and role
create policy "Founder can update their team members"
  on team_profiles
  for update
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );

-- Allow founder to delete team members
create policy "Founder can delete their team members"
  on team_profiles
  for delete
  using (
    profile_id in (
      select id from profiles where user_id = auth.uid()
    )
  );