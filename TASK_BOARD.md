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
- [x] Configured git identity (repo-local) + `.env.local` (dev-only, gitignored) + `data/` + `*.log` gitignore rule
- [x] Smoke-test endpoint created: `GET /api/health` → `{ status: "ok", db: "ok", version }`
- [x] Dev server running in background on `0.0.0.0:3000` (live preview), logs → `/home/user/logs/dev-server.log`
- [x] Verification: `typecheck` 0 errors · `lint` 0 errors (fixed 2 pre-existing `react/no-unescaped-entities` errors in `terms/page.tsx`; 33 unused-import warnings remain → Stage 3/4 cleanup) · `/` 200 · `/auth/login` 200 · `/api/health` 200
- [~] **Approval gate:** environment verified — proceed to Stage 3 (backend)?

## Phase 3 — Backend (Step 3)

- [ ] Database: apply schema deltas D1–D5 (sessions `jti`, indexes, single-use resets)
- [ ] Auth: unify on httpOnly cookie sessions (G1/G2); server-side revocation (G4); AUTH_SECRET fail-fast in production (G3)
- [ ] Remove/whitelist generic `/api/local/data/query` (G5)
- [ ] Mailer abstraction + password-reset delivery (G14/G15)
- [ ] Rate limiter: proxy-aware IP + Redis adapter interface (G8/G12)
- [ ] Tighten CSP (G11); structured logging with request IDs (G13)
- [ ] Clean stale Supabase artifacts + unused-import warnings (G7)
- [ ] Unit + integration tests (Vitest) for auth, analyze, chat, remedies, history, ratings, data rights — **all green, ≥70% core coverage** (G6)

## Phase 4 — Frontend (Step 4)

- [ ] E12 design system: tokens (color/type/spacing/motion) + premium `components/ui` primitives
- [ ] E12 landing rebuild: sticky navbar, hero, social proof, features, product showcase, benefits, testimonials, FAQ, CTA, footer
- [ ] E12 brand-tailored conversion copy for marketing pages (pricing N/A — free product → free-to-use value statement)
- [ ] E12 motion: scroll reveals, staggered entrances, hover/ambient microinteractions (reduced-motion safe)
- [ ] E12 redesign key app pages (dashboard/analyze/chat) to match premium language
- [ ] Unify auth client on cookie session; remove localStorage token (with G1/G2)
- [ ] Responsive + accessible UI audit and fixes — WCAG 2.1 AA, Lighthouse a11y ≥ 95, perf ≥ 90 (G19)
- [ ] Live API integration everywhere — remove all mock/stale Supabase data paths (G7)
- [ ] Loading and error states; auth flows (login/signup/reset; OAuth decision Q1)
- [ ] PWA service worker production review (G17)
- [ ] Production build green: zero TypeScript, lint, and compilation errors

## Phase 5 — Production Readiness (Step 5)

- [ ] Dockerfile (Next.js standalone) + docker-compose + .dockerignore (G9)
- [ ] CI/CD: blocking audit + test job; deploy workflow; security workflow (G16)
- [ ] Environment configuration management (env matrix, secrets docs)
- [ ] DB backup/recovery strategy documented and restore-tested (G18)
- [ ] Comprehensive README + `docs/DEPLOYMENT.md` + CHANGELOG + release assets
- [ ] Dependency update process (Dependabot/Renovate) (G20)
- [ ] Final production-readiness review (OWASP checklist) and release tag

---

## Notes / Decisions Log

- 2026-10-10 — PAT stored in `~/.git-credentials` (chmod 600, git `credential.helper store`); token value is never printed, committed, or embedded in any file. User chose to proceed with current token; rotation deferred until before public launch.
- 2026-10-10 — Supplied "PRD" link actually contained a GitHub credential. Treated as exposed; user advised to revoke. No standalone PRD existed → PRD co-drafted (`docs/PRD.md`).
- 2026-10-10 — Scope confirmed by user: target repo is `basgenix4u/medical-assistant` (spelled `medical-assistant`).
- 2026-10-10 — Stage 1 approved. Product owner accepted all PRD recommendations and added E12: premium, conversion-focused landing redesign (sticky navbar, hero, social proof, features, product showcase, benefits, testimonials, FAQ, CTA, footer; pricing N/A for a free product). Design language: clean typography, generous whitespace, refined gradients, subtle glassmorphism, premium visuals, elegant motion (scroll reveals, staggered entrances, hover effects, ambient motion, microinteractions), responsive + accessible + mobile-first. Recorded as PRD E12 (US12.1–US12.6) and design system in `docs/ARCHITECTURE.md` §4.1; queued as a Stage 4 workstream.
- 2026-10-10 — Stage 2 verified: deps installed, typecheck 0 errors, lint 0 errors (2 pre-existing errors fixed in `terms/page.tsx`), health endpoint live, dev server running with logs to file.
