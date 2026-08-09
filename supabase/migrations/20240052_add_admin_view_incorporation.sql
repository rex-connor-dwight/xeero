create policy "Admin can view all incorporation requests"
  on incorporation_requests for select
  using (auth.jwt() ->> 'email' = 'connor@xeero.me');