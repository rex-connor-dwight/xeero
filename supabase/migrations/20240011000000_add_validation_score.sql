alter table profiles
add column if not exists validation_score integer;

alter table profiles
add column if not exists validation_band text;

alter table profiles
add column if not exists validation_answers jsonb;