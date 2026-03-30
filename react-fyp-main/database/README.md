## Database bootstrap

This folder recreates a runnable MySQL 8 demo database for the project.

### Files

- `schema.sql`: creates tables, indexes, and the compatibility view `item_classification_attribute`
- `seed.sql`: inserts showcase data, demo accounts, AI settings, requests, comments, and donation samples

### Notes

- Default database name in the scripts is `react_fyp_demo`.
- If you want a different database name, change the `CREATE DATABASE` and `USE` lines at the top of `schema.sql`.
- `user_donate_item_details` keeps a starter set of dynamic attribute columns based on the seeded classifications. The admin attribute editor can still add more columns later through the existing API.
- The app now expects `ai_image_setting` and lowercase `comment` table names.

### Demo credentials

- Admin: `admin01` / `Admin123!`
- Root admin: `root` / `Admin123!`
- User examples: `user01`, `user02`, `user03`, `user04` / `User123!`
