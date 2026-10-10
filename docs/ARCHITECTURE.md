# System Architecture — MedAssist (Medical Assistant)

| Field | Value |
| --- | --- |
| **Document** | Architecture v0.2 — **APPROVED BASELINE** (2026-10-10) |
| **Date** | 2026-10-10 |
| **Scope** | Architecture validation of the as-built system + target production architecture |
| **Companion docs** | `docs/PRD.md` (source of truth) · `TASK_BOARD.md` (execution) |

---

## 1. Context & Drivers

- **What:** AI-assisted, informational health web app (PWA) — symptom analysis, health chat, remedies library, personal dashboard.
- **Hard constraint:** informational only; never a diagnosis; emergency escalation mandatory (PRD §5).
- **Drivers:** security (OWASP Top 10), privacy (NDPA 2023 awareness), accessibility (WCAG 2.1 AA), performance (CWV on mid-tier mobile), low cost (Vercel + Turso free tiers), maintainability (Clean Architecture, strict TS).
- **Current state:** working v0.2.0; backend recently migrated from Supabase to a self-contained **libSQL + JWT** backend; several Supabase artifacts remain (see gap register).

## 2. System Context

```
┌────────────────────┐        HTTPS         ┌─────────────────────────────────────────────┐
│  Browser / PWA     │ ◄──────────────────► │  Next.js 16 App (Vercel serverless / Docker) │
│  (React 19 UI,     │                      │                                             │
│   service worker)  │                      │   ┌──────────────┐      ┌────────────────┐  │
└────────────────────┘                      │   │  React UI    │      │  Route Handlers │  │
         │                                  │   │  (components)│      │  (/api/*)       │  │
         │                                  │   └──────────────┘      └───────┬────────┘  │
         │                                  └──────────────┬──────────────────────┘
        CDN (static assets,                           │                  │
        hashed, cached)                               │                  │
                                                    ┌────▼─────────┐   ┌────▼─────────┐
                                                    │  libSQL DB   │   │  Groq AI API │
                                                    │  SQLite file │   │  (Llama 3.3) │
                                                    │  or Turso    │   │              │
                                                    └──────────────┘   └──────────────┘
```

**Trust boundaries:** (1) browser ↔ app (public internet), (2) app ↔ database (private), (3) app ↔ Groq (vendor API, whitelisted base URL).

## 3. Architecture Principles

1. **Clean Architecture layering:** `app/` = interface adapters (pages, route handlers); `components/` = UI; `lib/` = domain + services + infrastructure. Dependencies point inward; infrastructure is swappable (db client, AI provider, mailer, rate limiter).
2. **SOLID + DRY:** small modules, single responsibility, dependency-injected clients (`getDb()`, `createClient()`), shared validation schemas in one place.
3. **Security by default (OWASP Top 10):** parameterized SQL only, Zod on every boundary, httpOnly cookies, security headers, rate limiting, fail-fast secrets, no secrets in logs.
4. **Stateless app tier:** all state lives in the DB; app instances are disposable and horizontally scalable.
5. **Progressive enhancement:** core flows work without JS-heavy features; PWA adds installability + offline fallback, never gates content.

## 4. Component View

| Component | Responsibility | Tech |
| --- | --- | --- |
| **Web UI** | Landing, auth pages, dashboard, a11y, theming | React 19, Tailwind v4, Framer Motion |
| **API layer** | Route handlers: auth, analyze, chat, remedies, symptoms, data rights | Next.js Route Handlers |
| **Auth service** | Signup/login/logout/reset/update; JWT issue/verify; session revocation | jose, bcryptjs, `sessions` table |
| **AI service** | Symptom analysis + chat with safety guardrails, Zod output validation, emergency short-circuit | Groq SDK, `src/lib/ai.ts`, `src/lib/emergency.ts` |
| **Data service** | CRUD over consultations, saved remedies, ratings, chat, preferences | `@libsql/client`, `src/lib/db/*` |
| **Rate limiter** | Per-IP fixed-window limiting (in-memory; adapter interface for Redis) | `src/lib/rate-limit.ts` |
| **PWA layer** | Manifest, service worker, install prompt, offline page | `public/sw.js`, `public/manifest.json` |
| **Email service** | Password-reset delivery (interface; provider TBD — PRD Q2) | `lib/mail` (to be created) |

### 4.1 Design System (E12 — premium marketing redesign, Stage 4)

The conversion-focused redesign (PRD E12) is built on a token-driven design system so marketing and app pages stay visually consistent:

- **Tokens:** brand color palette with refined gradient ramps, surface tints, semantic colors (success/warning/danger/info), fluid typography scale (`clamp()` display → caption), spacing scale, radii, shadows, and glass surfaces (`backdrop-filter` with solid-color fallbacks).
- **Motion tokens:** duration/easing scales; scroll reveals (IntersectionObserver-based), staggered entrances, hover microinteractions, ambient motion — **all gated on `prefers-reduced-motion`** with static fallbacks.
- **Component structure:** `components/ui/` primitives (extend existing `GlassCard`, `AnimatedButton`) + `components/marketing/` sections (Navbar, Hero, SocialProof, Features, ProductShowcase, Benefits, Testimonials, FAQ, CTA, Footer).
- **Copy:** brand-tailored, conversion-focused; reviewed and approved by the product owner before release.
- **Performance budget:** GPU-only animated properties (`transform`, `opacity`), disciplined `will-change`, LCP ≤ 2.5s, Lighthouse performance ≥ 90 on mid-tier mobile.

## 5. Target Folder Structure

```
medical-assistant/
├── docs/                         # PRD.md, ARCHITECTURE.md, SECURITY.md, DEPLOYMENT.md, ADRs
├── public/                       # manifest.json, sw.js, icons, static assets
├── scripts/                      # migrate.ts, seed.ts, db utilities (tsx)
├── src/
│   ├── app/                      # Next.js App Router — interface adapters
│   │   ├── (marketing)/          # /, /privacy, /terms  (route group, optional refactor)
│   │   ├── (auth)/               # /auth/login, /auth/signup, ... (route group, optional)
│   │   ├── dashboard/            # protected app shell + pages (AuthGuard)
│   │   ├── api/                  # route handlers (see §7)
│   │   ├── layout.tsx, globals.css, sitemap.ts, robots.ts, not-found.tsx, global-error.tsx
│   ├── components/               # ui/ (primitives), features/ (domain), shared/ (cross-cutting)
│   ├── lib/                      # domain + services + infrastructure (server-only where needed)
│   │   ├── auth/                 # jwt.ts, password.ts, session.ts
│   │   ├── db/                   # client.ts, schema.ts (migrations)
│   │   ├── ai/                   # provider client + guardrails (from ai.ts, emergency.ts)
│   │   ├── mail/                 # mailer interface + provider impl (new)
│   │   ├── rate-limit/           # limiter + Redis adapter interface (refactor)
│   │   ├── local/                # server + browser backend clients (to be unified)
│   │   ├── logging.ts            # structured logger (new)
│   │   └── utils.ts, constants.ts, theme-context.tsx, auth-context.tsx, profile-context.tsx
│   ├── hooks/                    # usePWA.ts, ...
│   └── types/                    # index.ts (shared contracts)
├── tests/                        # unit + integration (Vitest): tests/unit, tests/integration
├── .github/workflows/            # ci.yml, deploy.yml, security.yml
├── Dockerfile, docker-compose.yml, .dockerignore   # (new, Stage 5)
├── package.json, tsconfig.json, eslint.config.mjs, .prettierrc, .editorconfig
├── .env.example                  # complete env matrix
├── TASK_BOARD.md                 # living execution board
├── CHANGELOG.md                  # (new, Stage 5)
└── README.md, SECURITY.md, CONTRIBUTING.md, LICENSE
```

*Route-group reorganization (`(marketing)`, `(auth)`) is an optional, incremental refactor — it must not break existing URLs. Applied only if it reduces risk rather than adding it.*

## 6. Database Schema

### 6.1 Current schema (as-built, `src/lib/db/schema.ts`, migration `0001_init`)

| Table | Key columns | Notes |
| --- | --- | --- |
| `users` | `id` PK, `email` UNIQUE, `password_hash`, `full_name`, `date_of_birth`, `gender`, timestamps | bcrypt hash |
| `user_preferences` | `user_id` PK/FK, `theme`, `email_notifications`, `reminder_notifications`, `preferred_remedy_types` (JSON), `language` | 1:1 with users |
| `sessions` | `token` PK, `user_id` FK, `expires_at` | **exists but unused for revocation — see G4** |
| `consultations` | `id` PK, `user_id` FK, symptoms + full AI analysis (JSON columns), `is_emergency`, timestamps | indexed (user_id, created_at) |
| `saved_remedies` | `id` PK, `user_id` FK, `remedy_id`, `notes` | indexed (user_id) |
| `remedy_ratings` | `id` PK, `user_id` FK, `remedy_id`, rating fields, `UNIQUE(user_id, remedy_id)` | upsert semantics |
| `chat_messages` | `id` PK, `user_id` FK, `consultation_id`?, `role`, `content` | indexed (user_id, created_at) |

Conventions: TEXT PKs (UUIDs), ISO timestamps via `datetime('now')`, JSON-in-TEXT for nested structures (parsed at the boundary), `PRAGMA foreign_keys = ON`, WAL mode, idempotent migrations run at boot.

### 6.2 Proposed deltas (Stage 3)

| # | Change | Rationale |
| --- | --- | --- |
| D1 | Add `jti` (unique) to JWTs; store `jti` + `user_id` + `expires_at` in `sessions` on login; verify against `sessions` on each request; delete row on logout/password change | Server-side revocation (closes G4); enables "log out everywhere" |
| D2 | New migration `0002_sessions_jti` — additive only, idempotent | No destructive changes to existing data |
| D3 | Index `remedy_ratings(remedy_id)`, `chat_messages(consultation_id)` | Query performance at scale |
| D4 | Optional: `password_resets` table (single-use token hash + expiry) replacing stateless reset JWT | Single-use guarantee without clock skew issues |
| D5 | `updated_at` maintenance via triggers or app-level writes (app-level preferred for portability) | Auditability |
| D6 | Document production backup strategy (Turso snapshots / Litestream / scheduled export) | Stage 5 |
| D7 | Migration 0005: add `medical_conditions` + `allergies` columns to `users` | Aligns the local schema with profile features (previously Supabase-era `profiles`-only) |

**Data classification:** `consultations`, `chat_messages`, `saved_remedies`, `remedy_ratings`, `user_preferences` = **sensitive personal (health-adjacent) data** — encrypted at rest by the DB provider (Turso), access strictly per-user, never logged, exportable/deletable by the user.

## 7. API Contracts

Conventions: JSON in/out; `Content-Type: application/json`; errors as `{ error: string, details?: object }`; authenticated routes require a valid session cookie; `Cache-Control: no-store` on all API responses; rate limits return `429` + `Retry-After`.

| Method | Path | Auth | Rate limit | Request | Response (200) |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/health` | none | 30/min/IP | — | `{ status: "ok", db: "ok", version }` *(new, Stage 2)* |
| POST | `/api/local/auth/signup` | none | 5/min/IP | `{ email, password, full_name? }` | `{ user }` + session cookie |
| POST | `/api/local/auth/login` | none | 10/min/IP + 5/account | `{ email, password }` | `{ user }` + session cookie |
| POST | `/api/local/auth/logout` | session | — | — | `{ success: true }`; session row deleted |
| GET | `/api/local/auth/me` | session | 30/min/IP | — | `{ user }` or 401 |
| POST | `/api/local/auth/reset-password` | none | 3/min/IP | `{ email }` | `{ success: true }` (always, to avoid enumeration) |
| POST | `/api/local/auth/update-password` | session or reset token | 5/min/IP | `{ password, token? }` | `{ success: true }`; other sessions revoked |
| GET | `/api/local/auth/oauth/[provider]` | none | 10/min/IP | — | 302 to provider *(decision pending — PRD Q1)* |
| POST | `/api/analyze` | session | 10/min/IP | `{ symptoms: string[1..30], description? ≤2000, duration? ≤100, severity? 1..10 }` | `{ severity, conditions[≤5], recommendations[≤8], remedies[], warningFlags[≤5], followUpNeeded, isEmergency?, disclaimer }` |
| POST | `/api/chat` | session | 20/min/IP | `{ messages: [{role,content≤2000}]≤40, context? ≤2000 }` | `{ reply }` (or emergency script) |
| GET | `/api/remedies` | session | 60/min/IP | `?q&type&page` | `{ remedies[], total }` |
| GET | `/api/remedies/rating?remedy_id=` | session | 60/min/IP | — | `{ average, count }` *(new, Stage 3)* |
| GET | `/api/symptoms` | session | 60/min/IP | `?q&category` | `{ symptoms[], categories[] }` |
| GET | `/api/local/data/remedies` | session | 60/min/IP | — | user-relevant remedy data |
| GET | `/api/local/data/symptoms` | session | 60/min/IP | — | symptom catalog |
| GET | `/api/local/data/export` | session | 5/hour/IP | — | full user-data JSON download |
| POST | `/api/local/data/delete-account` | session | 1/hour/IP | `{ confirmation: "DELETE" }` | `{ success: true }`; all user data cascade-deleted |
| POST | `/api/local/data/query` | session | — | arbitrary | **REMOVE or whitelist (G5)** |

**Validation:** every body parsed with Zod before any business logic; 400 with flattened field errors on failure.
**Authorization:** every per-user query filtered by `user_id` from the verified session — never from client input.

## 8. Auth & Session Architecture

### 8.1 As-built
- JWT (HS256, 30-day) issued at login; **browser stores it in `localStorage`** and sends `Authorization: Bearer` to `/api/local/*`; separately, some routes read a `medassist-session` **cookie** via `next/headers`.
- Two parallel auth paths (cookie-based server client for `/api/analyze`, `/api/chat`, etc.; Bearer client for `/api/local/*`).
- Stateless JWT: logout is client-side; no server-side revocation; `sessions` table unused.

### 8.2 Target (Stage 3)

```
Login → verify bcrypt → create sessions row (jti, user_id, expires_at)
      → JWT { sub, email, jti } → Set-Cookie: medassist-session=<jwt>;
        HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=30d
Every request → read cookie → verify JWT signature+exp → check sessions.jti exists
      → (sliding renewal optional) → attach user to request context
Logout / password change → DELETE sessions row(s) → cookie cleared
```

- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`. CSRF is mitigated by SameSite=Strict + no state-changing GETs.
- Token in localStorage is **removed** (closes XSS-token-theft, G1/G2).
- Reset flow: single-use token (JWT `kind=reset`, 1h, or `password_resets` row per D4), delivered by email; constant-time responses to avoid account enumeration.
- Session verification is centralized in one middleware/helper used by **all** protected routes (no per-route drift).

## 9. Security Architecture (Threat Model Summary)

| Threat | Control |
| --- | --- |
| SQL injection | Parameterized queries only; dynamic identifiers whitelisted server-side; no raw string SQL from user input |
| XSS | React auto-escaping; no `dangerouslySetInnerHTML` on user/AI content without sanitization; CSP tightened (G11); AI output rendered as text/markdown-safe |
| CSRF | SameSite=Strict cookies; no GET state changes; Origin checks on auth routes |
| Session theft | HttpOnly Secure cookies (target); short-ish expiry (30d) + revocation; no tokens in localStorage |
| Credential attacks | bcrypt cost ≥ 12; per-IP + per-account rate limits; generic auth errors; reset tokens single-use |
| Secrets exposure | `.env` gitignored; `.env.example` only; boot-time validation; secrets never logged; PAT/credentials only in credential stores |
| Abuse/DoS | Rate limiting on auth + AI endpoints; body size limits (Next default + explicit); AI output caps |
| Supply chain | lockfile committed; `npm audit --audit-level=high` blocking in CI; Dependabot recommended |
| Data exposure | per-user authorization on every route; `no-store` on API; minimal PII; export/delete rights |
| Header-level | CSP, HSTS, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy (already present — keep and tighten) |

## 10. Deployment Architecture

### 10.1 Primary: Vercel + Turso
- Vercel serverless functions (Node runtime), edge-cached static assets.
- Turso (`libsql://`) production database with `DATABASE_AUTH_TOKEN`.
- PR previews per pull request; production on merge to `main`.

### 10.2 Alternative: self-hosted Docker
- Multi-stage `Dockerfile` → `next build` → `standalone` output → minimal Node runtime image (non-root user).
- `docker-compose.yml`: app + (optional) local libSQL file volume; reverse proxy (Caddy/NGINX) with TLS in front.
- Horizontal replicas share Turso (or a libSQL server, e.g. `sqld`) — app tier stays stateless.

### 10.3 Environment matrix

| Variable | local | preview | production |
| --- | --- | --- | --- |
| `AUTH_SECRET` | dev value allowed | dummy allowed | **required, ≥32 random bytes** |
| `GROQ_API_KEY` | required for AI features | dummy allowed | required |
| `DATABASE_URL` / `DATABASE_AUTH_TOKEN` | unset → `./data/medassist.db` | Turso preview DB | Turso prod DB |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | preview URL | prod URL |
| `MAIL_PROVIDER` / keys | console fallback | console fallback | Resend/SMTP (PRD Q2) |
| `NODE_ENV` | development | production | production |

## 11. CI/CD Pipeline (Target)

| Workflow | Trigger | Jobs |
| --- | --- | --- |
| `ci.yml` | PR + push to main | install → typecheck → lint → **test (new)** → build → **npm audit blocking (changed from continue-on-error)** |
| `deploy.yml` | push to `main` (after CI) | deploy to Vercel production (or build+push GHCR image) |
| `security.yml` (P1) | schedule + PR | secret scanning, CodeQL (JS/TS), dependency review |

## 12. Observability

- Structured JSON logging: `{ level, msg, requestId, route, method, status, durationMs, userId? }` — no PII, no secrets.
- `/api/health` for uptime probes (app + DB round-trip).
- Error monitoring via Sentry-compatible interface (P1, PRD Q5).
- Request IDs propagated to AI-provider error logs (without prompt content).

## 13. Gap Register (Architecture Validation Findings)

Severity: **Critical** = security/data risk, fix before any production traffic · **High** = blocks production readiness · **Medium** = fix in this program · **Low** = backlog.

| ID | Finding (as-built) | Severity | Resolution | Stage |
| --- | --- | --- | --- | --- |
| G1 | Session JWT stored in browser `localStorage` and sent as `Authorization: Bearer` — stealable via any XSS | **Critical** | Move to `HttpOnly`/`Secure`/`SameSite=Strict` cookie; remove Bearer path | 3 |
| G2 | Two parallel auth paths (cookie via `lib/local/server` for `/api/*`; Bearer via `lib/local/client` for `/api/local/*`) | **High** | Unify on cookie-based session; single auth helper used by all protected routes | 3 |
| G3 | `AUTH_SECRET` has a hard-coded dev fallback (`dev-only-secret-...`) | **Critical** | Fail fast at boot when unset/insecure in production; length check ≥ 32 bytes | 2 |
| G4 | Stateless JWT: no server-side revocation; `sessions` table unused; logout likely client-only | **High** | `jti` + `sessions` table; delete on logout/password change (D1/D2) | 3 |
| G5 | `POST /api/local/data/query` is a generic DB query endpoint | **Critical** | Remove, or restrict to a server-side whitelist of tables/columns with per-user scoping | 3 |
| G6 | Zero automated tests; CI has no test step | **High** | Vitest unit + integration tests; CI test job; ≥70% core coverage | 3 |
| G7 | Stale Supabase artifacts: README stack table, CI build env vars, CSP `*.supabase.co`, `images.remotePatterns`, `src/lib/supabase/*`, `src/lib/database.ts` imports, OAuth routes + `/auth/callback` | Medium | Remove or fully implement (PRD Q1); update README/CI/CSP to libSQL reality | 3–4 |
| G8 | In-memory rate limiter — breaks under multi-instance; `x-forwarded-for` trusted blindly | Medium | Adapter interface + Upstash Redis option; trust proxy headers only from known proxy | 3 |
| G9 | No Docker/deployment configs, no deployment docs | **High** | Dockerfile (standalone), compose, .dockerignore, DEPLOYMENT.md | 5 |
| G10 | No health-check endpoint | Medium | `GET /api/health` (app + DB) | 2 |
| G11 | CSP allows `script-src 'unsafe-inline' 'unsafe-eval'` | Medium | Tighten with Next.js nonce-based CSP; remove `unsafe-eval` in production | 3 |
| G12 | `getClientIp` trusts `x-forwarded-for` unconditionally (spoofable) | Low | Only trust when request comes from configured proxy | 3 |
| G13 | Logging is raw `console.error`; no request IDs; no structured logs | Medium | `lib/logging.ts` structured logger; request-ID middleware | 3 |
| G14 | Password-reset email delivery mechanism unclear (no mailer abstraction) | **High** | `lib/mail` interface + provider (PRD Q2); dev console fallback | 3 |
| G15 | Reset tokens are stateless JWTs (replayable within 1h window) | Medium | Single-use `password_resets` table (D4) | 3 |
| G16 | CI: `npm audit` is `continue-on-error`; no deploy workflow; build env uses Supabase dummy vars | Medium | Blocking audit; deploy workflow; env cleanup | 5 |
| G17 | PWA service worker caching strategy not production-reviewed | Low | Review `sw.js` caching; precache manifest; versioned cache names | 4 |
| G18 | No production backup/recovery story for the DB | Medium | Turso snapshots / Litestream / scheduled export; document + test restore | 5 |
| G19 | Accessibility not yet audited against WCAG 2.1 AA | Medium | A11y audit + fixes in Stage 4; Lighthouse a11y ≥ 95 | 4 |
| G20 | `npm audit` policy + dependency update process undefined | Low | Dependabot/Renovate; audit policy documented | 5 |

**Stage 3 resolution log (2026-10-10):**
- ✅ G1/G2 — sessions are cookie-only (`HttpOnly`, `Secure`, `SameSite=Strict`); localStorage/Bearer path removed; single auth helper for all routes.
- ✅ G3 — `AUTH_SECRET` fails fast in production when missing or < 32 chars (`src/lib/env.ts`).
- ✅ G4 — JWT `jti` + `sessions` table; logout/password-change/reset revoke server-side.
- ✅ G5 — query endpoint locked to per-table identifier whitelists, forced owner scoping, `password_hash` stripped from results.
- ✅ G6 — Vitest suite: 33 tests green, 76.45% line coverage on core domain (target ≥ 70%).
- ✅ G8/G12 — rate limiter trusts proxy headers only with `TRUST_PROXY=1`.
- ✅ G11 — production CSP drops `unsafe-eval` and all Supabase origins.
- ✅ G13 — structured redaction-aware logger (`src/lib/logging.ts`) in all rewritten paths.
- ✅ G14/G15 — mailer abstraction (console dev / Resend prod) + single-use `password_resets` tokens.
- ◐ G7 — backend Supabase shims + OAuth routes removed; README + landing-component cleanup continues in Stage 4/5.
- ◐ G16 — CI now runs tests + blocking audit; deploy workflow remains (Stage 5).
- ⏳ G9, G17, G18, G19, G20 — Stage 4/5.

**Positive findings (keep):** security headers already configured; Zod validation on all routes; emergency keyword short-circuit with safety prompts; parameterized SQL throughout; bcrypt password hashing; rate limiting on AI/auth routes; GDPR-style export/delete; PWA + offline page; legal pages; sitemap/robots; idempotent migrations; `no-store` on API; strict TS + ESLint.

## 14. Decision Log (ADRs)

| # | Decision | Rationale | Status |
| --- | --- | --- | --- |
| ADR-1 | libSQL (SQLite/Turso) over Postgres/Supabase | Zero-ops, free-tier friendly, existing migration; Turso gives prod scale | Accepted (as-built) |
| ADR-2 | Cookie-based sessions replace localStorage Bearer | XSS resilience; standard web security posture | Proposed (G1/G2) |
| ADR-3 | Groq `llama-3.3-70b-versatile` for AI | Fast, free tier, good JSON adherence; swap via single provider module | Accepted (as-built) |
| ADR-4 | In-memory rate limiter now; Redis adapter later | Single-instance deploys today; interface allows swap | Accepted interim |
| ADR-5 | Vitest for testing | Native TS/ESM, fast, Next.js-friendly | Proposed |
| ADR-6 | Next.js `standalone` Docker output | Minimal prod image; portable self-host | Proposed |
| ADR-7 | OAuth: implement properly or remove (PRD Q1) | No half-wired auth entry points | Open |

---

*Approval of this document (with the PRD) authorizes Stage 2 (environment setup).*
hroughout; bcrypt password hashing; rate limiting on AI/auth routes; GDPR-style export/delete; PWA + offline page; legal pages; sitemap/robots; idempotent migrations; `no-store` on API; strict TS + ESLint.

## 14. Decision Log (ADRs)

| # | Decision | Rationale | Status |
| --- | --- | --- | --- |
| ADR-1 | libSQL (SQLite/Turso) over Postgres/Supabase | Zero-ops, free-tier friendly, existing migration; Turso gives prod scale | Accepted (as-built) |
| ADR-2 | Cookie-based sessions replace localStorage Bearer | XSS resilience; standard web security posture | Proposed (G1/G2) |
| ADR-3 | Groq `llama-3.3-70b-versatile` for AI | Fast, free tier, good JSON adherence; swap via single provider module | Accepted (as-built) |
| ADR-4 | In-memory rate limiter now; Redis adapter later | Single-instance deploys today; interface allows swap | Accepted interim |
| ADR-5 | Vitest for testing | Native TS/ESM, fast, Next.js-friendly | Proposed |
| ADR-6 | Next.js `standalone` Docker output | Minimal prod image; portable self-host | Proposed |
| ADR-7 | OAuth: implement properly or remove (PRD Q1) | No half-wired auth entry points | Open |

---

*Approval of this document (with the PRD) authorizes Stage 2 (environment setup).*
