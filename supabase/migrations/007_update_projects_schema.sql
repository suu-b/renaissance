-- Update projects table to match DBML schema
-- Add owner_id as foreign key to users, keep id as primary key

-- Add new columns
alter table projects 
  add column if not exists owner_id uuid references users(id) on delete cascade;

-- Data migration: set owner_id from project_members where role is 'owner'
update projects set owner_id = (select user_id from project_members pm where pm.project_id = projects.id and pm.role = 'owner' limit 1) where owner_id is null;

-- If no owner found from project_members, set a default (you'll need to handle this properly)
update projects set owner_id = id where owner_id is null;

-- Add not null constraint
alter table projects 
  alter column owner_id set not null;

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
