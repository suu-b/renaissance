-- create user role
create type user_role as enum (
    'maint',
    'client'
);

alter table users
add column user_role user_role not null default 'client';


alter table users
enable row level security;


-- maint can crud any user
create policy maint_can_select_users
on users
for all
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'maint'
) 
with check (
    auth.jwt() ->> 'user_role' = 'maint'
);


-- clients can only read and update themselves
create policy client_can_select_own_user
on users
for select
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'client'
    and auth.uid() = id
);
create policy client_can_update_own_user
on users
for update
to authenticated
using (
    auth.jwt() ->> 'user_role' = 'client'
    and auth.uid() = id
)
with check (
    auth.jwt() ->> 'user_role' = 'client'
    and auth.uid() = id
    and user_role = 'client'
);