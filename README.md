# 🎯 CareerOS GCC
### The Complete Career Management Platform for UAE & GCC Professionals
**$0 Forever · Hosted on GitHub Pages · No Server Required**

---

## What Is This

CareerOS GCC is a full-featured career management platform built specifically
for UAE and GCC professionals. It runs entirely in the browser using IndexedDB
for local storage — no server, no database cost, no recurring fees.

**Live URL:** `https://YOUR_GITHUB_USERNAME.github.io/careeros-gcc`

---

## Features — Phase 1

| Module | What It Does |
|---|---|
| 🔍 **Job Feed** | Unified feed from RemoteOK, Adzuna UAE/UK, HN Hiring. Deduplicated. Scam-detected. |
| 📋 **Tracker** | Kanban application tracker. All stages. Notes, contacts, follow-up alerts. |
| 📄 **CV Builder** | Discovery questions → AI-generated professional CV. Keywords extracted for matching. |
| 🎯 **Interview** | GCC question bank. AI question generator. Follow-up message writer. |
| 🤝 **Network** | Company watchlist. Contact manager. Headhunter directory. Outreach templates. |
| 💼 **Freelance** | UAE free zone guide. Rate calculator. Freelance permit checklist. |
| 💚 **Wellbeing** | Mood check-in. Weekly goals. Streak tracker. Crisis resources. |
| 👥 **Community** | GCC salary data. Professional group directory. UAE resources. Referral tools. |
| ✨ **AI Assistant** | Conversational career advisor. GCC-specialised. Powered by Gemini free tier. |

---

## Architecture

```
careeros-gcc/
├── src/
│   ├── modules/              ← Each module is FULLY INDEPENDENT
│   │   ├── auth/             ← Landing, Register, Login, Dashboard
│   │   ├── jobs/             ← Job Feed with deduplication
│   │   ├── tracker/          ← Kanban application tracker
│   │   ├── cv/               ← CV Builder by discovery questions
│   │   ├── interview/        ← Interview prep and follow-up writer
│   │   ├── network/          ← Companies, contacts, headhunters
│   │   ├── wellbeing/        ← Mood tracking, goals, crisis resources
│   │   ├── community/        ← Salary data, groups, resources
│   │   ├── freelance/        ← UAE freelance guide and calculator
│   │   └── ai-assistant/     ← Conversational AI career advisor
│   │
│   ├── components/
│   │   ├── ui/               ← Button, Card, Input, Modal, Badge, Tabs
│   │   └── layout/           ← AppShell (sidebar navigation)
│   │
│   ├── services/
│   │   ├── db/               ← IndexedDB service (zero deps)
│   │   ├── api/              ← Job APIs, Gemini AI, notifications
│   │   └── notifications/    ← Telegram bot delivery
│   │
│   ├── hooks/                ← useAuth, useDB
│   ├── store/                ← authStore (pure JS, no Redux)
│   └── styles/               ← Global CSS design tokens
│
├── .github/
│   └── workflows/
│       ├── deploy.yml        ← Auto-deploy to GitHub Pages on push
│       └── keepalive.yml     ← Supabase keep-alive ping every 5 days
│
├── index.html
├── vite.config.js
└── package.json
```

### Zero Interdependency Design

Every module in `src/modules/` is completely self-contained:
- Imports ONLY from `../../components/ui`, `../../hooks`, and `../../services`
- Never imports from another module
- Can be removed, replaced, or updated without touching anything else
- Each module is lazy-loaded — only downloads when the user navigates to it

---

## Setup — Step by Step

### Prerequisites
- A GitHub account (free)
- Node.js 18+ installed on your computer
- Git installed on your computer

---

### STEP 1 — Create GitHub Repository

1. Go to **github.com** → Click the **+** button → **New repository**
2. Repository name: `careeros-gcc`
3. Set to **Public** (required for free GitHub Pages)
4. ✅ Add a README: No (we have one)
5. Click **Create repository**

---

### STEP 2 — Clone and Install

Open your terminal / command prompt:

```bash
# Clone your new empty repo
git clone https://github.com/YOUR_GITHUB_USERNAME/careeros-gcc.git
cd careeros-gcc
```

Copy all the files from this project into the `careeros-gcc` folder.

Then install dependencies:
```bash
npm install
```

---

### STEP 3 — Update Your Username

Open `package.json` and update:
```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/careeros-gcc"
```

Open `vite.config.js` — the base is already set to `/careeros-gcc/` ✅

Open `src/main.jsx` — the basename is already set to `/careeros-gcc` ✅

---

### STEP 4 — Test Locally

```bash
npm run dev
```

Open `http://localhost:5173/careeros-gcc/` in your browser.

Register a test account. Explore all modules. Verify everything works.

---

### STEP 5 — Enable GitHub Pages

1. Go to your repository on github.com
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**: select **GitHub Actions**
4. Click **Save**

---

### STEP 6 — Push to GitHub

```bash
git add .
git commit -m "feat: CareerOS GCC Phase 1 launch"
git push origin main
```

GitHub Actions will automatically:
1. Install dependencies
2. Build the app
3. Deploy to GitHub Pages

Watch the progress: **Repository → Actions tab**

---

### STEP 7 — Your Live URL

After deployment (usually 2–3 minutes):

```
https://YOUR_GITHUB_USERNAME.github.io/careeros-gcc
```

---

## API Keys — All Free

### Adzuna (Job Feed)
1. Go to **developer.adzuna.com**
2. Register → Create App
3. Copy your `App ID` and `App Key`
4. In CareerOS: Settings → Add Adzuna keys (stored in localStorage)

### Gemini AI (AI Assistant + CV Builder)
1. Go to **aistudio.google.com**
2. Click **Get API key** → Create API key
3. Copy the key
4. In CareerOS: AI Assistant → ⚙️ API Key → Paste and save

### Telegram Notifications (Optional)
1. Open Telegram → Search **@BotFather**
2. Send `/newbot` → Follow prompts → Copy the token
3. Search **@userinfobot** → Send any message → Copy your Chat ID
4. In CareerOS: stored in localStorage under `careeros_telegram`

---

## Updating the App

Any time you push to `main`, GitHub Actions automatically rebuilds and redeploys:

```bash
# Make your changes
git add .
git commit -m "your change description"
git push origin main
```

Deployment completes in ~2 minutes.

---

## Free Tier Limits

| Service | Free Limit | Usage by CareerOS |
|---|---|---|
| GitHub Pages | Unlimited bandwidth | Static files only |
| GitHub Actions | 2,000 min/month (public repo: unlimited) | ~2 min per deploy |
| IndexedDB | 50–80% of device storage | All user data |
| Adzuna API | ~1,000 calls/month | Job search |
| Gemini API | 1,500 requests/day | AI features |
| Telegram Bot | Unlimited | Notifications |

**Total infrastructure cost: $0**

---

## Adding New Modules

Each module is completely isolated. To add a new module:

1. Create `src/modules/your-module/YourModule.jsx`
2. Add the route in `src/App.jsx`
3. Add the nav item in `src/components/layout/AppShell.jsx`
4. That's it. Zero other files to touch.

---

## Roadmap

### Phase 2 (Next)
- Voice interview practice (Web Speech API)
- Portfolio microsite builder
- Calendar integration (Google Calendar)
- Email auto-detection (Gmail OAuth)
- Gamification (XP, badges, levels)
- Golden Visa eligibility checker

### Phase 3
- Browser extension (Chrome + Firefox)
- Peer interview practice matching
- Full Arabic language support
- Mobile PWA with offline mode

### Phase 4 (Commercial)
- Stripe payment integration ($5/month premium)
- Employer job posting portal
- Recruiter database access
- GCC salary report exports

---

## Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React 18 + Vite | Free |
| Routing | React Router v6 | Free |
| Styling | Pure CSS variables | Free |
| Local DB | IndexedDB (browser-native) | Free |
| Hosting | GitHub Pages | Free |
| CI/CD | GitHub Actions | Free |
| Job APIs | Adzuna + RemoteOK + HN | Free |
| AI | Google Gemini 1.5 Flash | Free tier |
| Notifications | Telegram Bot API | Free |

**Zero frameworks. Zero UI libraries. Zero recurring costs.**

---

*CareerOS GCC · Built for UAE & GCC Professionals · Phase 1*
