-- ============================================
-- Users
-- ============================================

INSERT INTO users (
    id,
    username,
    display_name,
    avatar_url
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'alice',
    'Alice',
    'https://example.com/alice.png'
),
(
    '22222222-2222-2222-2222-222222222222',
    'bob',
    'Bob',
    'https://example.com/bob.png'
),
(
    '33333333-3333-3333-3333-333333333333',
    'charlie',
    'Charlie',
    'https://example.com/charlie.png'
);

-- ============================================
-- Projects
-- ============================================

INSERT INTO projects (
    id,
    name,
    description,
    is_private
)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'The Odyssey',
    'A collaborative novel.',
    false
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Poetry Collection',
    'A collection of poems.',
    true
);

-- ============================================
-- Project Members
-- ============================================

INSERT INTO project_members (
    project_id,
    user_id,
    role
)
VALUES
-- Project 1
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'owner'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'author'
),

-- Project 2
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'owner'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'author'
),

-- Charlie contributes to Project 1
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'author'
);

-- ============================================
-- Publish Policies
-- ============================================

INSERT INTO project_policies (
    project_id,
    user_id,
    allowed_path_prefix,
    can_publish
)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'alice/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    true
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'alice/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    true
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'alice/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    true
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'bob/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    true
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'bob/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    true
);