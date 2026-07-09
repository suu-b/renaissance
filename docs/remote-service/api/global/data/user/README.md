# Global User Data Endpoints

## POST `/api/v1/global/data/user/search`

Fetches globally accessible users matching the query.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token format: `Bearer <access_token>` |

### Payload

SearchUserRequestObject (see [objects.md](../../../../../commons/objects.md))

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | array[UserObject] |

---

## GET `/api/v1/global/data/user/{id}`

Fetches details of a user profile by their ID.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token format: `Bearer <access_token>` |

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | UserObject |

### Errors

| Error Code | Description |
|------------|-------------|
| USER_NOT_FOUND | Requested user does not exist. |

---

## GET `/api/v1/global/data/user/by-username/{username}`

Fetches details of a user profile by their username.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token format: `Bearer <access_token>` |

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | UserObject |

### Errors

| Error Code | Description |
|------------|-------------|
| USER_NOT_FOUND | Requested user does not exist. |
