alter table hiring_roles add column if not exists application_fields jsonb default '{
  "cv": {"enabled": true, "mode": "upload_or_link"},
  "cover_letter": {"enabled": false, "mode": "upload_or_link"},
  "portfolio_link": {"enabled": false},
  "linkedin": {"enabled": false},
  "website": {"enabled": false},
  "twitter": {"enabled": false}
}'::jsonb;

alter table hiring_applications add column if not exists cv_link text;
alter table hiring_applications add column if not exists cover_letter_url text;
alter table hiring_applications add column if not exists cover_letter_link text;
alter table hiring_applications add column if not exists portfolio_link text;
alter table hiring_applications add column if not exists linkedin_url text;
alter table hiring_applications add column if not exists website_url text;
alter table hiring_applications add column if not exists twitter_url text;