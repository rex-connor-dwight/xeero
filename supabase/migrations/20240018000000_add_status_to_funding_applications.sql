alter table funding_applications
add column if not exists status text default 'pending';