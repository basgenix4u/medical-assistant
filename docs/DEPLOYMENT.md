# Deployment Guide

MedAssist is a Next.js 16 app that can run anywhere Node.js runs. This guide
covers **Vercel** (recommended — zero config) and self-hosting with Docker.

---

## 1. Deploy to Vercel (recommended)

### 1.1 Import the project

1. Push your branch to GitHub (e.g. `production-readiness`).
2. In Vercel: **Add New → Project → Import** the repository.
3. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   output `.next` — all defaults are correct. No `vercel.json` is required.

### 1.2 Configure environment variables

Go to **Project → Settings → Environment Variables** and add:

| Variable | Required | How to get it |
|---|---|---|
| `AUTH_SECRET` | **Yes (production)** | `openssl rand -base64 32` — signs session JWTs. Must be ≥ 32 chars. |
| `DATABASE_URL` | **Yes (production)** | Turso connection string, e.g. `libsql://medassist-<org>.turso.io` (see §1.3). |
| `DATABASE_AUTH_TOKEN` | **Yes (production)** | Turso database auth token (`turso db tokens create <db>`). |
| `NEXT_PUBLIC_APP_URL` | Yes | Your production URL, e.g. `https://medical-assistant-ashen.vercel.app` (used in reset emails). |
| `GROQ_API_KEY` | Yes (AI features) | https://console.groq.com — without it, analysis falls back gracefully. |
| `TRUST_PROXY` | Recommended | Set to `1` so rate limiting reads the real client IP behind Vercel's proxy. |
| `RESEND_API_KEY` | Optional | https://resend.com — production password-reset emails. Without it, reset links are logged server-side. |
| `MAIL_FROM` | Optional | e.g. `MedAssist <noreply@yourdomain.com>` |

> **Why the build used to fail:** `next build` imports route modules to collect
> metadata, which evaluates `src/lib/env.ts`. That module used to throw at
> import time when `AUTH_SECRET` was missing in production. It now validates
> strictly **at runtime** and only warns during the build phase, so the build
> succeeds and a missing secret surfaces as a clear error on first request
> instead of a cryptic build failure.

### 1.3 Set up the database (Turso)

Vercel's serverless filesystem is read-only (except `/tmp`), so the local
SQLite file cannot persist. Use a free [Turso](https://turso.tech) database:

```bash
# 1. Install the CLI and log in
brew install tursodatabase/tap/turso   # or: curl -sSfL https://get.tur.so/install.sh | bash
turso auth login

# 2. Create a database
turso db create medassist --group default

# 3. Get the connection string and a token
turso db show medassist --url
turso db tokens create medassist
```

Paste the `libsql://…` URL into `DATABASE_URL` and the token into
`DATABASE_AUTH_TOKEN`. Schema migrations run automatically on first request
(`runMigrations()` is idempotent).

> Without `DATABASE_URL`, the app boots on Vercel using ephemeral `/tmp`
> storage and logs a warning — fine for a demo, **not** for real users.

### 1.4 Deploy

Push to your production branch (or click **Deploy**). Vercel builds and
deploys automatically. The PWA (`public/sw.js`, `public/manifest.json`) is
served as static assets.

### 1.5 Post-deploy checklist

- [ ] Visit `/` — landing page renders.
- [ ] `GET /api/health` → `{ "status": "ok", "db": "ok" }`.
- [ ] Sign up → analyze a symptom → reset password (check Vercel logs if
      `RESEND_API_KEY` is not configured).
- [ ] Toggle dark mode; check the mobile layout (≤ 480px).
- [ ] Run Lighthouse (Performance/Accessibility) — targets: a11y ≥ 95, perf ≥ 90.

---

## 2. Self-hosting with Docker (Stage 5)

A production `Dockerfile` (Next.js `standalone` output) and
`docker-compose.yml` are planned for Stage 5. When self-hosting:

- Set `DATABASE_FILE` to a **mounted volume** path (e.g. `/data/medassist.db`)
  or use Turso via `DATABASE_URL`.
- Always set `AUTH_SECRET` (≥ 32 chars) and `TRUST_PROXY=1` behind a reverse
  proxy.
- Terminate TLS at the proxy (nginx/Caddy); the app sends HSTS headers.

---

## 3. Environment variable reference

See `.env.example` for the full annotated list. Summary:

| Variable | Default | Purpose |
|---|---|---|
| `AUTH_SECRET` | dev fallback | Session JWT signing secret (required in prod, ≥ 32 chars) |
| `DATABASE_URL` | — | libSQL/Turso connection string (production persistence) |
| `DATABASE_AUTH_TOKEN` | — | Turso auth token |
| `DATABASE_FILE` | `./data/medassist.db` (`/tmp/medassist.db` on Vercel) | Local SQLite file path |
| `GROQ_API_KEY` | — | Groq API key for AI analysis/chat |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public base URL (emails, metadata) |
| `TRUST_PROXY` | `0` | Trust `X-Forwarded-For` for rate limiting (set `1` on Vercel) |
| `RESEND_API_KEY` | — | Resend key for production emails |
| `MAIL_FROM` | — | From address for emails |

---

## 4. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Build fails with `AUTH_SECRET is required in production` | Older revision of `env.ts` | Pull the latest `production-readiness` branch — validation is build-phase tolerant now |
| `500` on signup/login after deploy | `AUTH_SECRET` missing/short at runtime | Set `AUTH_SECRET` (≥ 32 chars) in Vercel env vars and redeploy |
| `db: "error"` in `/api/health` | No `DATABASE_URL` and read-only FS | Configure Turso (§1.3) |
| Rate limits trigger instantly | Missing `TRUST_PROXY=1` behind Vercel | Set `TRUST_PROXY=1` |
| Reset emails not arriving | `RESEND_API_KEY` not set | Add Resend key + `MAIL_FROM`, or read the dev reset URL from logs |
| AI analysis returns fallback text | `GROQ_API_KEY` missing/invalid | Add a valid Groq key |
