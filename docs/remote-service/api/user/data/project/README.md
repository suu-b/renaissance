# User Scoped Project Data Endpoints

## POST `/api/v1/user/data/project/search`

Fetches projects owned by the user matching the query.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token format: `Bearer <access_token>` |

### Payload

SearchProjectRequestObject

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | array[ProjectObject] |

---

## POST `/api/v1/user/data/project/new`

Creates a new project.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token format: `Bearer <access_token>` |

### Payload

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| name | string | Yes | Name of the project. | N.A. |
| description | string | No | Description of the project. | `""` |
| isPrivate | boolean | No | Whether the project should be private. | `true` |

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | ProjectObject |