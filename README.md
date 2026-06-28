# Medical Assistant (MedAssist)

A modern web application that provides **general health information** and traditional remedy suggestions for educational purposes only. Built with Next.js 16, React 19, Supabase, and Groq AI.

🔗 **Live Demo:** https://medical-assistant-ashen.vercel.app  
👤 **Author:** [Abdulbasit Abdulalim](https://github.com/basgenix4u)

> **⚠️ Medical disclaimer:** This project provides **informational content only**. It is NOT a substitute for professional medical advice, diagnosis, or treatment. If you believe you are experiencing a medical emergency, call your local emergency number (911 in the US, 999 in the UK, 112 in the EU) immediately.

---

## Overview

MedAssist demonstrates how AI-enabled user experiences can support basic health information collection, symptom guidance, and personalized dashboards. The interface is designed with accessibility, responsive design, and progressive web app behavior in mind.

Every response from the AI is explicitly labeled as **informational only**. The system includes safety guardrails that:

- Detect emergency keywords (chest pain, can't breathe, suicidal ideation, etc.) and surface a prominent emergency-services banner.
- Refuse to impersonate a licensed medical professional.
- Refuse to provide definitive diagnoses or prescription advice.
- Recommend seeing a qualified healthcare provider for any concerning symptoms.

---

## Key Features

- **Symptom analysis** with AI (informational only)
- **Natural remedies** library with search and filtering
- **AI chat** for general health questions
- **Emergency escalation** for potential medical emergencies
- **User dashboard** with consultation history and saved remedies
- **Authentication** via email, Google, or GitHub (Supabase)
- **Profile & preferences** including medical conditions, allergies, theme
- **Progressive Web App** with offline support and install prompt
- **Accessibility:** skip-to-content link, focus rings, ARIA roles, prefers-reduced-motion
- **Responsive design** for mobile, tablet, desktop

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + custom CSS variables |
| Animation | Framer Motion |
| AI | Groq (LLaMA 3.3 70B) with Zod schema validation |
| Backend/Auth | Supabase (Postgres + Auth + RLS) |
| Validation | Zod (runtime schema validation) |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/                       Next.js App Router
│   ├── api/                   Authenticated API routes (analyze, chat, remedies, symptoms)
│   ├── auth/                  Login, signup, password reset, OAuth callback
│   ├── dashboard/             Protected dashboard (requires AuthGuard)
│   ├── privacy/               Privacy policy
│   ├── terms/                 Terms of service
│   ├── sitemap.ts             SEO sitemap
│   ├── robots.ts              robots.txt
│   ├── not-found.tsx          404 page
│   └── global-error.tsx       App-level error boundary
├── components/
│   ├── auth/AuthGuard.tsx     Protects dashboard routes
│   ├── landing/               Hero, Features, HowItWorks, Testimonials, CTA, Footer, Header
│   ├── pwa/InstallPrompt.tsx  PWA install prompt
│   ├── shared/                EmergencyBanner, ThemeToggle, Logo
│   ├── symptoms/BodyMap.tsx   Interactive body-map symptom selector
│   ├── remedies/RemedyRating.tsx  Star-rating component for remedies
│   └── analysis/ExportResults.tsx  Share/download analysis
├── lib/
│   ├── ai.ts                  Groq integration with safety guardrails
│   ├── auth-context.tsx       Auth state + secure updatePassword
│   ├── database.ts            Supabase CRUD helpers
│   ├── emergency.ts           Emergency keyword detection
│   ├── profile-context.tsx    Profile state
│   ├── rate-limit.ts          Per-IP rate limiter
│   ├── supabase/              Supabase client/server wrappers
│   ├── theme-context.tsx      Theme (light/dark/system) state
│   ├── constants.ts           Static app constants
│   └── utils.ts               Utility helpers (cn, date, severity)
├── hooks/usePWA.ts            PWA state hook
└── types/index.ts             Shared TypeScript types
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/basgenix4u/medical-assistant.git
cd medical-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Update `.env.local`:

```txt
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
GROQ_API_KEY="your-groq-api-key"
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

```bash
npm run dev          # Start local development server
npm run build        # Build production app
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint errors
npm run typecheck    # TypeScript type-check (no emit)
npm run audit:deps   # npm audit with high-severity threshold
```

---

## Security

- All `/api/*` routes require authentication (Supabase JWT).
- Per-IP rate limiting on AI endpoints (10/min analyze, 20/min chat).
- Emergency keyword detection in `/lib/emergency.ts` short-circuits LLM.
- Zod runtime validation on all request bodies.
- Security headers: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Password changes require current-password verification.
- `next.config.ts` enforces TypeScript errors in builds.

For vulnerability reports, see [SECURITY.md](./SECURITY.md).

---

## Deployment

This project is deployed to Vercel. To deploy your own instance:

1. Create a Supabase project and run the SQL migrations in `supabase/migrations/`.
2. Set up Groq and obtain an API key.
3. Connect this repo to Vercel and set the three environment variables.
4. Configure Supabase Auth redirect URLs to include your production domain.

---

## Roadmap

- [x] Authentication, dashboard, AI analysis, chat, remedies
- [x] Emergency detection + escalation banner
- [x] Zod validation, rate limiting, security headers
- [x] Sitemap, robots, /terms, /privacy, 404, global-error
- [ ] RLS policies and DB migrations as code
- [ ] Multi-language support (i18n)
- [ ] Real-time chat (Supabase Realtime)
- [ ] E2E tests (Playwright)
- [ ] Sentry error tracking
- [ ] Lighthouse CI

---

## Author

Built and maintained by **Abdulbasit Abdulalim**.

- GitHub: https://github.com/basgenix4u
- Website: https://alimswrite.com
- LinkedIn: https://www.linkedin.com/in/abdulbasit-abdulalim-94a701354
