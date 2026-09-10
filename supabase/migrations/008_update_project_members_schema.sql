-- Update project_members table to match DBML schema
-- Remove role column (no longer needed with owner_id in projects table)

-- Remove role column and its check constraint
alter table project_members drop constraint if exists project_members_role_check;
alter table project_members drop column if exists role;
