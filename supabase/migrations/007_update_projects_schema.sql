-- Update projects table to match DBML schema
-- Add owner_id as primary key and user foreign key, add is_private column

-- Add new columns
alter table projects 
  add column if not exists owner_id uuid,
  add column if not exists user uuid references users(id) on delete cascade;

-- Data migration: set owner_id to existing id for existing projects
update projects set owner_id = id, user = (select user_id from project_members pm where pm.project_id = projects.id and pm.role = 'owner' limit 1) where owner_id is null;

-- If no owner found from project_members, set a default (you'll need to handle this properly)
update projects set owner_id = id where owner_id is null;
update projects set user = owner_id where user is null;

-- Add not null constraints
alter table projects 
  alter column owner_id set not null,
  alter column user set not null;

-- Change primary key from id to owner_id
do $$
begin
  if exists (
    select 1 from pg_constraint 
    where conname = 'projects_pkey'
  ) then
    alter table projects drop constraint projects_pkey;
  end if;
end $$;
alter table projects add primary key (owner_id);

-- Add is_private column if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'projects' and column_name = 'is_private'
  ) then
    alter table projects 
    add column is_private boolean not null default false;
  end if;
end $$;

-- Remove old id column (after ensuring data migration is complete)
-- Note: You may want to keep id as a regular column for backwards compatibility
-- alter table projects drop column id;
