# Campus Service Hub

Campus Service Hub is a MERN application for managing university service requests. It currently includes the frontend shell, secure student registration and login, user profiles, session logout, and backend role authorization.

## Requirements

- Node.js 20 or later
- npm 10 or later
- MongoDB Atlas connection string (optional for this milestone; required once persistence is added)

## Setup

Copy `.env.example` to `.env` in the project root and set `JWT_SECRET` and `MONGODB_URI`. MongoDB is required for registration and all Campus Service Hub data.

Install dependencies:

```powershell
cd frontend; npm install
cd ../backend; npm install
```

Run the backend:

```powershell
cd backend
npm run dev
```

Run the frontend in a separate terminal:

```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173`. The browser client requests `/api/health` through the Vite proxy during development.

Run the API integration verification:

```powershell
cd backend
npm run test:api
```

The verifier launches a temporary MongoDB instance, sends real HTTP requests to the API, and cleans up its test database afterward. The first run downloads the MongoDB executable used by the test.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port. Defaults to `5000`. |
| `MONGODB_URI` | MongoDB Atlas connection string. Required for authentication and Campus Service Hub data. |
| `JWT_SECRET` | Reserved for the authentication milestone. Use a long random value. |
| `CLIENT_URL` | Frontend origin allowed by CORS. |
| `VITE_API_URL` | Optional production API URL for the frontend. |

## Current API

`GET /api/health` returns the API status and MongoDB connection state.

## Authentication API

- `POST /api/auth/register` creates a student account only, regardless of any role submitted by a client.
- `POST /api/auth/login` returns a seven-day JWT session by default.
- `GET /api/auth/me`, `PATCH /api/auth/me`, and `POST /api/auth/logout` require a Bearer token.
- `POST /api/users` is restricted to authenticated administrators and provisions student, faculty, or administrator accounts.

Passwords are bcrypt hashed and omitted from all responses. Logout invalidates active JWTs for that user.

## Campus service API

All endpoints below require a Bearer token and persist records in MongoDB.

- `GET/POST /api/requests` lists role-scoped requests or creates a student request. Supports `page`, `limit`, `q`, `status`, `category`, and `priority` filters.
- `GET /api/requests/:id` and `GET /api/requests/:id/history` validate request ownership or assignment.
- `PATCH /api/requests/:id/assign` is administrator-only; `PATCH /api/requests/:id/status` and `POST /api/requests/:id/resolution-notes` are available to the assigned faculty member or an administrator.
- `GET/POST /api/notices` lists relevant notices or creates an administrator draft. `PATCH /api/notices/:id/publish` publishes it and creates in-app notifications.
- `POST /api/feedback` accepts student feedback; `GET /api/feedback` is administrator-only.
- `GET /api/notifications`, `PATCH /api/notifications/:id/read`, and `PATCH /api/notifications/read-all` manage a user's notification feed.
- `GET/POST /api/departments` lists active departments or creates one as an administrator.

## Next step

Implement department administration and the campus service-request workflow.
