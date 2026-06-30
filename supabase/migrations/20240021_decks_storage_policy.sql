-- Allow anyone to read deck files via signed URL
create policy "Public can view decks via signed URL"
on storage.objects for select
using (bucket_id = 'decks');