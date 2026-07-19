# Features

JobBoard has three audiences: **guests** (unauthenticated visitors), **job seekers**, and **employers**. Each gets a distinct set of capabilities, enforced both in the UI (route guards, conditional rendering) and in the API (JWT auth + role checks + ownership checks).

## Guest (unauthenticated)

- **Browse all open jobs** on the homepage, newest first.
- **Search** by keyword across job title, company, description, and tags (debounced, so results update as you type without spamming the API).
- **Filter** by location, job type (full-time/part-time/contract/internship), work mode (remote/hybrid/onsite), and minimum salary. Filters combine (AND), and "Clear filters" resets them in one click.
- **Paginate** through results (12 jobs per page).
- **View full job details** — description, requirements, tags, salary range, posted date, applicant count.
- Prompted to log in when attempting to apply or save a job.
- **Light/dark theme toggle**, persisted across visits and defaulting to the OS preference on first load.

## Job seeker

Everything a guest can do, plus:

- **Register/login** with email + password (JWT-based session, persisted in local storage).
- **Apply to a job** with an optional cover note and a required resume upload (PDF or Word doc, max 5 MB). The resume is stored in MongoDB alongside the application — no third-party file storage needed.
- **Duplicate-apply protection** — the UI shows "already applied" with the current status instead of a second apply button; the API rejects a second submission with `409 Conflict` as a backstop.
- **Save/bookmark jobs** for later via a one-click toggle on any job card or the job detail page.
- **My Applications dashboard** — every application with its live status (`applied` → `reviewed` → `shortlisted` → `hired`/`rejected`), the job it belongs to, and a link to re-download the exact resume that was submitted.
- **Saved Jobs page** — all bookmarked jobs in one place, with the same save/unsave toggle.
- **Profile page** — edit name, headline, location, and skills (shown to employers reviewing applications).

## Employer

Everything a guest can do (browsing, for market awareness), plus:

- **Register/login** as an employer, optionally setting a company name at signup.
- **Post a job** — title, company name, location, type, work mode, salary range, description, requirements (one per line), and tags (comma-separated).
- **Employer dashboard** — every job you've posted, with status (open/closed), applicant count, and quick actions.
- **Edit or close/reopen a job** at any time. Closed jobs stop accepting new applications but remain visible with a "Closed" badge.
- **Delete a job** (with a confirmation dialog, since it also removes its applications).
- **Review applicants per job** — each applicant's name, email, headline, skills, cover note, and a one-click resume download.
- **Update application status** per candidate (`applied` / `reviewed` / `shortlisted` / `rejected` / `hired`) via a simple dropdown — the change is immediately visible to the candidate on their dashboard.
- **Company profile** — name, website, and an "about" blurb shown on job postings.
- **Ownership enforcement** — an employer can only edit/delete/view applicants for jobs they created; the API returns `403 Forbidden` for anyone else, including other employers.

## Cross-cutting UX details

- **Loading states**: skeleton cards on the job list, spinners on detail/dashboard pages — never a blank screen while data loads.
- **Empty states**: distinct, actionable empty states for "no jobs match your filters," "no applications yet," "no saved jobs," and "no applicants yet," each with a relevant call-to-action.
- **Error states**: failed data fetches show a retry-able error panel instead of silently rendering nothing; form and mutation errors surface as toast notifications with the server's actual validation message.
- **Responsive design**: single-column mobile layout with a collapsible nav menu, up to a 3-column job grid on desktop.
- **Accessible forms**: labelled inputs, inline validation errors, `aria-invalid`/`aria-label` attributes, keyboard-dismissible modals (Escape key), focus-visible rings throughout.
- **Optimistic-feeling interactions**: save/unsave and status updates use React Query cache invalidation so the UI reflects changes immediately after the request resolves, with toast confirmation.
