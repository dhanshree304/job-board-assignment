# JobBoard

A full-stack job board built on the MERN stack (MongoDB, Express, React, Node) with two roles — **employers** who post and manage job listings, and **job seekers** who search, apply, and track applications.

- 📄 [Feature list](docs/FEATURES.md) — everything the app does, by role
- 🔌 [API reference](docs/API.md) — every endpoint, request/response shape, and error case
- 🏗️ [Architecture](docs/ARCHITECTURE.md) — system design, data model, and key decisions
- 🚀 [Deployment guide](docs/DEPLOYMENT.md) — Vercel + MongoDB Atlas + GitHub Actions, step by step

## Tech stack

| Layer    | Choice                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, React Hook Form + Zod |
| Backend  | Node.js, Express, TypeScript, Mongoose (MongoDB), JWT auth, Multer                                     |
| Testing  | Jest + Supertest + mongodb-memory-server (server), `tsc --noEmit` (both)                               |
| CI/CD    | GitHub Actions → Vercel (client as static SPA, server as Node serverless functions)                    |

## Project structure

```
job-board/
├─ client/              React + Vite frontend
│  └─ src/
│     ├─ api/           axios calls per resource (auth, jobs, applications)
│     ├─ components/    ui/ (design system), layout/, jobs/, applications/
│     ├─ hooks/         useAuth, useSavedJobs, useDebouncedValue
│     ├─ pages/         one file per route
│     ├─ routes/        ProtectedRoute / GuestRoute guards
│     ├─ store/         Zustand stores (auth, theme)
│     └─ types/         shared TS types mirroring the API
├─ server/              Express + TypeScript API
│  ├─ api/index.ts       Vercel serverless entry point
│  └─ src/
│     ├─ config/         env loading, DB connection
│     ├─ controllers/    request/response handlers
│     ├─ middleware/     auth, error handling, file upload
│     ├─ models/         Mongoose schemas (User, Job, Application, SavedJob)
│     ├─ routes/         Express routers
│     └─ validators/     Zod request schemas
│  └─ tests/             Jest + Supertest integration tests
├─ .github/workflows/    CI/CD pipeline
└─ docs/                 Feature, API, architecture, deployment docs
```

## Quick start (local development)

### Prerequisites

- Node.js 20+
- A MongoDB instance — either [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) or a local/Docker MongoDB

```bash
# Optional: run MongoDB locally via Docker
docker run -d --name job-board-mongo -p 27017:27017 mongo:7
```

### 1. Server

```bash
cd server
cp .env.example .env
# edit .env — set MONGODB_URI (and JWT_SECRET for anything beyond local dev)
npm install
npm run seed   # optional: creates demo employer/jobseeker accounts + sample jobs
npm run dev    # starts the API on http://localhost:5000
```

Seeded demo accounts (after `npm run seed`):

| Role       | Email             | Password     |
| ---------- | ----------------- | ------------ |
| Employer   | employer@demo.io  | password@123 |
| Job seeker | jobseeker@demo.io | password@123 |

### 2. Client

```bash
cd client
cp .env.example .env   # VITE_API_URL defaults to http://localhost:5000/api
npm install
npm run dev             # starts the app on http://localhost:5173
```

The Vite dev server also proxies `/api/*` to `http://localhost:5000`, so `VITE_API_URL` can be left unset for local development.

### 3. Run tests

```bash
cd server
npm test        # Jest + Supertest, against an in-memory MongoDB — no external DB needed
```

### 4. Production builds

```bash
cd server && npm run build   # compiles to server/dist
cd client && npm run build   # builds static assets to client/dist
```

## Deployment

This repo is set up to deploy the client and server as **two separate Vercel projects** (client → static SPA, server → Node serverless functions), wired to a GitHub Actions pipeline that runs tests/builds on every push and deploys `main` automatically once Vercel credentials are configured as repo secrets.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full walkthrough.

## License

MIT
