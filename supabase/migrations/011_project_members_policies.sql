alter table project_members
enable row level security;

create policy maint_can_manage_project_members
on project_members
for all
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'maint'
)
with check (
    auth.jwt() ->> 'user_role' = 'maint'
);


create policy client_can_read_project_members
on project_members
for select
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'client'
    and exists (
        select 1
        from projects
        where projects.id = project_members.project_id
        and projects.is_private = false
    )
);

create policy client_can_read_own_project_members
on project_members
for select
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'client'
    and exists (
        select 1
        from projects
        where projects.id = project_members.project_id
        and projects.owner_id = auth.uid()
    )
);