# Deployment guide

This project deploys as **two separate Vercel projects** — one for `client/`, one for `server/` — connected to the same GitHub repository, with GitHub Actions running CI on every push/PR and CD (deploy to Vercel) on every push to `main`.

Everything below is already configured in the repo (`vercel.json` in both `client/` and `server/`, `.github/workflows/ci.yml`). What's left is account/credential setup, which necessarily happens outside the repo.

## 1. Push this repo to GitHub

```bash
cd job-board
git init                     # already done if you're reading this from a clone
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/job-board.git
git push -u origin main
```

## 2. Create a MongoDB Atlas cluster

1. Sign up / log in at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free (M0) cluster.
3. **Database Access** → add a database user with a strong password.
4. **Network Access** → add `0.0.0.0/0` (allow from anywhere) so Vercel's serverless functions — which don't have a fixed IP — can connect. For a production system handling real user data you'd want [Vercel's Atlas integration](https://vercel.com/integrations/mongodbatlas) instead, which manages this more precisely.
5. **Connect** → "Drivers" → copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/job-board?retryWrites=true&w=majority`

## 3. Create the two Vercel projects

Install the CLI once locally if you want to deploy manually too: `npm i -g vercel`.

### Server project

1. In the [Vercel dashboard](https://vercel.com/new), import the GitHub repo.
2. **Root Directory**: `server`
3. Framework preset: **Other** (it's a plain Node/Express app via serverless functions — no framework build step needed).
4. **Environment Variables** (Production + Preview):
   - `MONGODB_URI` — from step 2
   - `JWT_SECRET` — a long random string (e.g. `openssl rand -hex 32`)
   - `JWT_EXPIRES_IN` — `7d`
   - `CLIENT_ORIGIN` — the client project's URL once you have it (step below), e.g. `https://job-board-client.vercel.app`. Comma-separate multiple origins if needed.
   - `MAX_RESUME_SIZE_BYTES` — `5242880` (optional, this is the default)
5. Deploy. Note the resulting URL, e.g. `https://job-board-server.vercel.app` — the API is served under `/api/...` on that domain.

### Client project

1. Import the same GitHub repo as a **second** Vercel project.
2. **Root Directory**: `client`
3. Framework preset: **Vite** (auto-detected).
4. **Environment Variables**:
   - `VITE_API_URL` — the server project's URL + `/api`, e.g. `https://job-board-server.vercel.app/api`
5. Deploy. Note the resulting URL, e.g. `https://job-board-client.vercel.app`.

### Cross-wire the origins

Go back to the **server** project's env vars and set `CLIENT_ORIGIN` to the client's actual URL, then redeploy the server (Vercel → Deployments → ⋯ → Redeploy) so CORS allows requests from it.

## 4. Seed production data (optional)

From your machine, pointed at the Atlas connection string:

```bash
cd server
MONGODB_URI="<your atlas uri>" npm run seed
```

This is optional and destructive (it wipes existing data) — skip it for a real production launch and just let users register normally.

## 5. Wire up GitHub Actions for automatic deploys

The CI workflow (`.github/workflows/ci.yml`) always runs lint/test/build on every push and PR. The **deploy** jobs additionally require these repository secrets (GitHub repo → Settings → Secrets and variables → Actions):

| Secret | Where to find it |
| --- | --- |
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link` inside `server/` (or `client/`) locally once — it writes `.vercel/project.json` containing `orgId` and `projectId` |
| `VERCEL_PROJECT_ID_SERVER` | `projectId` from `.vercel/project.json` after running `vercel link` in `server/` |
| `VERCEL_PROJECT_ID_CLIENT` | `projectId` from `.vercel/project.json` after running `vercel link` in `client/` |
| `VITE_API_URL` | Same value as the client project's env var, so CI builds against the right API URL |

Once all five secrets are set, the next push to `main` will run tests/builds and then deploy both projects automatically. Until then, CI still runs (and will show the deploy jobs as skipped, not failed) — deployment is purely additive.

## Notes on this setup vs. a "bigger" production setup

- **CORS is origin-based** (`CLIENT_ORIGIN`), not a proxy/rewrite — simpler to reason about than trying to make two independently-deployed Vercel projects appear same-origin.
- **No CDN/object storage for resumes** — see [`docs/ARCHITECTURE.md`](ARCHITECTURE.md#resume-storage-embedded-in-mongodb-not-s3) for why, and what to swap in if resume volume grows.
- **MongoDB network access is 0.0.0.0/0** for simplicity, since Vercel serverless functions don't have stable egress IPs on the free/hobby tier; tighten this with Vercel's official Atlas integration or IP allowlisting on a paid Vercel/Atlas tier if this goes to real production traffic.
