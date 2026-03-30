# Baby Item Donation Admin Platform

This repository is a showcase-ready refactor of a baby-item donation admin platform. The goal of the cleanup was to keep the existing Express/MySQL API contract stable while making the codebase easier to review in interviews and easier to boot from an empty environment.

## Stack

- Frontend: React 18, Vite, Vitest, Ant Design
- Backend: Express 5, MySQL 8, `mysql2`, JWT, Multer
- Database bootstrap: `database/schema.sql` + `database/seed.sql`

## Repository Layout

- `client/`: admin dashboard, now migrated from CRA to Vite
- `server/`: modularized API entry and domain routers
- `database/`: runnable MySQL schema and demo seed data

## Backend Architecture

- `server/src/app/`: app bootstrap and dependency context
- `server/src/config/`: env parsing, db pool, uploads
- `server/src/middleware/`: JWT auth middleware
- `server/src/utils/`: shared helpers such as password and ffmpeg wrapper
- `server/src/domains/`:
  - `auth`
  - `admin-users`
  - `donations-classification`
  - `announcements`
  - `violations-ai`
  - `analysis-maps`
  - `requests-reviews`
  - `realtime`

## Frontend Architecture

- `client/src/app/`: top-level route composition
- `client/src/shared/api/`: centralized axios instance and URL normalization
- `client/src/shared/auth/`: session storage, auth context, protected routes
- `client/src/shared/config/`: API base URL, AI service URL, asset helpers
- `client/legacy/`: removed test/demo pages that should not appear in the interview build

## Database Bootstrap

1. Create a MySQL 8 database user with permission to create tables.
2. Run `database/schema.sql`.
3. Run `database/seed.sql`.
4. Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME=react_fyp_demo` in `server/.env`.

The schema recreates the tables used by the current codebase, including the compatibility view `item_classification_attribute`. `user_donate_item_details` starts with a seed-friendly set of dynamic attribute columns so the existing classification editor and donation flows work without the lost historical schema dump.

## Demo Accounts

- Root admin: `root` / `Admin123!`
- Admin: `admin01` / `Admin123!`
- Users: `user01`, `user02`, `user03`, `user04` / `User123!`

## Environment Setup

1. Copy `server/.env.example` to `server/.env`.
2. Copy `client/.env.example` to `client/.env`.
3. Fill the required values:
   - `server/.env`: database, JWT, upload directories, optional Google Maps/Azure Speech/AI service, optional `FFMPEG_PATH`
   - `client/.env`: `VITE_API_BASE_URL`, `VITE_AI_SERVICE_URL`, `VITE_GOOGLE_MAPS_API_KEY`

The client still accepts legacy `REACT_APP_*` variables as fallback during migration, but new setup should use `VITE_*`.

## Local Development

1. Install dependencies:
   - `cd server && npm install`
   - `cd client && npm install`
2. Start the backend:
   - `cd server && npm start`
3. Start the frontend:
   - `cd client && npm run dev`

## Quality Checks

- Frontend lint: `cd client && npm run lint`
- Frontend tests: `cd client && npm run test -- --run`
- Frontend build: `cd client && npm run build`
- Backend tests: `cd server && npm test`

## Security and Maintenance Notes

- JWT secret is loaded from `.env`.
- User passwords are now stored with bcrypt; legacy plain-text user passwords are upgraded automatically on successful login.
- Azure Speech, Google Maps, and AI service URLs are no longer hardcoded in source.
- `mysql` was replaced with `mysql2`.
- `fluent-ffmpeg`, `express-jwt`, and `node-jose` were removed.
- `npm audit` is clean for both `client` and `server` in the current lockfiles.

## Optional Services

- Google Maps: if `VITE_GOOGLE_MAPS_API_KEY` or `GOOGLE_MAPS_API_KEY` is missing, map-related admin views fall back to a visible "not configured" state.
- AI service: text/image moderation test tools and recommendation endpoints expect a separate AI service defined by `AI_SERVICE_BASE_URL` and `VITE_AI_SERVICE_URL`.
- Azure Speech: speech-to-text requires `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`.

## Compatibility Notes

- Existing API paths and main response fields were preserved to avoid breaking the current admin client and existing mobile consumers.
- The focus of this refactor is maintainability, interview presentation quality, and empty-environment recoverability, not a full domain redesign.
