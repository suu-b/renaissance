-- Update users table to match DBML schema
-- Add missing columns: name, email, city, country_code, created_at, updated_at
-- Remove: display_name, avatar_url (replaced with name, avatar)

-- Add new columns
alter table users 
  add column if not exists name text not null default '',
  add column if not exists email text unique,
  add column if not exists city text,
  add column if not exists country_code char(2),
  add column if not exists avatar text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Data migration: move display_name to name, avatar_url to avatar
update users set name = display_name where display_name is not null;
update users set avatar = avatar_url where avatar_url is not null;

-- Add constraints for email uniqueness if not null
-- First, set unique placeholder values for any NULL emails to satisfy NOT NULL constraint
update users set email = 'temp_' || id || '@placeholder.com' where email is null;
alter table users 
  alter column email set not null;

-- Drop old columns
alter table users 
  drop column if exists display_name,
  drop column if exists avatar_url;
