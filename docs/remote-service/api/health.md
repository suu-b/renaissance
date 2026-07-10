# Health Check Endpoints

## GET `/api/v1/health`

Verifies that the Remote Service is running and healthy.

### Headers

None required.

### Response

Returns a list containing the service health status.

| Field | Type | Description |
|-------|------|-------------|
| health | string | Indicates the health status (e.g. `"awesome!"`). |

#### Example Response Body:
```json
[
    {
        "health": "awesome!"
    }
]
```
