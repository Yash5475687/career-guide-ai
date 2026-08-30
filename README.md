# Career Guide AI

> "Stop guessing what to learn. Start building your career."
> Built by Saksham.

A personalized roadmap platform for engineering students: career discovery, a
year-by-year roadmap, a skill tracker, a curated resource hub, a project
recommender, an AI mentor, a daily study planner, and an internship-readiness
checklist — all backed by a real database and a real (email-OTP) auth flow.

---

## 1. Stack, and why it differs slightly from the original brief

| Layer | Used | Brief asked for | Why changed |
|---|---|---|---|
| Frontend | React + TypeScript + Vite + Tailwind | React + TypeScript + Tailwind | Vite instead of an unspecified bundler — fastest, most standard setup |
| Backend | Node.js + Express | Node.js + Express | ✅ same |
| Database | **SQLite** (better-sqlite3) | PostgreSQL | Zero-config: no database server to install. Schema is plain relational SQL with no SQLite-only features — see "Swapping to Postgres" below |
| Auth | Custom JWT + email-OTP, with a documented **dev mode** | Secure session/JWT | Real email delivery needs a paid provider + domain; dev mode lets you test the entire flow immediately. Swap to `AUTH_MODE=live` for production. |
| AI Mentor | Anthropic API if `ANTHROPIC_API_KEY` is set, else a rule-based fallback | "AI provider, swappable" | Ships working with zero config; upgrade by adding one env var |

Everything else (React Router, Lucide icons, the recommendation engine,
skills/resources/projects catalog, etc.) matches the brief directly.

---

## 2. Quick start (2 terminals)

### Backend

```bash
cd backend
cp .env.example .env
npm install                                             
npm run dev
```

Runs on **http://localhost:4000**. On first run it auto-creates
`careerguide.sqlite3` and seeds it with 10 careers, 44 skills, 34 resources,
and 31 projects. No further setup needed — auth runs in **dev mode** by
default (see below).

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Runs on **http://localhost:5173** (Vite prints the exact URL). Open it in
your browser.

### Using the app in dev mode

1. Landing page → **Build My Roadmap** → enter any email.
2. The verification code is **not emailed** — it's shown directly on screen
   (labeled "Dev mode — no email was sent") and logged in the backend
   terminal. Enter it.
3. Enter a name + college.
4. Complete the 6-step onboarding.
5. You land on the dashboard with a personalized roadmap, starter skills, and
   demo content already populated.

Sign back in later with the same email and you'll skip straight to your
existing dashboard (no re-onboarding).

---

## 3. Project structure

```
career-guide-ai/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express app entry point
│   │   ├── db.js                # SQLite connection + schema
│   │   ├── seed.js              # Demo data loader (idempotent)
│   │   ├── data/                # Careers, skills, resources, projects seed data
│   │   ├── middleware/auth.js   # JWT verification
│   │   ├── services/
│   │   │   ├── emailProvider.js       # OTP delivery — dev mode / real provider
│   │   │   ├── recommendationEngine.js # Rule-based recommendations
│   │   │   └── aiMentor.js             # AI Mentor — Anthropic API + fallback
│   │   └── routes/              # auth, profile, careers, skills, resources,
│   │                             # projects, progress, mentor, quiz, search, dashboard
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/                # One file per screen
    │   ├── components/           # Shared UI (Card, ProgressBar, AppShell, etc.)
    │   ├── context/               # Auth, Theme, Toast
    │   └── lib/                   # Typed API client
    ├── .env.example
    └── package.json
```

---

## 4. Environment variables

See `backend/.env.example` and `frontend/.env.example` — both are fully
commented. Nothing is required to run locally in dev mode; you only need to
fill in values when you want:

- **Real email delivery** — set `AUTH_MODE=live` and provider credentials in
  `backend/.env` (a Resend example is stubbed in `src/services/emailProvider.js`)
- **Real AI Mentor responses** — set `ANTHROPIC_API_KEY` in `backend/.env`
  (falls back to a rule-based mentor if unset — the app works either way)

**The API key is only ever read server-side** — it is never sent to or
reachable from the frontend bundle.

---

## 5. Swapping SQLite for PostgreSQL

The schema in `backend/src/db.js` uses plain SQL with no SQLite-specific
syntax. To move to Postgres:

1. Add an ORM/query builder (Prisma, Drizzle, or Knex) or `pg` directly.
2. Point it at the same table definitions (adjust `AUTOINCREMENT` →
   `SERIAL`/`GENERATED ALWAYS AS IDENTITY`, and `datetime('now')` →
   `now()`).
3. Replace the `better-sqlite3` calls in `db.js` and each route with your new
   client — the route logic and JSON shapes don't need to change, since
   routes only ever call small helper functions.

---

## 6. Deployment notes

- **Frontend**: `npm run build` in `frontend/` produces a static `dist/`
  folder — deploy to any static host (Vercel, Netlify, Cloudflare Pages,
  GitHub Pages). Set `VITE_API_URL` to your deployed backend's URL.
- **Backend**: deploy to any Node host (Render, Railway, Fly.io, a VPS). Set
  `JWT_SECRET` to a real random string, `AUTH_MODE=live` with real email
  credentials, and (optionally) `ANTHROPIC_API_KEY`. SQLite works fine for
  small-to-medium traffic on a single instance; move to Postgres (see above)
  once you need multiple backend instances or higher write concurrency.
- **CORS**: `server.js` currently allows all origins for local development —
  restrict `cors()` to your frontend's real domain before going live.

---

## 7. What's implemented vs. simplified

**Fully implemented and working end-to-end:** email-OTP sign-in with a real
returning-user flow, 6-step onboarding, dashboard with a computed "Next
Step", career explorer + detail + comparison + discovery quiz, roadmap
timeline with persisted milestone completion, skill tracker with per-skill
status/progress, resource hub with topic/free filters, project recommender
(personalized + full catalog) with detail pages, AI mentor with conversation
history, daily study planner with streak tracking, internship readiness
checklist with a live score, global search, profile editing, dark/light
mode, and full mobile responsive navigation.

**Intentionally simplified for a learning/demo project:**
- No admin UI (the backend is structured so one can be added later — content
  lives in typed seed files, not hardcoded into routes)
- Rate limiting on OTP requests is a simple per-email cooldown, not IP-based
- No automated test suite
- The AI Mentor's rule-based fallback covers common question patterns
  well, but isn't a full language model — set `ANTHROPIC_API_KEY` for
  open-ended answers

---

Career Guide AI — Built by Saksham
