alter table project_policies
enable row level security;

create policy maint_can_manage_project_policies
on project_policies
for all
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'maint'
)
with check (
    auth.jwt() ->> 'user_role' = 'maint'
);
