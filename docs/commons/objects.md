# Objects
Objects are reusable data models used across the API.

## CARObject

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| success | boolean | Yes | Whether the request was successful. |
| error | ErrorObject | No | Present only when `success = false`. |
| data | any | No | Requested data. Omitted or `null` when no data is returned. |

---

## ErrorObject

| Field | Type | Description |
|-------|------|-------------|
| code | string | Stable machine-readable error code. |
| message | string | Human-readable error description. |

---

## SearchProjectRequestObject

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| includePrivate | boolean | No | Include private projects. | `true` |
| limit | integer | No | Maximum number of results. | `25` |
| offset | integer | No | Pagination offset. | `0` |
| sort | SortObject | No | Sort configuration. | `{ field: "updatedAt", order: "desc" }` |
| filters | array[FilterObject] | No | List of filter expressions. | `[]` |
| fields | array[string] | No | Fields to include in the response. | `[]` |

---

## SearchUserRequestObject

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| limit | integer | No | Maximum number of results. | `25` |
| offset | integer | No | Pagination offset. | `0` |
| sort | SortObject | No | Sort configuration. | `{ field: "username", order: "asc" }` |
| filters | array[FilterObject] | No | List of filter expressions. | `[]` |
| fields | array[string] | No | Fields to include in the response. | `[]` |

---

## SortObject

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field | string | Yes | Field to sort by. |
| order | string | Yes | `asc` or `desc`. |

---

## FilterObject

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| field | string | Yes | Attribute to filter on. |
| operator | string | Yes | Comparison operator. |
| value | any | Yes | Comparison value. |

---

## ProjectObject

| Field | Type | Description |
|-------|------|-------------|
| id | string | Project identifier. |
| name | string | Project name. |
| description | string | Project description. |
| isPrivate | boolean | Whether the project is private. |
| updatedAt | DateTime | Last update timestamp. |
| createdAt | DateTime | Creation timestamp. |
| authors | array[UserObject] | Authors of the project. |

---

## UserObject

| Field       | Type          | Description                 |
| ----------- | ------------- | --------------------------- |
| id          | string        | User identifier.            |
| username    | string        | Username.                   |
| displayName | string        | Public display name.        |
| email       | string        | User email address.         |
| avatarUrl   | string        | User avatar.                |
| createdAt   | DateTime      | Account creation timestamp. |


---

## InitResponseObject

| Field | Type | Description |
|-------|------|-------------|
| repositoryPath | string | Filesystem path of the initialized repository. |
| createdAt | DateTime | Initialization timestamp. |

---

## LoginResponseObject

| Field   | Type          | Description             |
| ------- | ------------- | ----------------------- |
| user    | UserObject    | Authenticated user.     |
| session | SessionObject | Authentication session. |

## SessionObject

| Field        | Type     | Description                              |
| ------------ | -------- | ---------------------------------------- |
| accessToken  | string   | JWT used for authenticated requests.     |
| refreshToken | string   | Token used to obtain a new access token. |
| expiresAt    | DateTime | Expiration time of the access token.     |



