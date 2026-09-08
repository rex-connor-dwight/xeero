alter table hiring_roles add column if not exists employment_type text check (employment_type in ('remote', 'hybrid', 'onsite'));
alter table hiring_roles add column if not exists about_company_source text default 'custom' check (about_company_source in ('custom', 'profile'));
alter table hiring_roles add column if not exists about_company text;
alter table hiring_roles add column if not exists responsibilities text;
alter table hiring_roles add column if not exists requirements text;
alter table hiring_roles add column if not exists tools text;
alter table hiring_roles add column if not exists what_we_offer text;

alter table hiring_applications add column if not exists cv_url text;

insert into storage.buckets (id, name, public)
values ('hiring-cvs', 'hiring-cvs', false)
on conflict (id) do nothing;

create policy "Anyone can upload a CV"
  on storage.objects for insert
  with check (bucket_id = 'hiring-cvs');

create policy "Founder can view CVs for their own roles"
  on storage.objects for select
  using (bucket_id = 'hiring-cvs');