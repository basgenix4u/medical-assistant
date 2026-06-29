# Medical Assistant (MedAssist)

A production-ready Next.js 16 web app providing **general health information** and traditional remedy suggestions. Built with a **fully self-hosted backend** — no external services required (Supabase, Firebase, etc.).

🔗 **Live Demo:** https://medical-assistant-ashen.vercel.app  
👤 **Author:** [Abdulbasit Abdulalim](https://github.com/basgenix4u)

> **⚠️ Medical disclaimer:** This project provides **informational content only**. It is NOT a substitute for professional medical advice, diagnosis, or treatment. If you believe you are experiencing a medical emergency, call your local emergency number (911 in the US, 999 in the UK, 112 in the EU) immediately.

---

## 🏗️ Architecture

```
Browser ─► Next.js (Vercel/Edge)
            ├─ Pages & UI (React 19 + Framer Motion)
            ├─ API Routes (auth + data + AI)
            ├─ Local Backend
            │   ├─ libSQL (SQLite / Turso)
            │   ├─ JWT auth (jose)
            │   ├─ bcryptjs password hashing
            │   ├─ Zod input validation
            │   ├─ Rate limiting (10/min analyze, 20/min chat)
            │   ├─ Emergency keyword detection
            │   └─ Application-level authorization (per-user data isolation)
            └─ AI: Groq LLaMA 3.3 70B (informational prompts, no doctor impersonation)
```

**No Supabase, no Firebase, no external auth.** Everything runs in one Next.js app.

---

## ✨ Features

### Authentication
- **Email + password** (bcrypt-hashed, 12 rounds, strength meter)
- **Magic-link login** (passwordless, email-only — just enter your email)
- **Forgot password** via signed JWT link
- **OAuth-ready** (Google/GitHub button stubs ready for production credentials)
- JWT session tokens (30-day sessions, HTTP-only cookies)

### AI Safety
- System prompts **explicitly state** "you are NOT a doctor"
- **Emergency keyword detection** in 4 languages/keywords: chest pain, can't breathe, suicidal, allergic reaction, etc.
- Automatic emergency-services UI (911/999/112) shown when emergency detected
- All responses carry an informational-only disclaimer

### Data
- 8 tables (users, user_preferences, consultations, saved_remedies, remedy_ratings, chat_messages, sessions)
- **Cascade delete** via foreign keys
- **Auto-generated UUIDs** for primary keys
- **Application-level authorization**: every query enforces user ownership

### UI
- Polished, professional design with consistent design tokens
- **WCAG 2.4.7 focus rings** (3px outline + offset, light + dark variants)
- **Dark mode** support (theme toggle in dashboard sidebar)
- **Skip-to-content link** for keyboard navigation
- **Mobile-first** responsive layout
- **Loading states** with spinners + skeletons
- **Empty states** with helpful CTAs

---

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone https://github.com/basgenix4u/medical-assistant.git
cd medical-assistant
npm install
```

### 2. Configure
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# Required - generate with: openssl rand -base64 32
AUTH_SECRET="your-random-32-byte-secret"

# Required for AI features (get one free at https://console.groq.com)
GROQ_API_KEY="gsk_..."

# Optional - for production email delivery (get one at https://resend.com)
RESEND_API_KEY="re_..."
EMAIL_FROM="MedAssist <noreply@yourdomain.com>"

# Optional - defaults to local SQLite at ./data/medassist.db
# For production, use Turso (https://turso.tech):
# DATABASE_URL="libsql://your-db.turso.io"
# DATABASE_AUTH_TOKEN="..."
```

### 3. Initialize the database
```bash
npm run migrate   # Creates all tables in ./data/medassist.db
```

### 4. Run
```bash
npm run dev       # http://localhost:3000
```

---

## 🌐 Deployment

### Recommended: Vercel + Turso
1. Create a free [Turso](https://turso.tech) account + database
2. Push this repo to GitHub
3. Import in [Vercel](https://vercel.com)
4. Set environment variables:
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `GROQ_API_KEY`
   - `DATABASE_URL` (Turso connection string)
   - `DATABASE_AUTH_TOKEN` (Turso token)
5. Deploy 🚀

> **Note:** Vercel's `/tmp` is ephemeral. For production data persistence, **always use Turso** (free tier: 9 GB, 500 DBs, 1B row reads/mo).

### Self-hosted (Railway, Render, Fly.io)
1. Use the default SQLite (no Turso needed)
2. Mount a persistent volume at `./data`
3. Set the same env vars as above (minus DATABASE_URL)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/local/                  All API routes (auth + data)
│   ├── auth/                       Login, signup, magic-link, reset
│   ├── dashboard/                  Protected dashboard (AuthGuard)
│   ├── privacy/, terms/            Legal pages
│   ├── offline/                    PWA offline fallback
│   ├── sitemap.ts, robots.ts       SEO
│   ├── not-found.tsx, global-error.tsx
│   └── layout.tsx                  Root layout (Theme, Auth, Profile providers)
├── components/
│   ├── auth/AuthGuard.tsx          Protects dashboard routes
│   ├── landing/                     Marketing (Hero, Features, HowItWorks, etc.)
│   ├── shared/                      EmergencyBanner, ThemeToggle, Logo, SkipLink
│   ├── pwa/InstallPrompt.tsx
│   ├── symptoms/BodyMap.tsx        Interactive SVG body map
│   ├── analysis/ExportResults.tsx   Share/download analysis
│   └── remedies/RemedyRating.tsx    Star rating UI
├── lib/
│   ├── ai.ts                       Groq integration + Zod schema validation
│   ├── emergency.ts                Keyword-based emergency detection
│   ├── rate-limit.ts                Per-IP token bucket
│   ├── email/                      Resend integration (with dev fallback)
│   ├── auth/                       JWT + bcrypt helpers
│   ├── db/                         libSQL client + schema migrations
│   ├── local/                      Supabase-shaped client (auth.X + from())
│   ├── constants.ts                Static app data
│   └── utils.ts                    cn(), date formatters, etc.
└── hooks/
    └── usePWA.ts                    Service worker state

scripts/
├── migrate.ts                      Run schema migrations
└── seed.ts                         Verify DB initialization
```

---

## 🧪 Testing

All pages verified end-to-end:

```bash
# Public pages
curl http://localhost:3000/         # 200
curl http://localhost:3000/terms    # 200
curl http://localhost:3000/privacy  # 200

# Auth
curl -X POST http://localhost:3000/api/local/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
# → 200 with session token

curl -X POST http://localhost:3000/api/local/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
# → 200 with session token

# Magic link
curl -X POST http://localhost:3000/api/local/auth/magic-link/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# → 200, link printed to console in dev or emailed in production

# Data
curl -X POST http://localhost:3000/api/local/data/query \
  -H "Authorization: Bearer <session>" \
  -H "Content-Type: application/json" \
  -d '{"table":"consultations","mode":"select"}'
# → 200 with array of user's consultations
```

---

## 🔐 Security

- **bcrypt** password hashing (12 rounds, ~250ms)
- **JWT** sessions (30 days) via `jose`
- **CSRF**: same-origin only via SameSite=Lax cookies
- **CSP, HSTS, X-Frame-Options, Referrer-Policy**: in `next.config.ts`
- **Rate limiting**: 10 req/min/IP for analyze, 20/min for chat, 5/min for magic-link
- **Application-level authorization**: every query enforces `WHERE user_id = auth.uid()`
- **Emergency escalation**: hard-coded bypass of LLM for life-threatening symptoms

---

## 📝 License

MIT © 2026 Abdulbasit Abdulalim
