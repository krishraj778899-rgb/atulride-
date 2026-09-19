# AtulRide – Vehicle Rental

This repository contains the complete AtulRide frontend and Node/Express backend.

## Render deployment

- Runtime: Node
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

Set these Render Environment Variables:
- `CASHFREE_ENV=sandbox` for testing
- `CASHFREE_CLIENT_ID`
- `CASHFREE_CLIENT_SECRET`
- `PUBLIC_URL=https://YOUR-RENDER-SERVICE.onrender.com`

Do not upload `.env` or `node_modules` to GitHub. Render installs dependencies from `package.json`.

## Important

The existing frontend pages and booking/payment flow are retained. The backend now also serves the frontend from the same Render service, and `/api/health` can be used to verify the backend is running.
