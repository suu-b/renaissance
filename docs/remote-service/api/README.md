# API Documentation

All endpoints are prefixed with `/api/v1`.

### Endpoint Groups:

* **[Health Check](health.md)**
  * `GET /health` - Service health verification
* **[User Authentication](user/auth/README.md)**
  * `POST /user/auth/register` - Create user account
  * `POST /user/auth/login` - Sign in user
  * `POST /user/auth/refresh` - Refresh active token
* **User Data**
  * **[Projects](user/data/project/README.md)**
    * `POST /user/data/project/search` - Search user projects
    * `POST /user/data/project/new` - Create project
* **Global Data**
  * **[Projects](global/data/project/README.md)**
    * `POST /global/data/project/search` - Search global projects
    * `GET /global/data/project/:id` - Fetch project details
  * **[Users](global/data/user/README.md)**
    * `POST /global/data/user/search` - Search global users
    * `GET /global/data/user/:id` - Get user details
    * `GET /global/data/user/by-username/:username` - Get user by username

> **Note:** For abbreviations, see `docs/abbreviations.md`.