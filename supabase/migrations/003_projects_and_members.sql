create table project_members (
    project_id uuid not null,
    user_id uuid not null,

    role text not null
        check (role in ('owner', 'author')),

    joined_at timestamptz not null default now(),

    primary key (project_id, user_id),

    foreign key (project_id)
        references projects(id)
        on delete cascade,

    foreign key (user_id)
        references users(id)
        on delete cascade
);