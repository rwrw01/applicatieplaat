# Database Schema
- **Naming:** snake_case for columns/tables. Use plural names for tables.
- **Integrity:** Enforce foreign keys and constraints at the DB level.
- **Migrations:** Never modify the DB manually. Always author a migration script.
- **Performance:** Index columns used in `WHERE`, `JOIN`, or `ORDER BY` clauses.
- **Audit:** Every table must include `created_at` and `updated_at` timestamps.