# Medical Assistant

A modern web-based medical assistant interface for symptom exploration, guided health information workflows, user dashboards and AI-assisted health support experiences.

🔗 **Live Demo:** https://medical-assistant-ashen.vercel.app/auth/login  
👤 **Author:** [Abdulbasit Abdulalim](https://github.com/basgenix4u)

> **Medical disclaimer:** This project is for educational and assistive information workflows only. It is not a replacement for professional medical diagnosis, treatment or emergency care.

---

## Overview

Medical Assistant is built to demonstrate how AI-enabled user experiences can support basic health information collection, symptom guidance and personalized dashboards. The interface is designed with accessibility, responsive design and progressive web app behavior in mind.

---

## Key Features

- Responsive landing page with product sections
- Authentication-ready application structure
- User dashboard layout
- Symptom interaction components
- Body-map UI component
- AI helper layer for health information workflows
- Supabase client/server integration
- Profile and auth context management
- PWA install prompt and offline page
- Theme support and animated UI components
- Exportable result component

---

## Tech Stack

| Area | Technologies |
| --- | --- |
| Framework | Next.js, React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | Radix UI, Lucide Icons, Framer Motion |
| AI | Groq/OpenAI-compatible SDK integrations |
| Backend/Auth | Supabase |
| Deployment | Vercel |

---

## Project Structure

```txt
src/app/                 App router pages and layouts
src/components/          Landing, dashboard, analysis, PWA and shared UI components
src/hooks/               Custom React hooks
src/lib/                 AI, auth, database, constants, Supabase and utilities
src/store/               Client state management
src/types/               TypeScript type definitions
public/                  Static assets and service worker
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

Update `.env.local` with your Supabase and AI provider keys.

### 4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000.

---

## Available Scripts

```bash
npm run dev       # Start local development server
npm run build     # Build production app
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## Environment Variables

See `.env.example`.

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GROQ_API_KEY
```

---

## Deployment

This project can be deployed to Vercel.

Before deployment:

1. Add environment variables to Vercel.
2. Configure Supabase project settings.
3. Confirm authentication redirects.
4. Test dashboard routes, AI workflows and mobile responsiveness.

---

## Roadmap

- Add stronger clinical disclaimer and emergency guidance
- Add user history and saved reports
- Improve AI prompt safety and medical guardrails
- Add role-based admin/reviewer dashboard
- Add automated tests and CI workflow
- Add multi-language support

---

## Author

Built and maintained by **Abdulbasit Abdulalim**.

- GitHub: https://github.com/basgenix4u
- Website: https://alimswrite.com
- LinkedIn: https://www.linkedin.com/in/abdulbasit-abdulalim-94a701354
