# API Reference

Base URL: `http://localhost:5000/api` (local) or `https://<your-server-project>.vercel.app/api` (deployed).

All request/response bodies are JSON unless noted otherwise. Authenticated endpoints require an `Authorization: Bearer <token>` header, where `<token>` is the JWT returned by register/login.

Error responses share a common shape:

```json
{ "message": "Human-readable error message" }
```

Validation errors (400) additionally include a field-level breakdown:

```json
{
  "message": "Validation failed",
  "errors": [{ "path": "email", "message": "Invalid email" }]
}
```

---

## Auth

### `POST /auth/register`

Create an account. `role` is `"employer"` or `"jobseeker"`.

**Body**

```json
{
  "name": "Jordan Lee",
  "email": "jordan@example.com",
  "password": "password@123",
  "role": "jobseeker",
  "company": { "name": "Acme Corp", "website": "https://acme.example" }
}
```

`company` is only meaningful (and optional) when `role` is `"employer"`.

**201** → `{ "token": "...", "user": { ...publicUser } }`
**400** invalid payload · **409** email already registered

### `POST /auth/login`

**Body**: `{ "email": "...", "password": "..." }`
**200** → `{ "token": "...", "user": { ...publicUser } }`
**401** invalid credentials

### `GET /auth/me` 🔒

**200** → `{ "user": { ...publicUser } }`

### `PATCH /auth/me` 🔒

Partial update. Job seekers can set `name`, `headline`, `location`, `skills` (string array). Employers can set `name`, `company.{name,website,about}`.

**200** → `{ "user": { ...publicUser } }`

---

## Jobs

### `GET /jobs`

Public. List **open** jobs with search/filter/pagination.

**Query params**: `q` (text search), `location`, `type`, `workMode`, `tag`, `salaryMin`, `page` (default 1), `limit` (default 12, max 50).

**200** →

```json
{
  "jobs": [{ "_id": "...", "title": "...", "...": "..." }],
  "pagination": { "page": 1, "limit": 12, "total": 42, "totalPages": 4 }
}
```

### `GET /jobs/:id`

Public. **200** → `{ "job": { ... } }` · **404** not found

### `GET /jobs/mine` 🔒 employer

All jobs (any status) owned by the authenticated employer. **200** → `{ "jobs": [...] }`

### `POST /jobs` 🔒 employer

**Body**: `title, companyName, location, type, workMode, description` (required); `salaryMin, salaryMax, currency, requirements[], tags[]` (optional).

**201** → `{ "job": { ... } }`

### `PATCH /jobs/:id` 🔒 employer, owner only

Partial update of the same fields as create, plus `status: "open" | "closed"`.

**200** → `{ "job": { ... } }` · **403** not the owner · **404** not found

### `DELETE /jobs/:id` 🔒 employer, owner only

Deletes the job and all of its applications. **204** no content

### `POST /jobs/:id/save` 🔒 jobseeker

Toggles a bookmark. **200** → `{ "saved": true | false }`

### `POST /jobs/:id/apply` 🔒 jobseeker

`multipart/form-data`: `resume` (file, required — PDF/DOC/DOCX, ≤5 MB) and `coverNote` (text, optional).

**201** → `{ "application": { ... } }`
**400** missing/invalid resume · **404** job not found · **409** already applied to this job

### `GET /jobs/:id/applicants` 🔒 employer, owner only

**200** → `{ "applications": [{ ..., "applicant": { name, email, headline, skills, location } }] }`

---

## Applications

### `GET /applications/mine` 🔒 jobseeker

**200** → `{ "applications": [{ ..., "job": { title, companyName, location, type, workMode, status } }] }`

### `PATCH /applications/:id/status` 🔒 employer, owner only

**Body**: `{ "status": "applied" | "reviewed" | "shortlisted" | "rejected" | "hired" }`

**200** → `{ "application": { ... } }` · **403** not the owning employer

### `GET /applications/:id/resume` 🔒 applicant or owning employer

Streams the raw resume file with the correct `Content-Type` / `Content-Disposition` headers.

**200** → binary file · **403** neither the applicant nor the owning employer

---

## Saved jobs

### `GET /saved-jobs` 🔒 jobseeker

**200** → `{ "savedJobs": [{ "id": "...", "job": { ... }, "savedAt": "..." }] }`

---

## Health check

### `GET /health`

Public, unauthenticated. **200** → `{ "status": "ok", "timestamp": "..." }` — used for uptime checks and to verify deployments.
