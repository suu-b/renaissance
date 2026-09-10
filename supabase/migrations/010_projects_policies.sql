alter table projects
enable row level security;

create policy maint_can_manage_projects
on projects
for all
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'maint'
)
with check (
    auth.jwt() ->> 'user_role' = 'maint'
);

-- clients can read their own projects
create policy client_can_read_own_projects
on projects
for select
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'client'
    and auth.uid() = owner_id
);
create policy client_can_insert_own_projects
on projects
for insert
to authenticated
with check (
    auth.jwt() ->> 'user_role' = 'client'
    and auth.uid() = owner_id
);
create policy client_can_update_own_projects
on projects
for update
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'client'
    and auth.uid() = owner_id
)
with check (
    auth.jwt() ->> 'user_role' = 'client'
    and auth.uid() = owner_id
);
create policy client_can_delete_own_projects
on projects
for delete
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'client'
    and auth.uid() = owner_id
);

