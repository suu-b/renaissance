# Global Project Data Endpoints 

## POST `/api/v1/global/data/project/search`

Fetches globally accessible projects matching the query.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token format: `Bearer <access_token>` |

### Payload

SearchProjectRequestObject

Additional fields:

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| includeUserProjects | boolean | No | Include the authenticated user's projects. | `false` |

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | array[ProjectObject] |

---

## GET `/api/v1/global/data/project/{id}`

Fetches details of a project visible to the authenticated user.

### Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| Authorization | string | Yes | Bearer token format: `Bearer <access_token>` |

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | ProjectObject |

### Errors

| Error Code | Description |
|------------|-------------|
| PROJECT_NOT_FOUND | Requested project does not exist or is not accessible. |