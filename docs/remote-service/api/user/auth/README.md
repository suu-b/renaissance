# User Auth Endpoints

## POST `/api/v1/user/auth/register`

Creates a new user.

### Payload

| Field       | Type   | Description                               | Required |
| ----------- | ------ | ----------------------------------------- | ---------|
| email       | string | User email address.                       | Yes      |
| password    | string | User password.                            | Yes      |
| displayName | string | Public display name shown to other users. | Yes      |
| username    | string | Username.                                 | Yes      |

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | UserObject |

---

## POST `/api/v1/user/auth/login`

Logs in a user.

### Payload

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| email | string | User email address. | Yes |
| password | string | User password. | Yes |

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | LoginResponseObject |

## POST `/api/v1/user/auth/refresh`

Refreshes an expired access token using a valid refresh token.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token format: `Bearer <refresh_token>` |

### Payload

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| refreshToken | string | Refresh token issued during login. | Yes |

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | SessionObject |