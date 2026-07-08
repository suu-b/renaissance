create table projects (
    id uuid primary key,

    name text not null,
    description text not null default '',
    is_private boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);