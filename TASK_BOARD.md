# Medical Assistant — Production Readiness Task Board

> **Project:** `basgenix4u/medical-assistant` (Next.js 16 + React 19 + TypeScript + libSQL + Groq AI)
> **Started:** 2026-10-10 · **Owner:** Software Factory (PM · Architect · Full-Stack · DevOps/SRE · UI/UX · QA)
> **Legend:** `[ ]` Pending · `[~]` In Progress · `[x]` Completed — exactly one `[~]` at any time.
> **Source of truth:** `docs/PRD.md` v0.2 (approved baseline 2026-10-10, incl. E12 premium-landing scope).

---

## Phase 0 — Security & Access

- [x] Store GitHub PAT only in the local git credential store (never in repo, docs, or logs)
- [x] Validate GitHub auth and locate target repo (`basgenix4u/medical-assistant`, branch `main`)
- [x] Clone repository and inventory existing codebase (~14.4k LOC TS/TSX)
- [x] Resolve PRD blocker: no standalone PRD existed → co-drafted `docs/PRD.md` with product owner (decision 2026-10-10)
- [ ] Rotate exposed PAT before public launch — user deferred rotation on 2026-10-10 (proceed with current token; stored only in `~/.git-credentials`)

## Phase 1 — Review & Architecture (Step 1) ✅ APPROVED

- [x] Preliminary codebase audit (structure, stack, schema, CI, docs)
- [x] Draft PRD from codebase + stakeholder goals → `docs/PRD.md`
- [x] Validate architecture; propose system architecture, DB schema, API contracts, folder structure → `docs/ARCHITECTURE.md`
- [x] Identify gaps/inconsistencies → Gap Register G1–G20 in `docs/ARCHITECTURE.md` §13
- [x] Add E12 scope: premium conversion-focused landing redesign (user stories US12.1–US12.6 + design system §4.1)
- [x] **Approval gate:** product owner approved PRD v0.2 + architecture + board on 2026-10-10

## Phase 2 — Development Environment (Step 2) ✅ VERIFIED

- [x] Project structure and configs verified (`package.json`, `tsconfig.json` strict, `.gitignore`, `.env.example`, `eslint.config.mjs`)
- [x] Added Prettier (`.prettierrc`, `.prettierignore`, `format` / `format:check` scripts)
- [x] Installed dependencies non-interactively (`npm install --yes`, 420 packages)
- [x] Configured git identity + `.env.local` (dev-only, gitignored) + `data/` + `*.log` gitignore rule
- [x] Smoke-test endpoint created: `GET /api/health` → `{ status: "ok", db: "ok", version }`
- [x] Dev server running in background on `0.0.0.0:3000` (live preview), logs → `/home/user/logs/dev-server.log`
- [x] Verification: `typecheck` 0 errors · `lint` 0 errors · `/` 200 · `/auth/login` 200 · `/api/health` 200
- [x] **Approval gate:** environment verified — approved 2026-10-10

## Phase 3 — Backend (Step 3) ✅ COMPLETE — ALL TESTS GREEN

- [x] Database: migrations 0002–0005 applied — `sessions.jti` + unique index (D1/D2), `password_resets` single-use table (D4), extra indexes (D3), `users.medical_conditions`/`allergies` (D7)
- [x] Auth: cookie-only httpOnly sessions (`Secure`, `SameSite=Strict`) — localStorage/Bearer removed (G1/G2); DB-backed revocation via `jti` (G4); `AUTH_SECRET` fail-fast in production (G3)
- [x] Query endpoint locked down (G5): per-table identifier whitelists, forced owner scoping, `password_hash` stripped, hidden-column protection
- [x] Mailer abstraction + single-use reset tokens (G14/G15) — console mailer in dev, Resend in prod
- [x] Rate limiter: proxy headers trusted only with `TRUST_PROXY=1` (G8/G12)
- [x] CSP tightened: production drops `unsafe-eval` + Supabase origins (G11); structured redaction-aware logging (G13)
- [x] Supabase shims + OAuth routes + auth callback removed (G7 backend); login/signup pages OAuth-free (PRD Q1 default)
- [x] Reset-password page now performs the REAL flow (was a stub); auth-context cookie-based, no OAuth methods
- [x] Vitest suite (G6): **33 tests / 8 files green · 76.45% line coverage on core domain** (target ≥ 70%)
- [x] Quality gates: `typecheck` 0 errors · `lint` 0 errors · `next build` ✅ · `npm test` ✅
- [x] E2E via curl: signup → me → scoped query → injection-400 → password_hash stripped → remedies+aggregates → analyze (fallback + disclaimer) → 401 unauth → reset → single-use replay-400 → login(new pw) → logout → me=null
- [x] CI updated: test job + blocking `npm audit`; Supabase dummy env replaced with `AUTH_SECRET`

## Phase 4 — Frontend (Step 4) — E12 premium landing redesign first ✅ COMPLETE

- [x] **Approval gate:** Stage 4 approved 2026-10-10 (frontend + E12 premium landing redesign)
- [x] E12 design system: tokens (color/type/spacing/motion) appended to `globals.css` + premium `components/ui` primitives (`Reveal`, `GlassCard`, `PremiumButton`, `SectionHeader`)
- [x] E12 landing rebuild: sticky navbar, hero, social proof, features, product showcase, benefits, testimonials, FAQ, CTA, footer (`src/components/marketing/` ×10, `src/app/page.tsx` rewritten)
- [x] E12 brand-tailored conversion copy (P1 Curious Casey primary / P3 Caregiver Chris secondary; free-to-use value statement in lieu of pricing — free product)
- [x] E12 motion: scroll reveals (`Reveal`), staggered entrances, hover lifts, ambient gradient blobs, FAQ accordion — all `prefers-reduced-motion` safe
- [x] E12 redesign of key app pages: auth pages (`auth-page`/`auth-card`), dashboard layout (glass sidebar, `nav-item` classes, gradient logo tiles, `page-title` on all 11 dashboard h1s)
- [x] Clean remaining stale artifacts + unused-import warnings: old `src/components/landing/` deleted; **lint 0 errors, 0 warnings** (32 warnings cleared incl. dead `handleNativeShare`, unused lucide block in `constants.ts`, `useCallback` deps fix)
- [x] Responsive + accessible UI audit (G19 manual pass): mobile-first breakpoints, semantic landmarks + skip link, `aria-labelledby` on sections, labelled accordions, focus-visible rings, reduced-motion support, contrast-safe tokens
- [x] Live API integration everywhere: cookie-session auth context, remedies + rating aggregates, analyze endpoint — E2E verified via curl (auth flow, 401s, injection-400)
- [x] Loading/error states verified across pages; `/offline` fallback page + PWA install prompt
- [x] PWA service worker production review (G17): `sw.js` v2 cache + navigation offline fallback; `/manifest.json` 200, `/sw.js` 200
- [x] Production build green: **typecheck 0 errors · lint 0/0 · 33/33 tests · `next build` ✅ · all 8 routes 200** (incl. new landing hero/anchors verified in served HTML)
- [x] **E12 v2 revision (user feedback 2026-10-10):** full palette overhaul — muddy brown/beige replaced with viridian `#0E7A5F` + warm amber `#F2A65A`, WCAG-AA contrast verified, old hex purged from all source; Fraunces (display) + Manrope (body) self-hosted type pairing; new **Pricing** section ($0 free-forever plan card + reassurance row); animated stat counters; hero pointer-parallax + richer product mock; fixed responsive grids that inline styles were overriding (hero 2-col, footer, benefits, stats)

## Phase 5 — Production Readiness (Step 5)

- [~] **Approval gate:** proceed to Stage 5 (production readiness: Docker, CI/CD, env config, README, deployment docs, releases)?
- [ ] Lighthouse CI gate: a11y ≥ 95, perf ≥ 90 on landing + key pages (G19 automated; manual WCAG pass done in Phase 4)

- [ ] Dockerfile (Next.js standalone) + docker-compose + .dockerignore (G9)
- [ ] CI/CD: deploy workflow (Vercel prod / GHCR image); security workflow (G16)
- [x] Environment configuration management: env matrix + secrets docs in `docs/DEPLOYMENT.md` + annotated `.env.example`
- [x] **Vercel deploy unblocked (user-reported failure):** root cause = `env.ts` threw at import time during `next build` when `AUTH_SECRET` was unset → validation now strict at runtime, tolerant during build phase; verified with a zero-env `next build` (exit 0). Plus: Turso `DATABASE_URL` support, ephemeral `/tmp` fallback on Vercel, full Vercel + Turso setup guide
- [ ] DB backup/recovery strategy documented and restore-tested (G18)
- [ ] Comprehensive README + `docs/DEPLOYMENT.md` + CHANGELOG + release assets
- [ ] Dependency update process (Dependabot/Renovate) (G20)
- [ ] Final production-readiness review (OWASP checklist) and release tag

---

## Notes / Decisions Log

- 2026-10-10 — PAT stored in `~/.git-credentials` (chmod 600, git `credential.helper store`); token value is never printed, committed, or embedded in any file. User chose to proceed with current token; rotation deferred until before public launch.
- 2026-10-10 — Supplied "PRD" link actually contained a GitHub credential. Treated as exposed; user advised to revoke. No standalone PRD existed → PRD co-drafted (`docs/PRD.md`).
- 2026-10-10 — Scope confirmed by user: target repo is `basgenix4u/medical-assistant` (spelled `medical-assistant`).
- 2026-10-10 — Stage 1 approved. Product owner accepted all PRD recommendations and added E12: premium, conversion-focused landing redesign. Recorded as PRD E12 (US12.1–US12.6) and design system in `docs/ARCHITECTURE.md` §4.1; queued first in Stage 4.
- 2026-10-10 — Stage 2 verified: deps installed, typecheck 0 errors, lint 0 errors, health endpoint live, dev server running with logs to file.
- 2026-10-10 — Stage 3 complete. Decisions: (a) OAuth removed per PRD Q1 default — no half-wired auth; (b) reset flow is now real and single-use; (c) sessions are cookie-only with server-side revocation; (d) generic query endpoint locked to whitelists; (e) mailer = console (dev) / Resend (prod); (f) tests via Vitest, 76.45% core coverage; (g) new endpoint `GET /api/remedies/rating` + aggregate ratings on `GET /api/remedies`.
- 2026-10-10 — Sandbox note: `~/.git-credentials` and `.git/config` do not persist between commands (excluded from snapshots) — credential store and git identity are re-established per command; commits use `GIT_AUTHOR_*`/`GIT_COMMITTER_*` env vars.
