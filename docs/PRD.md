# Product Requirements Document (PRD)
## MedAssist — Medical Assistant Web Application

| Field | Value |
| --- | --- |
| **Document** | PRD v0.2 — **APPROVED BASELINE** (2026-10-10; includes E12 scope addition) |
| **Date** | 2026-10-10 |
| **Product** | MedAssist — AI-assisted, informational health web application |
| **Repository** | `github.com/basgenix4u/medical-assistant` (branch `main`) |
| **Product owner** | Abdulbasit Abdulalim (basgenix4u) — ALIM CREATIVE |
| **Prepared by** | Software Factory (PM · Architect · Full-Stack · DevOps/SRE · UI/UX · QA) |
| **Status** | Approved baseline — authorizes Stage 2 |

> **Provenance note:** No standalone PRD existed. Per the product owner's decision (2026-10-10), this PRD was co-drafted by the Software Factory from the existing production codebase and the owner's goals. It documents the product **as-built** and defines the **production-readiness delta**. Once approved, this document is the single source of truth for all subsequent work.

---

## 1. Executive Summary

MedAssist is a modern, mobile-first **Progressive Web App** that helps people collect general health information: they describe symptoms, receive an **AI-generated informational analysis** (explicitly *not* a diagnosis), chat with an AI health-information assistant, browse a curated library of traditional/home remedies, and track their consultation history and saved remedies in a personal dashboard.

The application is currently a working v0.2.0 build (Next.js 16, React 19, TypeScript, Tailwind CSS v4, libSQL database, Groq AI, deployed on Vercel). The mission of this program of work is to transform it into a **production-ready application**: validated architecture, hardened backend, fully tested, secure (OWASP Top 10), documented, containerized, and deployable via CI/CD.

> **⚠️ Medical disclaimer (product-level, non-negotiable):** MedAssist provides **informational content only**. It is **not** a medical device, **not** a diagnostic tool, and **not** a substitute for professional medical advice, diagnosis, or treatment. Emergency situations must always be escalated to local emergency services.

---

## 2. Vision & Goals

**Vision:** A trustworthy, accessible, installable web companion for general health information — safe by design, fast on low-end devices, and honest about its limitations.

**Program goals (production readiness):**

1. **G1 — Validated architecture:** documented system architecture, database schema, API contracts, and folder structure, reviewed and approved.
2. **G2 — Hardened backend:** database models/migrations, authn/authz, business logic, validation, logging, and automated tests — all green.
3. **G3 — Polished frontend:** responsive, accessible UI with live backend integration, proper loading/error states, and a clean auth flow; zero TS/lint/build errors.
4. **G4 — Secure:** OWASP Top 10 controls verified; no SQLi/XSS/CSRF/command-injection/auth-flaw exposure; secrets never in code.
5. **G5 — Production operations:** Docker + deployment configs, CI/CD pipelines, environment management, comprehensive README + deployment docs, release assets.
6. **G6 — Maintainable:** modular, strongly typed, SOLID/DRY/Clean Architecture code with a living task board and decision log.

**Non-goals (explicit):**

- Real medical diagnosis, triage decisions, or treatment plans.
- Prescription recommendations or dosage advice.
- Telemedicine, appointments, or clinician-patient communication.
- EHR/EMR integrations, insurance, or payments.
- Native mobile apps (PWA only).
- Replacing the existing product's look & feel wholesale — improvements are incremental and non-breaking unless noted in the gap register.

---

## 3. Personas

| Persona | Description | Key needs |
| --- | --- | --- |
| **P1 — Curious Casey** | Everyday user with a mild symptom (headache, cold) who wants general information before deciding whether to see a doctor. | Fast answers, clear "see a doctor" guidance, emergency escalation, works offline-ish (PWA), works on a low-end phone. |
| **P2 — Managing Mo** | User with an ongoing, non-urgent condition who tracks symptoms over time. | Consultation history, saved remedies, notes, ratings, reminders. |
| **P3 — Caregiver Chris** | Looks up information on behalf of a family member. | Clear disclaimers, shareable/exportable results, simple language. |
| **P4 — Reviewer Rita** | Auditor, security reviewer, or contributor. | Clean architecture, tests, docs, CI, reproducible builds. |

---

## 4. Functional Requirements (Epics & User Stories)

Legend: **MVP** = must work at launch of the production release · **P1** = high priority · acceptance criteria are Given/When/Then style.

### E1 — Accounts & Authentication
- **US1.1 (MVP)** As a user, I want to create an account with email + password so that my data is private. *AC:* signup validates email format and password strength (≥8 chars); duplicate email returns a clear 409; on success I am signed in.
- **US1.2 (MVP)** As a user, I want to log in and stay signed in so that I don't re-authenticate constantly. *AC:* session persists across browser restarts; session cookie is `HttpOnly`, `Secure`, `SameSite=Strict`.
- **US1.3 (MVP)** As a user, I want to log out from any device session so that shared devices are safe. *AC:* logout invalidates the session **server-side** (not just client-side token deletion).
- **US1.4 (MVP)** As a user, I want to reset a forgotten password securely. *AC:* reset link is a single-use, time-boxed (≤1h) token delivered by email; requesting a reset for an unknown email does not reveal whether the account exists.
- **US1.5 (MVP)** As a user, I want to change my password after verifying my current password. *AC:* wrong current password → 403; success revokes other sessions.
- **US1.6 (P1)** As a user, I want to delete my account and all associated data. *AC:* cascading delete of consultations, chat messages, saved remedies, ratings, preferences; confirmation required.
- **US1.7 (P1)** As a user, I want to sign in with Google/GitHub (OAuth). *AC:* **Decision pending** — either fully implemented with secure state+PKCE handling, or the OAuth entry points are removed from the UI. No half-wired buttons.

### E2 — Symptom Analysis (AI)
- **US2.1 (MVP)** As a user, I want to select symptoms (checklist and/or interactive body map), rate severity, and describe my situation so that I get an analysis. *AC:* input is validated server-side (Zod): 1–30 symptoms, description ≤ 2000 chars, severity 1–10.
- **US2.2 (MVP)** As a user, I want an AI analysis with possible conditions, recommendations, warning flags, and a severity assessment. *AC:* response matches a strict Zod schema (max 5 conditions, max 8 recommendations); every response carries the informational-only disclaimer.
- **US2.3 (MVP)** As a user, I want emergency language to trigger an immediate, prominent emergency banner. *AC:* emergency keywords short-circuit the LLM call; response includes local emergency numbers (911/999/112) and "call now" guidance.
- **US2.4 (MVP)** As a user, I want the analysis saved to my history automatically. *AC:* a consultation row is created with symptoms, AI output, and timestamps.
- **US2.5 (P1)** As a user, I want analysis to be resilient when the AI provider fails. *AC:* graceful fallback response; no raw provider errors leak to the client; failure is logged.

### E3 — Health Chat (AI)
- **US3.1 (MVP)** As a user, I want a conversational chat for general health questions. *AC:* message ≤ 2000 chars; history capped (40 messages) per request; responses are informational only.
- **US3.2 (MVP)** As a user, I want the chat to refuse to impersonate a clinician and to escalate emergencies. *AC:* system prompt enforces this; emergency keywords in the latest user message return the emergency script.
- **US3.3 (P1)** As a user, I want my chat messages persisted and viewable in my dashboard. *AC:* messages stored per-user; only the owner can read them.

### E4 — Remedies Library
- **US4.1 (MVP)** As a user, I want to browse, search, and filter a curated remedies library. *AC:* search by name/ingredient/symptom tag; filter by remedy type; each remedy shows preparation, usage, precautions, and contraindications.
- **US4.2 (MVP)** As a user, I see clearly that remedies are traditional/informational, not medical advice. *AC:* disclaimer on every remedy view.
- **US4.3 (P1)** As a user, I want to save remedies to my personal list and add notes. *AC:* save/unsave; notes editable; list is per-user.

### E5 — Consultation History
- **US5.1 (MVP)** As a user, I want a chronological history of my consultations. *AC:* list ordered by date desc; detail view shows full AI analysis; pagination or virtualization for long lists.
- **US5.2 (P1)** As a user, I want to export my results (share/download). *AC:* export produces a readable document (PDF/JSON) of a consultation.

### E6 — Remedy Ratings
- **US6.1 (P1)** As a user, I want to rate remedies (effectiveness, ease of use, recommend) with an optional review. *AC:* one rating per user per remedy (upsert); aggregate rating shown on remedy cards.

### E7 — Profile, Preferences & Settings
- **US7.1 (MVP)** As a user, I want to edit my profile (name, DOB, gender, medical conditions, allergies). *AC:* changes persist; conditions/allergies feed into analysis context.
- **US7.2 (MVP)** As a user, I want theme (light/dark/system) and notification preferences. *AC:* theme applies immediately and persists; respects `prefers-color-scheme`.

### E8 — Privacy & Data Rights
- **US8.1 (MVP)** As a user, I want to export all my data. *AC:* `GET /api/local/data/export` returns a complete, machine-readable JSON of the user's data.
- **US8.2 (MVP)** As a user, I want to delete my account and data. *AC:* see US1.6; irreversible; confirmation.
- **US8.3 (MVP)** The product must publish Privacy Policy and Terms of Service pages. *AC:* `/privacy` and `/terms` exist, are linked in the footer, and state the informational-only nature of the product.

### E9 — Progressive Web App
- **US9.1 (MVP)** As a user, I want to install the app on my phone home screen. *AC:* valid `manifest.json`, icons 72–512, install prompt shown at the right time.
- **US9.2 (MVP)** As a user, I want a branded offline fallback page. *AC:* `/offline` page + service worker (`sw.js`) with a sane production caching strategy.

### E10 — Accessibility, SEO & Discoverability
- **US10.1 (MVP)** As a keyboard/screen-reader user, I want the app to be fully operable and announced correctly. *AC:* skip link, focus-visible rings, ARIA labels/roles, `autoComplete` on auth inputs, `prefers-reduced-motion` respected. Target: WCAG 2.1 AA.
- **US10.2 (MVP)** As a site visitor, I want correct SEO metadata, sitemap, and robots. *AC:* `sitemap.ts`, `robots.ts`, per-page metadata, OpenGraph basics.
- **US10.3 (MVP)** As a user, I want friendly 404 and global error pages. *AC:* `not-found.tsx`, `global-error.tsx`.

### E11 — Platform Engineering & Operations (the production-readiness delta)
- **US11.1 (MVP)** The platform must have automated unit + integration tests covering auth, analysis, chat, remedies, history, ratings, and data rights. *AC:* `npm test` green locally and in CI; ≥70% line coverage on core domain code.
- **US11.2 (MVP)** The platform must build reproducibly with zero TypeScript, ESLint, and compile errors. *AC:* `npm run typecheck`, `npm run lint`, `npm run build` all pass in CI on every PR.
- **US11.3 (MVP)** The platform must be containerized. *AC:* multi-stage `Dockerfile` (Next.js `standalone` output), `.dockerignore`, `docker-compose.yml` for local parity.
- **US11.4 (MVP)** The platform must have CI/CD. *AC:* `ci.yml` (test+lint+typecheck+build+audit, audit blocking) and a deploy workflow (Vercel production on `main`, or GHCR image build).
- **US11.5 (MVP)** The platform must have a smoke-test/health endpoint. *AC:* `GET /api/health` returns `{ status: "ok", db: "ok" }` without auth.
- **US11.6 (MVP)** All environment configuration must be documented and validated. *AC:* `.env.example` complete; app **fails fast at boot** if required secrets are missing in production.
- **US11.7 (MVP)** The repository must have a comprehensive README + deployment documentation. *AC:* setup, scripts, env matrix, deploy (Vercel + Docker), backup/recovery, security policy.
- **US11.8 (P1)** The platform must have structured logging with request IDs and centralized error logging. *AC:* no raw `console.error` in production paths; secrets/PII never logged.

### E12 — Premium Marketing & Landing Experience (conversion-focused redesign)

*Scope added by product owner, 2026-10-10. Target audience (from §3): **P1 Curious Casey** (primary) and **P3 Caregiver Chris** (secondary). Conversion goal: visitor → registered user → PWA install. The product is free, so a classic "pricing" section is **not applicable** and is replaced by an explicit free-to-use value statement.*

- **US12.1 (MVP)** As a first-time visitor, I want a premium, modern, conversion-focused landing page so that I immediately understand the product's value and sign up or install the app. *AC:* complete landing structure — sticky navbar, hero, social proof, features, product showcase, benefits, testimonials, FAQ, CTA, and footer; compelling, brand-tailored copy throughout.
- **US12.2 (MVP)** As a visitor, I want the design to feel like a leading tech brand. *AC:* clean typography, generous whitespace, refined gradients, subtle glassmorphism, and premium visuals (design system in `docs/ARCHITECTURE.md` §4.1).
- **US12.3 (MVP)** As a visitor, I want smooth, elegant motion that makes the page feel alive. *AC:* scroll reveals, staggered entrances, hover effects, ambient motion, and interactive microinteractions — all fully disabled under `prefers-reduced-motion`.
- **US12.4 (MVP)** As a visitor on any device, I want a responsive, mobile-first, accessible experience. *AC:* mobile-first breakpoints; WCAG 2.1 AA; keyboard-navigable sticky navbar; Lighthouse a11y ≥ 95 and performance ≥ 90.
- **US12.5 (P1)** As a signed-in user, I want the main app pages (dashboard, analyze, chat, remedies) to share the same premium design language. *AC:* design tokens applied consistently; no visual disconnect between marketing and app.
- **US12.6 (P1)** As the product owner, I want the redesign to be production-ready. *AC:* zero TypeScript/lint/build errors; copy reviewed and approved; privacy-preserving (no trackers); LCP ≤ 2.5s on mid-tier mobile.

---

## 5. Medical Safety & Content Policy (Hard Constraints)

These are **release-blocking** invariants, not preferences:

1. **S1** The AI must never present itself as a licensed medical professional.
2. **S2** The AI must never provide a definitive diagnosis or prescribe medication/dosage.
3. **S3** Every AI-generated output must carry the informational-only disclaimer (server-enforced, not just prompt-enforced).
4. **S4** Emergency keyword detection must short-circuit AI calls and surface emergency-services guidance.
5. **S5** AI output must be validated against a strict schema (Zod) before being shown or stored — malformed output is discarded and replaced with a safe fallback.
6. **S6** The product must not be marketed or labeled as a medical device; legal pages must state this.
7. **S7** User health data (symptoms, consultations, chat) must be private by default — visible only to the owning user.

---

## 6. Non-Functional Requirements

### 6.1 Security (OWASP Top 10 2021)
- **A1 Broken Access Control:** every API route authenticates and authorizes per-user; no generic query endpoint without a whitelist.
- **A2 Cryptographic Failures:** passwords hashed with bcrypt (cost ≥ 12); JWT signed HS256 with a strong `AUTH_SECRET` (≥ 32 random bytes, required in production); no secrets in code or client bundles.
- **A3 Injection:** all SQL via parameterized queries (libSQL `?` placeholders); table/column names in any dynamic SQL come from a server-side whitelist, never from user input.
- **A4 Insecure Design:** threat-modeled auth flow; server-side session revocation; single-use reset tokens.
- **A5 Security Misconfiguration:** fail-fast on missing secrets in production; security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy); dependency audit blocking in CI.
- **A6 Vulnerable Components:** `npm audit --audit-level=high` blocking in CI; lockfile committed; Dependabot/Renovate recommended.
- **A7 Auth Failures:** rate-limited login/signup/reset (per-IP + per-account); generic error messages; session expiry and rotation.
- **A8 Data Integrity Failures:** Zod validation on every request body; signed, expiring JWTs.
- **A9 Logging Failures:** structured logs with request IDs; no PII/secrets in logs.
- **A10 SSRF:** outbound calls only to whitelisted providers (Groq API); no user-controlled URLs fetched.

**Session transport (target):** session JWT in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie. The current localStorage/Bearer mechanism is a known gap (see Architecture gap register G1/G2) and must be replaced.

### 6.2 Privacy & Compliance
- Data minimization: collect only what the features need.
- User data rights: export + delete (implemented; must remain tested).
- Nigeria **NDPA 2023** awareness: privacy policy, lawful basis, breach-notification process documented; health-adjacent data treated as sensitive.
- No third-party ad trackers. Analytics, if added, must be privacy-preserving and disclosed.

### 6.3 Performance
- Core Web Vitals targets on 4G mid-tier mobile: **LCP ≤ 2.5s**, **INP ≤ 200ms**, **CLS ≤ 0.1**.
- API p95 latency: analyze ≤ 8s (AI-bound), chat ≤ 5s (AI-bound), all other endpoints ≤ 300ms.
- `Cache-Control: no-store` on authenticated API responses; static assets cached with hashed filenames.

### 6.4 Accessibility
- WCAG 2.1 **AA**: keyboard operability, visible focus, sufficient contrast, reduced-motion support, screen-reader labels, no content on hover-only.

### 6.5 Reliability & Scalability
- Stateless application tier (horizontal scale on Vercel or Docker replicas).
- Database: libSQL — local SQLite file for dev; **Turso** (libsql://) for production; WAL mode; FK enforcement on.
- Rate limiting: per-IP in-memory limiter acceptable for single-instance; Redis/Upsle-instance; Redis/Upstash adapter interface required before multi-instance scaling.
- Availability target (self-host): 99.5%; backups: Turso/Litestream or scheduled SQLite snapshot upload.

### 6.6 Observability
- Structured JSON logs (level, requestId, route, duration, status).
- Health endpoint `/api/health` (app + DB check).
- Error monitoring (Sentry or equivalent) — P1.

### 6.7 Maintainability & Quality Gates
- TypeScript strict; ESLint (next config) with zero warnings in CI; Prettier formatting.
- Clean Architecture layering: `app/` (adapters) → `lib/` (domain/services) → infrastructure (db, AI provider).
- Every PR: typecheck + lint + tests + build must pass.

---

## 7. API Contracts (Summary)

Full contracts (schemas, status codes, rate limits) live in **`docs/ARCHITECTURE.md` §7**. Summary:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | None | Smoke test / health check *(new)* |
| POST | `/api/local/auth/signup` | None (rate-limited) | Create account, start session |
| POST | `/api/local/auth/login` | None (rate-limited) | Start session |
| POST | `/api/local/auth/logout` | Session | End session (server-side) |
| GET | `/api/local/auth/me` | Session | Current user |
| POST | `/api/local/auth/reset-password` | None (rate-limited) | Request reset email |
| POST | `/api/local/auth/update-password` | Session or reset token | Set new password |
| GET | `/api/local/auth/oauth/[provider]` | None | OAuth start *(decision pending: implement or remove)* |
| POST | `/api/analyze` | Session (10/min per IP) | AI symptom analysis |
| POST | `/api/chat` | Session (rate-limited) | AI health chat |
| GET | `/api/remedies` | Session | Remedies library (with aggregate ratings) |
| GET | `/api/remedies/rating?remedy_id=` | Session | Aggregate rating for a remedy |
| GET | `/api/symptoms` | Session | Symptoms catalog |
| GET | `/api/local/data/remedies` | Session | User-relevant remedies data |
| GET | `/api/local/data/symptoms` | Session | Symptoms data |
| GET | `/api/local/data/export` | Session | Export all user data |
| POST | `/api/local/data/delete-account` | Session | Delete account + data |
| POST | `/api/local/data/query` | Session | Generic query — **must be removed or whitelisted (gap G5)** |

---

## 8. Data Model (Summary)

Full schema and migration plan in **`docs/ARCHITECTURE.md` §6**.

| Table | Purpose |
| --- | --- |
| `users` | Account: email (unique), bcrypt password hash, profile fields |
| `user_preferences` | Theme, notifications, language, preferred remedy types |
| `sessions` | Server-side sessions (target: revocation via `jti`) |
| `consultations` | Saved AI analyses per user |
| `saved_remedies` | User's saved remedies + notes |
| `remedy_ratings` | One rating per user per remedy + review |
| `chat_messages` | Persisted chat per user |

---

## 9. Tech Stack (As-Built)

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + CSS variables |
| Animation | Framer Motion |
| Icons/UI feedback | lucide-react, react-hot-toast |
| Database | libSQL (`@libsql/client`) — SQLite file (dev) / Turso (prod) |
| Auth | Custom JWT (jose, HS256) + bcryptjs |
| AI | Groq `llama-3.3-70b-versatile` with Zod-validated JSON output |
| Validation | Zod (all request bodies) |
| PWA | Web App Manifest + custom `sw.js` |
| CI | GitHub Actions (typecheck, lint, build, audit) |
| Hosting | Vercel (current) · Docker self-host (target) |
| Testing (target) | Vitest (unit + integration) |

---

## 10. Quality Gates (Definition of Done per Stage)

1. **Stage 1 (Architecture):** PRD + architecture + task board approved by product owner.
2. **Stage 2 (Environment):** `npm ci` clean, dev server runs, `/api/health` returns ok, tooling configured.
3. **Stage 3 (Backend):** migrations verified, auth flows tested, all API contracts implemented, `npm test` green, coverage ≥ 70% on core.
4. **Stage 4 (Frontend):** live data everywhere (no mocks), responsive + accessible, `build`/`lint`/`typecheck` zero errors.
5. **Stage 5 (Production):** Docker image builds, CI/CD green, deploy docs verified end-to-end, README complete, release tagged.

---

## 11. DevOps & Deployment Requirements

- **Environments:** local (SQLite file) → preview (PR deploys) → production (Turso + Vercel, or self-hosted Docker).
- **Secrets:** never committed; `.env.example` documents every variable; production boot fails fast on missing `AUTH_SECRET` / `GROQ_API_KEY`.
- **CI/CD:** PR pipeline (test+lint+typecheck+build+audit, all blocking); production deploy on merge to `main`; Docker image pipeline to GHCR (P1).
- **Backups:** production DB backup strategy documented and tested (Turso snapshots / Litestream / scheduled export).
- **Rollback:** previous Vercel deployment / previous Docker image tag restorable in ≤ 15 minutes.
- **Release management:** semantic versioning, `CHANGELOG.md`, GitHub releases with assets.

---

## 12. Success Metrics (KPIs)

| KPI | Target |
| --- | --- |
| CI health | 100% of PRs green on test+lint+typecheck+build |
| Test coverage (core domain) | ≥ 70% lines |
| High/critical dependency vulnerabilities | 0 (blocking) |
| Core Web Vitals (mobile, p75) | LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 |
| Lighthouse Accessibility score | ≥ 95 |
| Lighthouse Performance score (mobile, landing) | ≥ 90 |
| Security | OWASP Top 10 checklist signed off; no secrets in repo history |
| Docs | README + deployment docs complete; new dev setup ≤ 15 min |
| Incident readiness | health check + rollback documented and rehearsed once |

---

## 13. Out of Scope (Explicit)

- Medical diagnosis/triage/treatment, prescriptions, dosages.
- Telemedicine, bookings, clinician accounts, EHR integrations.
- Insurance, billing, payments, subscriptions.
- Native iOS/Android apps.
- Full multi-language rollout (language preference field exists; localization is P2+).
- Admin/moderation dashboard (P2+).
- AI fine-tuning or on-prem models.

---

## 14. Open Questions / Decisions Needed

| # | Question | Default if unanswered |
| --- | --- | --- |
| Q1 | OAuth (Google/GitHub): implement properly or remove entry points? | Remove from UI (no half-wired flows) |
| Q2 | Email provider for password reset (Resend, SMTP, other)? | Abstract `lib/mail` interface + console fallback in dev; Resend in prod |
| Q3 | Rate limiting at scale: Upstash Redis now or later? | In-memory now + adapter interface; Redis before multi-instance |
| Q4 | Primary hosting: Vercel or self-hosted Docker? | Vercel primary; Docker provided as alternative |
| Q5 | Error monitoring: Sentry or equivalent? | Interface + optional Sentry (P1) |
| Q6 | Analytics (privacy-preserving)? | None at launch |
| Q7 | Target production launch date? | TBD — set after Stage 3 |

---

## 15. Approval

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Product Owner | Abdulbasit Abdulalim | ☑ Approve (with E12 premium-landing scope addition) | 2026-10-10 |

*Approval of this PRD authorizes Stage 2 (environment setup) to begin.*
tage 2 (environment setup) to begin.*
