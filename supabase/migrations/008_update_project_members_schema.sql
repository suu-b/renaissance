-- Update project_members table to match DBML schema
-- Remove role column, update foreign key to reference projects.owner_id instead of projects.id

-- Remove role column and its check constraint
alter table project_members drop constraint if exists project_members_role_check;
alter table project_members drop column if exists role;

-- Update foreign key to reference projects.owner_id instead of projects.id
alter table project_members drop constraint if exists project_members_project_id_fkey;
alter table project_members 
  add constraint project_members_project_id_fkey 
  foreign key (project_id) 
  references projects(owner_id) 
  on delete cascade;
