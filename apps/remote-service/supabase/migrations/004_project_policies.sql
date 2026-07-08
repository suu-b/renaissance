create table project_policies (
    project_id uuid not null,
    user_id uuid not null,

    allowed_path_prefix text not null,

    can_publish boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    primary key (project_id, user_id),

    foreign key (project_id)
        references projects(id)
        on delete cascade,

    foreign key (user_id)
        references users(id)
        on delete cascade
);