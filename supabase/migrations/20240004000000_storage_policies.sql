-- Logos bucket: owner can upload, anyone can view
create policy "Owner can upload logo"
  on storage.objects for insert
  with check (
    bucket_id = 'logos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Anyone can view logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Owner can delete logo"
  on storage.objects for delete
  using (
    bucket_id = 'logos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Decks bucket: owner can upload and view only
create policy "Owner can upload deck"
  on storage.objects for insert
  with check (
    bucket_id = 'decks' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Owner can view their deck"
  on storage.objects for select
  using (
    bucket_id = 'decks' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Owner can delete deck"
  on storage.objects for delete
  using (
    bucket_id = 'decks' and
    auth.uid()::text = (storage.foldername(name))[1]
  );