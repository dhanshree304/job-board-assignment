# Architecture

## System overview

```
┌─────────────────────┐        HTTPS / JSON        ┌──────────────────────────┐
│   client (Vercel)   │ ───────────────────────────▶│   server (Vercel Node    │
│  React + Vite SPA   │◀─────────────────────────── │   serverless functions)  │
└─────────────────────┘                              └────────────┬─────────────┘
                                                                    │ Mongoose
                                                                    ▼
                                                          ┌───────────────────┐
                                                          │   MongoDB Atlas    │
                                                          └───────────────────┘
```

The client and server are deployed as **two independent Vercel projects** rather than one monolith. This keeps the SPA's static hosting/CDN behavior separate from the API's serverless function behavior, and lets each scale, redeploy, and roll back independently — the tradeoff is CORS configuration between them (handled via `CLIENT_ORIGIN` on the server) instead of same-origin requests.

## Why serverless Express on Vercel

The server is a normal Express app (`server/src/app.ts`) that runs identically in three contexts:

1. **Local dev** (`server/src/index.ts`) — a standard long-running `app.listen()` process.
2. **Tests** (`server/tests/`) — the same `createApp()` factory, driven by Supertest, against an in-memory MongoDB.
3. **Vercel** (`server/api/index.ts`) — the same Express app wrapped in a single serverless function handler.

Keeping one Express app and three thin entry points avoids duplicating routing/middleware logic per environment. The Mongo connection (`config/db.ts`) is memoized across invocations so a warm serverless function reuses its existing connection instead of reconnecting on every request.

## Data model

| Model | Purpose | Key fields |
| --- | --- | --- |
| `User` | Employers and job seekers share one collection, discriminated by `role`. | `role`, `email` (unique), `password` (bcrypt-hashed, `select: false`), plus role-specific fields (`headline`/`skills` for job seekers, `company` for employers) |
| `Job` | A posting owned by exactly one employer. | `employer` (ref), `status` (`open`/`closed`), `applicantsCount` (denormalized counter, incremented on apply), text index on `title`/`companyName`/`description`/`tags` for search |
| `Application` | One job seeker's application to one job. | Compound unique index on `(job, applicant)` — the DB itself enforces "one application per job per person," the API's `409` check is a friendlier pre-check on top of that guarantee. `resume` is embedded (see below). |
| `SavedJob` | A job seeker's bookmark. | Compound unique index on `(user, job)`, same toggle-safe pattern as `Application`. |

## Resume storage: embedded in MongoDB, not S3

Resumes (PDF/Word, capped at 5 MB) are stored as a `Buffer` directly on the `Application` document rather than in a separate object store like S3/Cloudinary.

**Why**: Vercel serverless functions have an ephemeral, read-only-outside-`/tmp` filesystem, so writing uploaded files to local disk wouldn't survive between invocations or requests. Standing up and configuring an external object store is the "correct at scale" answer, but adds an account, a bucket, IAM/API credentials, and another failure mode — undesirable for a self-contained take-home-style project with no existing cloud storage account to hand. MongoDB's 16 MB document limit comfortably fits a 5 MB resume cap, so this stores and serves resumes with zero extra infrastructure and identical behavior in local dev, tests, and production.

**Tradeoff**: this doesn't scale to large attachments or very high volume the way a dedicated object store does. If resume sizes or traffic grew significantly, the natural next step is swapping the `resume: Buffer` field for a `resume: { url }` field backed by S3/Cloudinary, behind the same `GET /applications/:id/resume` contract — the API shape wouldn't need to change, only the implementation of `getResumeFile`.

## Auth

Stateless JWT auth: `POST /auth/login` or `/auth/register` returns a signed token (`{ sub: userId, role }`), which the client stores (via a persisted Zustand store) and attaches as `Authorization: Bearer <token>` on every request (`client/src/api/client.ts` axios interceptor). The server's `requireAuth` middleware verifies the signature and re-fetches the user (so a deleted/changed account is rejected even with a still-valid token). `requireRole(...)` middleware layers on top for role gating, and controllers do ownership checks (`job.employer.toString() === req.user.id`) for anything scoped to a specific employer's resources.

On the client, an axios response interceptor clears the session on any `401`, and route guards (`ProtectedRoute`, `GuestRoute`) redirect based on the current auth state — reactively, since they read from the same Zustand store the interceptor writes to.

## Request/response validation

Every mutating endpoint validates its input with a [Zod](https://zod.dev) schema (`server/src/validators/`) before touching the database. A shared error handler (`middleware/errorHandler.ts`) turns `ZodError`s into a consistent `400` with per-field messages, `AppError` subclasses into their mapped status codes, and Mongo duplicate-key errors (`code 11000`) into `409`s — so controllers stay focused on business logic and never hand-roll error responses.

## Testing strategy

Server tests (`server/tests/integration/`) run against `mongodb-memory-server` — a real MongoDB engine spun up in-process, not a mock — so indexes, unique constraints, and validation all behave exactly as they would against Atlas, with no external dependency and no shared test-database contention in CI. Coverage focuses on the behaviors most likely to have real bugs: auth (registration/login/duplicate email), ownership enforcement (an employer can't touch another employer's job), the apply flow (resume required, duplicate-apply blocked), and the saved-jobs toggle.

The client is verified via `tsc --noEmit` (routes/props/API contracts are all typed end-to-end from the shared `types/`) and a production `vite build`; see the root README for how it was manually exercised end-to-end against the live API during development.
