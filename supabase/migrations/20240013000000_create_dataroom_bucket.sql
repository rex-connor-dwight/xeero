-- Create the dataroom bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dataroom',
  'dataroom',
  true,
  10485760, -- 10MB max per file
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- Owner can upload
create policy "Owner can upload dataroom files"
  on storage.objects
  for insert
  with check (
    bucket_id = 'dataroom'
    and auth.uid() is not null
  );

-- Anyone can view (needed for investor access)
create policy "Anyone can view dataroom files"
  on storage.objects
  for select
  using (bucket_id = 'dataroom');

-- Owner can delete their own files
create policy "Owner can delete dataroom files"
  on storage.objects
  for delete
  using (
    bucket_id = 'dataroom'
    and auth.uid() is not null
  );