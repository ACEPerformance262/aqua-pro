-- AquaPro — track staff login activity
alter table staff add column if not exists last_login_at timestamptz;
