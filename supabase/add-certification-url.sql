-- Run once in Supabase SQL Editor if certifications table already exists.
alter table certifications add column if not exists url text;
