# User Onboarding

I want to have a very user-first approach to the onboarding. An advantage of this project being a personal project is that I can make user experience my top priority and not worry about business requirements (i.e. money).

As discussed in Principles, I do not want the user to be forced to create an account to use the application. They can use it as soon as they download it. 
The first-launch experience is gracefully simple - 
Welcome -> Get Started -> Workspace Setup -> Application

# Initial Setup

Initialization should be a reconcilliation process - not a one-time script. It should move the application from whatever partial state it is in to a valid state without overwriting or duplicating user data.

The initialization process is two stepped - **Application-level initialization** and **User-level initialization**.

## 1. Application-level initialization
### 1. Create Install Directory
The system has pinned this location to contain all the internals of the application - `export const RENAISSANCE_INSTALL_PATH: string = path.join(app.getPath('userData')`.
`export const RENAISSANCE_RUNTIME_PATH: string = path.join(RENAISSANCE_INSTALL_PATH, 'runtime')` will contain the runtime dependencies (Git and SQLite). 

**Method:** `ensureInstallAndRuntimePaths`

**Desired state:**
- Installation directory exists.
- Runtime directory exists. 

**Reconcilliation:**
- If the directory doesn't exist, create it.
- If exists, leave it alone.
- If a path exists but is a file rather than a directory, report an error.


### 2. Install SQlite
Next, The system will install SQLite and Git. The system has pinned some versions:
```
export const SQLITE_VERSION = '3.50.4'
```
Currently, **No way is planned to migrate versions.** Additionally, I've been looking to replace SQlite with the Node.js bundled library like `node:sqlite`. 
But for now, these are the distributions we are going to use:

We install from the official Windows and Linux distribution of SQlite tools.

**Method:** `ensureSQlite`

**Desired state:**
- The expected SQLite distribution is installed.
- It matches the pinned version.
- It is executable.

**Reconcilliation:**
- If missing, install it (download extract to temp directory).
- If exists and version matches, leave it alone.
- If exists but is invalid or different version, reinstall.
- If download or extraction fails, report the error.

### 3. Install Git
Next, The system will install Git. The system has pinned a version:
```
export const GIT_VERSION = '2.53.0'
```
**Git**: For windows [MinGit](https://gitforwindows.org/mingit.html) and For Linux: [Git Minimal by Baulk](https://github.com/baulk/git-minimal)  

**Method:** `ensureGit`

**Desired state:**
- The expected Git distribution is installed.
- It matches the pinned version.
- It is executable.

**Reconcilliation:**
- If missing, install it (download extract to temp directory).
- If exists and version matches, leave it alone.
- If exists but is invalid or different version, reinstall.
- If download or extraction fails, report the error.

### 4. Startup backend server.
The system will create a user entry inside the `users` table entry for a guest account.

**Method:**
`ensureBackendRuns`

**Desired State:**
The fastify backend is up and listening.

**Reconcilliation:**
- If running already, let it be,
- If not, start it.

This step gives us HTTP access to backend, we can use it to run migrations and do backend stuff.

### 5. Migrations to create base tables
Next, the system will run a migrations to create all the base tables. Check out local schema designs inside inside [database docs](./database).
I will create a simple schema runner file instead of using some ORM because the scale is not that big or complex. 

**Method:**
`ensureBaseTables`

**Desired State:**
The database schema is at the latest migration version supported by this application.

**Reconcilliation:**
1. Ensure the database file and parent directory exist.
2. Open the database.
3. Enable foreign keys on the connection.
4. Ensure the migration tracking table exists.
5. Read applied migration versions.
6. Apply pending migrations in order.
7. Record each successful migration.


### 5. Create a User entry.
The system will create a user entry inside the `users` table entry for a guest account.

**Method:**
`ensureUserEntry`

**Desired State:**
There is at least one user in the users table.

**Reconcilliation:**
- If no user exists in the users table, create a user.
- If there are users, ask user to log in as one of the users.

This step gives us a **user** to go ahead with.


## 2. User-level initialization
### 1. Ensure Workspaces.
The system will create a workspace next. It is a composite set as it will - first, create workspace entry in the database, second, create workspace inside the filesystem. However, in case of orphan workspaces it will reconcile.

**Method:**
`ensureWorkspace`

**Desired State:**
The user has at least one workspace.

**Reconcilliation:**
1. If the user has no workspace records, create the initial workspace (record + fs).
2. If the user has one or more workspace records, reconcile those workspaces. Ask user which workspace to move ahead with.
Refer this table:
| Database record | Filesystem directory | Action                          |
| --------------- | -------------------- | ------------------------------- |
| Exists          | Exists               | Verify and reuse.               |
| Exists          | Missing              | Recreate the directory.         |
| Missing         | Exists               | Identify as an orphan; keep it. |
| Missing         | Missing              | Nothing to reconcile.           |

### 6. Git init.
Lastly, the system will initialize a git repository inside the workspace. `ensureGitInitialized` will do this.

**Method:**
`ensureGitInitialized`

**Desired State:**
The workspace directory contains a valid Git repository rooted at that directory.

**Reconcilliation:**
1. Check whether the workspace is already a Git repository.
2. If it is, verify that its Git root corresponds to the expected workspace directory.
3. If it is valid, do nothing.
4. If it isn't a repository, initialize it using git init.
5. Verify initialization succeeded.

For verification - run `git -C <workspace-path> rev-parse --show-toplevel` and compare the returned path with the expected workspace path.


