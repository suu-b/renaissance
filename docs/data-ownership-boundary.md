# Data Ownership Boundary
(Currently scoped till local only).

The data is ownership is currently divided between SQLite and Git. Broadly, **Git** owns the content while **SQLite** owns the application-level metadata.

| Responsibility          | SQLite                       | Git                         |
| ----------------------- | ---------------------------- | --------------------------- |
| User profiles           | Yes                          | No                          |
| Workspaces              | Metadata                     | Boundary                    |
| Projects                | Metadata                     | Boundary                    |
| Branches                | Metadata                     | Actual branches and history |
| Chapters                | Metadata                     | Actual chapter content      |
| Content history         | No                           | Yes                         |
| Timeline                | No                           | Yes                         |
| Application preferences | Yes                          | No                          |

- Content History means the actual content's evolution which occurs during merging processes.
- Timeline is the commit history or milestones the user would log.

