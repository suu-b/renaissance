# User Scoped Repository Data Endpoints

## POST `/api/v1/user/data/repo/init/local`

Initializes a local repository on the user's machine.

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | InitResponseObject |

---

## POST `/api/v1/user/data/repo/init/remote`

Initializes a remote repository in the CGS.

### Response

| Field | Type |
|-------|------|
| response | CARObject |
| response.data | InitResponseObject |

> A typical UI action invokes both `/init/local` and `/init/remote` sequentially. If remote initialization fails, the local repository remains intact. The UI should inform the user and allow retrying `/init/remote` independently.
