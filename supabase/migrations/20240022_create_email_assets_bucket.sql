insert into storage.buckets (id, name, public)
values ('email-assets', 'email-assets', true);

create policy "Admin can upload email assets"
on storage.objects for insert
with check (bucket_id = 'email-assets');

create policy "Public can view email assets"
on storage.objects for select
using (bucket_id = 'email-assets');