create table users (
    id uuid primary key,
    username text not null unique,
    display_name text not null,
    avatar_url text not null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);