# Module 1: Category Management System

## Objective
Deliver the mandatory first module for organizing products into admin-managed categories.

## End-user Steps
1. Sign in as admin with `admin@aureon.com / Admin@123`.
2. Open `/admin/categories`.
3. Create a category with name and description.
4. Review the dashboard table to see product counts.
5. Edit a category from the table.
6. Deactivate a category and confirm the soft-delete warning.

## Notes
- Deactivation uses `status = false`; records remain in the database.
- Product counts are shown directly in the admin table.
- Only admins can access category mutation APIs.
- Category data is stored in the local MySQL database.

## Screenshot Checklist
- `docs/screenshots/module-1-category-dashboard.png`
- `docs/screenshots/module-1-category-confirmation.png`
