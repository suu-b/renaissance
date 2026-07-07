# Tasks & Defects

This document tracks known issues, architecture defects, and tasks for the Renaissance API.

## Defect Table

| Defect ID | Description | Priority | Status |
| :--- | :--- | :--- | :--- |
| DEF-001 | **CGS Access Control & Isolation**: Shared CGS monorepo lacks security boundary/write isolation per user directory. | **P1** | Open |
| DEF-002 | **CGS Scalability & Repository Size**: Git history of a single monorepo expands rapidly with user/file growth, requiring local sparse checkouts. | **P4** | Open |
