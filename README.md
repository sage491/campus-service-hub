# Campus Service Hub

Campus Service Hub is a MERN application foundation for managing university service requests. This milestone provides the frontend shell and the backend API base; authentication and service modules are intentionally not included yet.

## Requirements

- Node.js 20 or later
- npm 10 or later
- MongoDB Atlas connection string (optional for this milestone; required once persistence is added)

## Setup

Copy `.env.example` to `.env` in the project root and set `JWT_SECRET`. Add `MONGODB_URI` when a MongoDB database is available.

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

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port. Defaults to `5000`. |
| `MONGODB_URI` | MongoDB Atlas connection string. Optional until database features are added. |
| `JWT_SECRET` | Reserved for the authentication milestone. Use a long random value. |
| `CLIENT_URL` | Frontend origin allowed by CORS. |
| `VITE_API_URL` | Optional production API URL for the frontend. |

## Current API

`GET /api/health` returns the API status and MongoDB connection state.

## Next step

Implement the User model, password hashing, JWT authentication, and role-aware protected routes.
