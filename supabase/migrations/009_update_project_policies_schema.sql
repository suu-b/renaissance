-- Update project_policies table to match DBML schema
-- Update foreign key to reference projects.owner_id instead of projects.id

-- Update foreign key to reference projects.owner_id instead of projects.id
alter table project_policies drop constraint if exists project_policies_project_id_fkey;
alter table project_policies 
  add constraint project_policies_project_id_fkey 
  foreign key (project_id) 
  references projects(owner_id) 
  on delete cascade;
