# IMPUNGA — Zambia's Economic Intelligence Platform

IMPUNGA is a single-page React web app that helps Zambian entrepreneurs and job seekers do three things: **turn a business idea into a real, registered business; find money to fund it (grants, loans, investors); and build the professional skills/career materials to get hired.** Everything runs in the browser, backed by a Firebase project for accounts/data and an LLM (see the important naming note below) for the "AI" features.

This document is written so someone can narrate a full walkthrough of the app from it alone — every route, every button's internal logic, and every place data is (or isn't) actually saved.

> **Important naming note before anything else:** throughout the codebase, hooks and variables are named `useGemini`, `VITE_GEMINI_API_KEY`, "Gemini AI," etc. **The app does not actually call Google Gemini.** `src/lib/gemini.js` sends every request to **Groq's API** (`api.groq.com`) running Meta's **Llama 3.3 70B Versatile** model. The `@google/genai` package is installed in `package.json` but is never imported or used anywhere in the source. Only one UI surface states the true provider correctly: the footer of the search modal (`SemanticSearch.jsx`) says "Powered by Groq AI." Everywhere else — env var names, hook names, on-screen copy like "Gemini AI will structure a complete document" — says Gemini. Treat "Gemini" in this codebase as a legacy/misleading label for "the AI backend," which is actually Groq/Llama.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Project Structure](#4-project-structure)
5. [Features & Functionality](#5-features--functionality)
6. [Authentication & Permissions](#6-authentication--permissions)
7. [Data Models](#7-data-models)
8. [Setup & Installation](#8-setup--installation)
9. [How to Run](#9-how-to-run)
10. [Key User Flows](#10-key-user-flows)
11. [Known Gaps, Dead Code & Inconsistencies](#11-known-gaps-dead-code--inconsistencies)

---

## 1. Overview

**What it does:** IMPUNGA is a "do everything in one place" web app for a Zambian entrepreneur or job seeker. A user can validate a business idea with AI, write a full business plan, generate a pitch deck, register with PACRA/ZRA, track income and expenses, price their products, find grants/loans/investors, build a skill profile, get AI-matched to careers, generate a CV and cover letter, practice interviews, and browse jobs, tenders, rentals, and a business directory — all from one account.

**Who it's for:** Zambian entrepreneurs at any stage (idea → registered → growing business) and job seekers/professionals building a career, across all 10 provinces. The AI system prompts explicitly encode Zambian context — PACRA/ZRA/NAPSA/NHIMA regulations, Kwacha currency, the 10 provinces, real Zambian banks and mobile money providers, and Bemba/Nyanja/Tonga language flavor for business names.

**Core purpose in plain language:** it's a free, AI-assisted business-and-career coach plus a lightweight set of practical tools (bookkeeping, invoicing, pricing, CV/cover-letter builders) that would otherwise require paying a consultant, an accountant, or a career coach separately.

**Origin/context:** built for the 2026 JETS National Innovation Challenge (Zambia), under the "5-Engine Ecosystem" architecture described inside the app itself: Business, Skills, Finance, Connect (Community), and Gateway (AI Assistant).

**A note on how "real" each feature is:** this matters for an honest walkthrough. Some tools are backed by real, persistent, per-user Firestore data (Idea Validator, Business Plan Builder, the Business Ledger, Skill Profile). Others are **simulated/local-only prototypes** — job/tender/rental/directory "postings" live only in the current browser's `localStorage`, "applying" or "contacting" someone just shows a success toast and sends nothing anywhere, and the Savings/KPI-target tools never touch a server at all. Section 5 marks each feature's persistence tier explicitly so the video doesn't over-claim what's live.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI framework | React | 19.2.6 |
| Build tool / dev server | Vite | 8.0.12 |
| Routing | React Router (`react-router-dom`) | 7.16.0 |
| Styling | Tailwind CSS (+ `@tailwindcss/postcss`, `autoprefixer`) | 4.3.0 |
| Global state | Zustand | 5.0.14 |
| Forms + validation | React Hook Form + `@hookform/resolvers` + Zod | 7.76.1 / 5.4.0 / 4.4.3 |
| Auth + database | Firebase (`firebase/app`, `firebase/auth`, `firebase/firestore`) | 12.14.0 |
| AI backend | Groq API (`api.groq.com`, model `llama-3.3-70b-versatile`) — called via plain `fetch`, no SDK | n/a (REST) |
| Unused AI SDK (installed, never imported) | `@google/genai` | 2.7.0 |
| Icons | `lucide-react` | 1.17.0 |
| Charts | Recharts | 3.8.1 |
| PDF generation | `jspdf` + `jspdf-autotable` | 4.2.1 / 5.0.8 |
| PDF markdown rendering | in-house (`src/lib/markdownRuns.js`, `src/lib/pdfMarkdown.js`) | — |
| PowerPoint generation | `pptxgenjs` | 4.0.1 |
| Word document generation | `docx` | 9.7.1 |
| Excel/spreadsheet export | `xlsx` (SheetJS) | 0.18.5 |
| PWA / offline support | `vite-plugin-pwa` (Workbox under the hood) | 1.3.0 |
| Linting | ESLint (+ `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) | 10.3.0 |
| Hosting/deploy target | Vercel (SPA rewrite in `vercel.json`) | — |
| Firestore rules deploy | Firebase CLI project config (`firebase.json`, `.firebaserc`, `firestore.rules`) | — |

No backend server code exists in this repo — there is no Express/Node API, no serverless functions folder. All "backend" logic is either (a) Firebase (auth + Firestore, called directly from the browser with security enforced by `firestore.rules`) or (b) a direct client-side `fetch()` to Groq's public chat-completions endpoint. This is a pure static SPA that talks to two third-party APIs.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                   │
│   React 19 SPA (Vite build, PWA/service-worker cached)          │
│   ┌───────────┐   ┌──────────────┐   ┌────────────────────┐    │
│   │  Pages     │──▶│  Hooks       │──▶│  lib/*.js clients  │    │
│   │ (src/pages)│   │ useAuth      │   │  firebase.js       │    │
│   │            │   │ useFirestore │   │  gemini.js         │    │
│   │            │   │ useGemini/AI │   │                    │    │
│   └───────────┘   └──────────────┘   └─────────┬──────────┘    │
│         ▲                 ▲                     │               │
│         │           Zustand stores               │               │
│         │      (authStore, businessStore,        │               │
│         │           themeStore)                  │               │
│         │                                         │               │
│         │           localStorage                  │               │
│         │  (idea pipeline handoff, chat history,   │               │
│         │   gigs/tenders/assets/portfolios/hub     │               │
│         │   profiles, savings & KPI targets, theme) │               │
└─────────┼─────────────────────────────────────────┼───────────────┘
          │                                          │
          │ HTTPS (Firebase SDK)                     │ HTTPS fetch()
          ▼                                          ▼
┌───────────────────────────┐          ┌──────────────────────────┐
│   Firebase (Google Cloud)  │          │      Groq Cloud API      │
│  ─ Firebase Auth            │          │  api.groq.com            │
│    (email/password,         │          │  model: llama-3.3-70b-   │
│     Google, Apple OAuth)    │          │  versatile                │
│  ─ Cloud Firestore           │          │  (chat completions,      │
│    (per-user documents,      │          │   stateless — the app    │
│     access controlled by     │          │   resends conversation    │
│     firestore.rules)         │          │   history each call)      │
└───────────────────────────┘          └──────────────────────────┘
```

**Request/data flow, step by step, for a typical AI-driven action** (e.g. clicking "Generate Blueprint" on Idea Validator):

1. User fills a form in a page component (e.g. `IdeaValidator.jsx`). Form state lives in local React `useState`.
2. On submit, the page calls a named function from the `useGemini()` hook (e.g. `validateBusinessIdea(wizardData)`), aliased everywhere as `useAI()`.
3. That hook function builds a large, Zambia-specific prompt string (hardcoded in `src/hooks/useGemini.js`) plus a system-instruction string, and calls `callGemini(prompt, systemInstruction)` from `src/lib/gemini.js`.
4. `callGemini` first checks a **localStorage response cache** (`impunga_ai_*` keys, 6-hour TTL, keyed by a hash of the prompt) — if a cached answer exists, it's returned instantly with no network call. This cache is only used for one-shot structured calls, never for chat (`callGeminiWithHistory` skips it).
5. If not cached, it does a `fetch(POST https://api.groq.com/openai/v1/chat/completions)` with the Groq API key (from `VITE_GEMINI_API_KEY`) in the `Authorization` header, `model: llama-3.3-70b-versatile`, `max_tokens: 2048`.
6. Groq returns a chat-completion response; the assistant's text is extracted, cached (if applicable), and returned up through the hook to the page.
7. Most prompts instruct the model to return **strict JSON** (no markdown fences) matching an exact shape the hook then `JSON.parse`s (after stripping any accidental ` ```json ` fences) — this is the app's only "structured output" mechanism; there's no JSON-mode API parameter in use, just prompt instructions plus defensive string cleanup.
8. The page renders the parsed result. If the feature has a "Save" button, it calls `addDocument`/`updateDocument` from `useFirestore()` (`src/hooks/useFirestore.js`), which writes to Cloud Firestore, stamping the document with `userId: user.uid` and `createdAt`/`updatedAt` server timestamps.
9. Firestore's security rules (`firestore.rules`) are evaluated server-side on every read/write: a user can only read/write documents in a fixed allow-list of collections where `resource.data.userId` (or the document ID, for `users`/`skillProfiles`) matches their own authenticated `uid`. Everything else is denied by default.
10. If the feature has an "Export" option, the already-in-memory result is fed to a client-side generator (`jsPDF`, `pptxgenjs`, `docx`, or `xlsx`) and downloaded directly from the browser — none of these exports touch a server.

**Authentication flow:** a single `onAuthStateChanged` listener in `src/App.jsx` (mounted once, unconditionally, at the top of the component tree) is the sole source of truth for auth state. On any sign-in/sign-out event it updates a Zustand store (`useAuthStore`) with `user`, `userProfile` (the Firestore `users/{uid}` document), and `loading`. The entire authenticated app shell (`Layout.jsx`) blocks rendering behind `loading`, then redirects to `/login` if there's no user.

**Offline behavior:** the app is a PWA (`vite-plugin-pwa`, `registerType: 'autoUpdate'`) — Workbox precaches all built JS/CSS/HTML so the shell loads offline, and `OfflineBanner.jsx` watches `navigator.onLine` to show a banner explaining that Registration Guide and Pricing Calculator still work offline but AI features need a connection (both of those tools have static/deterministic paths that don't require the Groq call to function at all).

---

## 4. Project Structure

```
impunga-app/
├── index.html                  Entry HTML — preconnects to Firestore/Auth/Groq, loads src/main.jsx
├── vite.config.js               Build config: PWA plugin, manual chunk-splitting per heavy
│                                 dependency (vendor-pdf, vendor-docx, vendor-pptx, vendor-excel,
│                                 vendor-charts, vendor-firebase, vendor-icons, vendor-forms,
│                                 vendor-router, vendor-react) so each lazy-loaded page only
│                                 pulls in the libraries it actually needs
├── tailwind.config.js            Tailwind theme (colors, etc.)
├── postcss.config.js             PostCSS pipeline for Tailwind
├── eslint.config.js               Lint rules (flat config)
├── vercel.json                    SPA rewrite: all paths → /index.html (fixes 404 on refresh/deep-link)
├── firebase.json                  Points Firebase CLI at firestore.rules
├── firestore.rules                 Server-side Firestore security rules (see §6)
├── .firebaserc                     Firebase project alias ("impunga")
├── .env.example                    Template for required environment variables (see §8)
├── package.json                    Dependencies + npm scripts (dev/build/lint/preview)
│
├── src/
│   ├── main.jsx                   React root — renders <App/> in <StrictMode>, imports global CSS
│   ├── App.jsx                    Top-level router: the ONE onAuthStateChanged listener, all
│   │                               <Route> definitions, lazy-imports every page
│   ├── App.css                     (legacy/global overrides, minor)
│   │
│   ├── pages/                     One file per route — 41 files (39 routed, 2 unrouted/dead —
│   │                               see §11). This is where almost all feature logic lives; pages
│   │                               call hooks directly rather than going through a service layer.
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx          Authenticated app shell: gates on auth loading, renders
│   │   │   │                        Header + Sidebar + <Outlet/> + mobile bottom nav + floating
│   │   │   │                        AI button, tracks "visited module" stats to localStorage
│   │   │   ├── Header.jsx           Top bar: hamburger, page title, search trigger, notification
│   │   │   │                        bell (decorative), avatar dropdown (theme switcher, profile,
│   │   │   │                        logout)
│   │   │   ├── Sidebar.jsx          Left nav — separate mobile drawer / desktop collapsible rail
│   │   │   └── AIChatPanel.jsx      Floating desktop-only mini AI chat widget (distinct from the
│   │   │                             full /ai-advisor page)
│   │   └── shared/                 Reusable UI atoms: AIResponse, EmptyState (unused), ErrorMessage,
│   │                                 LoadingSpinner (+PageLoader), OfflineBanner, PageHeaderCard
│   │                                 (unused), SemanticSearch (the ⌘-K-style AI search modal),
│   │                                 Skeleton (loading placeholders), SuccessToast (app-wide toast
│   │                                 system despite the name)
│   │
│   ├── hooks/
│   │   ├── useAuth.js               Firebase Auth actions: login, loginWithGoogle, loginWithApple,
│   │   │                             register, logout, resetPassword, updateProfile. Does NOT run
│   │   │                             its own auth listener (that lives solely in App.jsx — see §6).
│   │   ├── useFirestore.js          Generic Firestore CRUD: addDocument, updateDocument,
│   │   │                             deleteDocument, getUserDocuments, getDocument,
│   │   │                             getUserDocumentCount — used by almost every data-backed page
│   │   ├── useGemini.js             Every AI "capability" as a named async function (20+ functions
│   │   │                             — idea validation, plan writing, pitch decks, cover letters,
│   │   │                             interview Q&A, etc.), each building its own prompt and calling
│   │   │                             lib/gemini.js
│   │   └── useAI.js                 One-line re-export: `useAI = useGemini` (legacy alias)
│   │
│   ├── lib/
│   │   ├── firebase.js               Firebase app init + exports `auth`, `db`, `googleProvider`.
│   │   │                              Firestore is initialized with long-polling forced on, to
│   │   │                              survive networks that silently break WebSocket streaming.
│   │   ├── gemini.js                  The actual Groq HTTP client + localStorage response cache
│   │   │                              (despite the filename — see the naming note at the top)
│   │   ├── markdownRuns.js            Tokenizes `**bold**`/`*italic*`/bullets into structured
│   │   │                              runs for PDF/PPTX renderers
│   │   ├── pdfMarkdown.js             Draws those tokenized runs into a jsPDF document with real
│   │   │                              bold/italic fonts and manual word-wrap
│   │   ├── stripMarkdown.js           Strips markdown down to clean plain text (for PDFs that
│   │   │                              don't need rich formatting)
│   │   └── utils.js                   Grab-bag of formatters/calculators (Kwacha formatting,
│   │                                   profit/margin/break-even math, greeting/initials helpers,
│   │                                   a downloadBlob helper, label maps)
│   │
│   ├── utils/
│   │   └── parseMarkdown.js          Converts markdown → HTML string (used only by AIResponse.jsx
│   │                                  for on-screen chat rendering — a 4th, separate markdown
│   │                                  strategy alongside the three in lib/)
│   │
│   ├── store/                       Zustand global state (no Redux/Context for app state)
│   │   ├── authStore.js              user, userProfile, selectedPath, loading, customBack/Title
│   │   ├── businessStore.js          Declared but effectively unused — no page actually calls its
│   │   │                              setters (see §11)
│   │   └── themeStore.js              light/dark/system theme, applied to <html class="dark">
│   │                                   before React even renders (avoids a flash of wrong theme)
│   │
│   ├── contexts/
│   │   └── LanguageContext.jsx       English / Bemba / Nyanja translation dictionaries + a `t()`
│   │                                  lookup function — currently only used for the Landing page
│   │                                  tagline; not wired into the rest of the app's UI text
│   │
│   ├── data/                        Static reference data bundled into the app (no CMS/backend) —
│   │                                  business sectors, legal structures, PACRA/ZRA step
│   │                                  checklists, funding sources, market prices by province,
│   │                                  careers catalogue, seed job listings, provinces/districts,
│   │                                  daily tips, and engineModules.js (the master hub/menu config)
│   │
│   └── styles/
│       ├── index.css                 Tailwind entry + global styles
│       └── aiResponse.css             Styling for AI chat markdown output (no dark-mode rules —
│                                       see §11)
│
├── public/                          Static assets: favicon, PWA icons, manifest
└── firestore.rules                  (see root listing above)
```

---

## 5. Features & Functionality

The app organizes its 35 in-app tools into 4 "Engines," reachable from `/engine/:engineId`, plus a standalone AI Assistant and core account pages. Each feature below states its **route**, **what the user is trying to do**, **the internal logic**, and its **persistence tier** — 🔥 Firestore (real, per-user, cross-device), 💾 localStorage (this browser only, not shared), or ⚡ none (generate-and-view or generate-and-download only).

### Core / Account Pages

| Page | Route | Persistence |
|---|---|---|
| **Landing** | `/` (public) | ⚡ none |
| **Login** | `/login` (public) | 🔥 Firebase Auth |
| **Register** | `/register` (public) | 🔥 Firebase Auth + Firestore |
| **Dashboard** | `/dashboard` | 💾 (reads localStorage only) |
| **Profile** | `/profile` | 🔥 |
| **Data Privacy** | `/data-privacy` | 🔥 (read-only counts) |
| **Agreement** | `/agreement` (public) | ⚡ static |
| **AI Advisor** | `/ai-advisor` | 💾 (chat history) |

- **Landing** — marketing splash screen. Static content, pulls a translated tagline from `LanguageContext`. Two buttons: "Get Started" → Register, "Login" → Login.
- **Login** — email/password form (React Hook Form + Zod) plus "Continue with Google" and "Continue with Apple" buttons (Firebase `signInWithPopup`). On success, always navigates to `/dashboard`.
- **Register** — a 2-step wizard. **Step 1:** full name, email, password (min 8 chars), confirm password, age (13–100), sex, and a required "Platform Governance & Disclaimers" checkbox that opens a modal containing the same legal text as the `/agreement` page. **Step 2:** province (dropdown) → district (dependent dropdown, populated from the chosen province). On submit, Firebase creates the auth user, then a `users/{uid}` Firestore document is written with all the collected fields. **Google/Apple sign-up** requires the same disclaimers checkbox to be ticked first, but the resulting profile document is much thinner — it only gets `fullName`, `email`, `createdAt`, `lastActive`. Age/sex/province/district/acceptTerms are never collected for OAuth sign-ups.
- **Dashboard** — the home screen after login. Shows a "continue where you left off" card (from a localStorage-tracked last route), three journey-progress bars (Business/Career/Funding — computed from which module routes you've visited, tracked in localStorage), and static "Economic Intelligence" news cards, alerts, and next-step suggestions. **None of the news/alerts content is live or AI-generated** — it's hardcoded placeholder text in the file.
- **Profile** — edit your business/personal details (name, age, sex, province, district, occupation), see live counts of your saved Business Ideas / Business Plans / Pricing Calculations / Bookmarked Funding, browse and delete your saved Business Ideas, reset your password (sends a Firebase reset email), and **Delete Account** — a two-confirmation flow that bulk-deletes your documents from 7 named Firestore collections, deletes your `users/{uid}` doc, then deletes the Firebase Auth user itself. (See §11 for a real gap: two collections aren't included in this cleanup.)
- **Data Privacy** — explains what data categories IMPUNGA stores, shows a live per-collection document count (6 collections), a "Request Data Deletion" button that only opens a `mailto:` link (it does not itself delete anything — the real delete flow is on the Profile page), and an "Access & Audit Log" panel that is **entirely fake/static** (hardcoded fabricated log entries and a fake IP address, not a real audit trail).
- **Agreement** — a public legal/compliance page explaining IMPUNGA is an educational simulator and informational directory, not a licensed bank/investment firm, citing real Zambian financial-regulation acts. Its "Disclaimer Details" block is imported directly into Register's terms modal, so the two pages share the exact same legal text.
- **AI Advisor** (`/ai-advisor`) — the full-page chat interface. Free-form conversation with the AI (not restricted to platform topics), a categorized FAQ browser (5 categories × 5 example questions) to seed a conversation, conversation history (saved to `localStorage`, capped at 20 threads, only on explicit "New chat"/"History" actions — an abandoned tab is lost), and an **Export** button that now downloads the conversation as a formatted **PDF** (jsPDF, reusing the same markdown-to-PDF renderer as the Business Plan/Pitch Deck exports) rather than plain text. A separate floating **AIChatPanel** widget (desktop only) offers the same chat experience from anywhere in the app without leaving the current page, funneling "History"/"full chat" clicks back to this page.

### Engine 1 — Business (`/engine/business`)

The Business engine has a custom hub (`BusinessHubView.jsx`) instead of the generic module grid used by the other engines. It has 3 internal views, switched via a `?view=` query param:
- **`paths`** (default): two big choices — "Start a Business" (goes to idea validation tools) or "Business Operations" (goes to a short registration form the first time, then the day-to-day toolset thereafter).
- **`ideation`**: Idea Validator, a "Saved Blueprints" modal (your saved `businessIdeas` documents, reopenable/deletable), and links to Name Generator, SWOT Analysis, Business Plan Builder, PACRA Setup Guide (Registration Guide), Pitch Deck Generator, Pricing Calculator.
- **`operations`**: Business Ledger, Invoice Generator, Pricing Calculator, Marketing Tools, KPI & Summaries, Savings Tracker (this exact 6-tool list is the `business` entry in `src/data/engineModules.js`).

| Page | Route | Persistence |
|---|---|---|
| Idea Validator | `/idea-validator` | 🔥 |
| Registration Guide | `/registration-guide` (+ `/regulatory-gateway`) | 💾 |
| Business Plan Builder | `/business-plan` | 🔥 |
| Pitch Deck Generator | `/pitch-deck` | ⚡ |
| Pricing Calculator | `/pricing-calculator` | 🔥 |
| Business Ledger | `/business-ledger` | 🔥 |
| Invoice Generator | `/invoice-generator` | ⚡ |
| SWOT Analysis | `/swot-analysis` | 🔥 |
| Marketing Tools | `/social-media` | ⚡ |
| Business Name Generator | `/name-generator` | 🔥 |
| Compliance Tracker | `/compliance-tracker` | ⚡ (read-only counts for context) |
| KPI & Summaries | `/kpi-tracker` | 💾 |
| Savings Tracker | `/savings-module` | 💾 |

- **Idea Validator** — a 4-step wizard (business type → problem/solution → budget/location → optional extra context). Submitting calls the AI to score the idea 1–10, give a PROCEED/REFINE/RECONSIDER verdict, and write back an executive summary, unit-economics analysis, competitor intel, capital-allocation advice, risk assessment, and (if the score is low) a pivot strategy. The result is written to a special `localStorage['impunga_idea_pipeline']` key — **this is the hidden thread that connects Idea Validator to Business Plan Builder, Pitch Deck Generator, SWOT Analysis, and Registration Guide**, all of which look for this key to auto-fill or auto-generate from your validated idea. You can also **Save** the blueprint to Firestore (`businessIdeas`) and **download a PDF**.
- **Registration Guide** — two tabs. "AI Journey": fill in business name/province/sector/description, get a step-by-step PACRA/ZRA registration roadmap (which permits you specifically need — e.g. a Health Permit for food businesses, ZICTA for tech) plus a "cheat-sheet" of pre-filled PACRA form values; you can check off completed steps and set target dates (progress saved to `localStorage`, not Firestore). "PACRA Comparison Guide": a static 5-question quiz that recommends Sole Trader / Partnership / Private Limited / CBO, plus a comparison table of fees/timeframes/pros-cons for each — no AI involved in this tab.
- **Business Plan Builder** — an 8-step form covering every standard business-plan section, with live-computed startup costs, monthly costs, revenue, and profit as you type. You can save a draft to Firestore at any point (updates the same document on repeat saves), ask the AI to critique your draft plan (strengths/weaknesses/market-reality check, not saved), or generate a fully AI-written, polished business plan PDF that expands your raw notes into professional prose for every section, with a financial summary table, branded header/footer, and page numbers.
- **Pitch Deck Generator** — requires a validated idea in the pipeline (no manual entry); auto-generates a 10-slide investor pitch (Title, Problem, Solution, Market Size, Business Model, Go-to-Market, Competitive Advantage, Team, Financials, The Ask) with real fleshed-out content, not a template. Downloadable as **PDF** or **PPTX** (real PowerPoint file, bold/italic preserved as actual text formatting, 16:9 layout).
- **Pricing Calculator** — itemize your per-batch production costs, pick a margin (10/30/50% or custom), get a recommended selling price, break-even unit count, and a 5-point sales projection chart. Optionally ask the AI whether your price is under/over/fairly priced versus typical Zambian sector averages. Calculations can be saved to Firestore.
- **Business Ledger** — the most complex tool: a tabbed bookkeeping suite.
  - *Sales Book*: log sales (cash/mobile money/credit); a credit sale automatically also creates a linked **Debtors** record.
  - *Expense Book*: log expenses by category, with a weekly breakdown chart.
  - *Profit & Loss*: pick a period, see income/expenses/net profit/margin, a weekly bar chart, an AI "Financial Health Check" that benchmarks your numbers against typical Zambian sector averages, and a downloadable branded PDF P&L statement (always for the current calendar month, regardless of which period you have selected on screen).
  - *Debtors Book*: track who owes you money, bucketed Overdue/Due Soon/Current; marking a debt "Paid" both updates the debtor record and creates a new Sales entry so it flows into your income totals; a "Send Reminder" button copies a pre-written WhatsApp message to your clipboard (it does not send anything itself).
  - *Credit Score*: a 0–100 score computed purely from your own Firestore data (business plan completed, pricing margin, sales consistency, expenses-to-revenue ratio, debtor payment behavior, formal registration status) — no AI call, shown as a circular gauge with a tier label.
  - Every book (Sales/Expenses/Debtors, or all three together) can be exported to **Excel (.xlsx)**.
- **Invoice Generator** — fill in your business info, client info, and line items; download a branded **PDF invoice** with an itemized table, totals, optional VAT, and optional Mobile Money payment instructions. Nothing is saved — every invoice must be re-entered from scratch (no invoice history).
- **SWOT Analysis** — requires a validated idea in the pipeline; auto-generates a Zambia-specific Strengths/Weaknesses/Opportunities/Threats breakdown (4 points each, explicitly referencing things like load shedding, mobile money, and local competition), shown in a 2×2 color-coded grid, savable to Firestore and downloadable as PDF.
- **Marketing Tools** (Social Media Generator) — describe your business/promotion and pick platforms (Facebook/WhatsApp/TikTok/Instagram); the AI writes one caption per platform respecting each platform's typical character limit and including Zambian hashtags and a call-to-action. Each caption can be copied or shared via a WhatsApp/Facebook deep link. Nothing is saved.
- **Business Name Generator** — describe your business, pick a sector and a naming style (including "local Zambian language"); get 8 AI-suggested names each with a meaning and a rationale, mixing English with Bemba/Nyanja/Tonga. Names can be saved individually to Firestore.
- **Compliance Tracker** — a static calendar of recurring Zambian tax/statutory deadlines (ZRA PAYE, NAPSA, NHIMA, ZRA VAT, Workers' Compensation), filtered by whether your profile says you have employees, with overdue/due-soon/upcoming status badges. A separate "AI Compliance Health Check" button feeds your document counts (as context, not raw data) to the AI for a 0–100 health score, an AI-generated deadline list (kept separate from the static calendar above, not merged with it), and recommendations.
- **KPI & Summaries** — two tabs: (1) auto-computed sales/expense performance for a chosen period, a cash-flow visualization, and an AI performance audit (score, sales analysis, burn-rate critique, 3 recommendations); (2) a manual custom KPI target tracker (e.g. "50 customers by June") — entirely `localStorage`-based, with color-coded progress bars.
- **Savings Tracker** — set savings goals with a target amount and due date, log deposits/withdrawals against them, and see how much you need to save per day/week to hit your goal on time. Entirely `localStorage`-based (no Firestore, no AI). Includes static "Zambian Savings Wisdom" tips (mobile money interest wallets, seasonal cushioning for agri businesses, CDF matching-funds tip).

### Engine 2 — Skills / Career Connect (`/engine/skills`)

Every tool in this engine (except Interview Prep and Skill Gap Closer) reads from a single Firestore document — `skillProfiles/{your uid}` — built once on the Skill Profile Builder page.

| Page | Route | Persistence |
|---|---|---|
| Skill Profile Builder | `/skill-profile-builder` | 🔥 |
| Career Matches | `/career-matches` | 🔥 (read-only) |
| Zambian Jobs | `/zambian-jobs` | 💾 |
| CV Generator | `/cv-generator` | 🔥 (read-only) + ⚡ (rest not saved) |
| Cover Letter AI | `/cover-letter-generator` | 🔥 (read-only) |
| Interview Prep Wizard | `/interview-prep` | ⚡ |
| Skill Gap Closer | `/skill-gap-closer` | ⚡ |
| Portfolio Showcase | `/portfolio-showcase` | 💾 |
| Piece-Work Board | `/gig-board` | 💾 |

- **Skill Profile Builder** — a 3-step wizard. Step 1: personal details + province/district + education + preferred work type. Step 2: pick your skills three ways — a guided multiple-choice quiz, a browsable skill catalogue (technical/vocational/soft-skill chips), or an **AI Skill Extractor**: describe your work experience in free text (30+ characters) and the AI identifies which skills you likely have from a fixed list of 41 skills, plus a one-line summary and suggestions. ⚠️ Running the AI Extractor **replaces** any skills you'd already picked manually rather than adding to them. Step 3: your top two industry interests and current status (student/employed/unemployed/etc.). Submitting writes (or overwrites) your `skillProfiles/{uid}` document.
- **Career Matches** — scores you against a fixed catalogue of 15 Zambian careers, purely by comparing your selected skills to each career's required skills (plus a bonus if the career's sector matches your stated top/second industry interest) — no AI involved in the matching itself. Shows your top 5 matches with earnings info and links to relevant piece-work postings. Per career, you can generate an AI "Predictive Roadmap": skill gaps to close, real Zambian training institutions (TEVETA, UNZA, CBU, Evelyn Hone, ZCAS) matched to your province, a numbered step plan, and a job-market outlook.
- **Zambian Jobs** — a two-tab job board: an "Expertise Match" feed scored against your skill profile (sector match + keyword hits in the job description), and a "General Postings" tab anyone can search/filter. Job listings live in `localStorage` (shared with the Piece-Work Board — the same underlying pool), seeded from a static catalogue. "Apply Now" only shows a success message — no application is actually sent or recorded anywhere.
- **CV Generator** — builds a Zambian-style CV/résumé (including a Referees section, a local convention) from your skill profile plus additional fields you fill in on this page (education history, work experience, referees, hobbies) — those extra fields are **not saved**, so they reset to sample placeholder data if you leave and come back. Download as a formatted **PDF**.
- **Cover Letter AI** — enter a target job title, company, and your contact/date/hiring-manager details; the AI writes a full, tailored cover letter referencing your specific skills and education. You can hand-edit the generated text before exporting. Download as a genuine **.docx Word document** (built with the `docx` library — a real OOXML file, not an HTML file renamed to `.docx`) or copy the text.
- **Interview Prep Wizard** — pick a target career (or type a custom one) and how many questions you want (3/6/9); the AI generates a mixed set of behavioral, role-specific, and Zambia-specific situational questions (e.g. dealing with load shedding, ZRA details, local supplier negotiations). Questions can be read aloud (browser text-to-speech) and answered by typing or by voice (browser speech recognition, where supported). After answering all questions, the AI scores your readiness (0–100) with strengths and areas to improve. Nothing from a session is saved — starting over resets everything.
- **Skill Gap Closer** — name a skill you don't have (often one flagged as "missing" from Career Matches); the AI designs a 4-week self-study plan (a focus + activities for each week) plus real local learning resources for your province. Also shows static info about Zambia's Constituency Development Fund (CDF) skills-training bursary process.
- **Portfolio Showcase** — a freelancer-style public listing marketplace: list yourself (name, title, category, hourly rate, location, skills, bio) or browse/search/filter others. "Contact Professional" only shows a success toast — no message is actually delivered. Entirely `localStorage`-based; not connected to your Skill Profile at all.
- **Piece-Work Board** — post short-term/casual jobs or browse and search existing ones (shares the same `localStorage` job pool as Zambian Jobs). "Apply Now" is cosmetic, same as Zambian Jobs.

### Engine 3 — Finance & Funding (`/engine/finance`)

| Page | Route | Persistence |
|---|---|---|
| Grants Portal | `/grants-portal` | ⚡ (bookmarks not persisted — see §11) |
| Loans Portal | `/loans-portal` | ⚡ none |
| Investment Matchmaker | `/investment-matchmaker` | 💾 |

- **Grants Portal** — browse a static catalogue of ~20 real Zambian/international funding programs (CEEC, Youth Development Fund, CDF, Tony Elumelu Foundation, Mastercard Foundation, USAID, GIZ, AfDB, and more), filtered to exclude loan-type programs. Self-filter by youth/women-led status and sector. You can "bookmark" a grant for a pipeline checklist, but this state lives only in memory and is lost on refresh.
- **Loans Portal** — a financial-literacy toolkit, no AI or Firestore: an EMI/affordability loan calculator (standard amortization formula) that checks whether a loan is affordable using DSCR for business loans or debt-to-income ratio for personal loans; a 3-question quiz recommending a category of lender; and a directory of real Zambian banks, government funds, and microfinance institutions with outbound links.
- **Investment Matchmaker** — two tabs. "AI Pitch Matcher": using your validated idea (from the same pipeline handoff as Pitch Deck/SWOT), the AI recommends specific realistic Zambian funding sources (government grants, private grants, bank SME loans, angel/VC) with reasoning for each. "Community Connection Hub": a simulated peer directory (funders/founders/vendors) — you can register your own profile, but it's saved only to this browser's `localStorage`, not shared with other real users; matching against the directory is simple sector-overlap filtering; contact is via `mailto:` links.

### Engine 4 — Community & Connect (`/engine/connect`)

| Page | Route | Persistence |
|---|---|---|
| Zambian Jobs | `/zambian-jobs` (listed here too) | 💾 |
| Verified Directory (business listings) | `/market-directory` | 💾 |
| Portfolio Showcase | `/portfolio-showcase` (listed here too) | 💾 |
| B2B Tenders | `/b2b-tenders` | 💾 |
| Piece-Work Board | `/gig-board` (listed here too) | 💾 |
| Asset Rentals | `/asset-sharing` | 💾 |
| Verified Service Directory (placeholder) | `/verified-directory` | ⚡ "under construction" stub |
| Learning Insight Cards (placeholder) | `/learning-insights` | ⚡ "under construction" stub |

`market-directory`, `b2b-tenders`, and `asset-sharing` are architecturally identical: each seeds from a small hardcoded mock dataset, "posting" a new listing (business/tender/asset) writes the whole array to a dedicated `localStorage` key, and "contacting/bidding/requesting" only shows a success toast without actually sending or storing anything.

- **Verified Directory (Market Directory)** — search/filter local businesses by sector; "List Your Business" adds a new (locally-visible-only) listing; "Contact" is a simulated inquiry.
- **B2B Tenders** — browse/search open procurement tenders; "Post a Tender" adds one; "Apply & Submit Bid" is simulated.
- **Asset Rentals (Asset Sharing)** — browse/search rentable equipment/space; "List an Asset" adds one; "Request" is simulated.
- **Verified Service Directory** and **Learning Insight Cards** are both literal placeholder pages (a construction icon and "under construction" text) — not built yet.

### Engine "Gateway" — AI Assistant

The `gateway` entry in `engineModules.js` exists only as metadata (title/icon, no module list) pointing at the standalone **AI Advisor** page and **AIChatPanel** widget described under Core/Account above — it doesn't route through the generic `EngineView` hub UI.

---

## 6. Authentication & Permissions

**Provider:** Firebase Authentication. Three sign-in methods are supported: email/password, Google (`signInWithPopup` + `GoogleAuthProvider`), and Apple (`signInWithPopup` + `OAuthProvider('apple.com')`).

**Where auth state lives:** a **single** `onAuthStateChanged` listener, registered once in `src/App.jsx` at the top of the component tree (unconditional — it runs regardless of what page is mounted). On every auth event it writes `user`, `userProfile` (fetched from the `users/{uid}` Firestore document), and `loading` into a Zustand store (`src/store/authStore.js`), and fires a fire-and-forget `lastActive` timestamp update. *(Historically, `useAuth.js` also ran its own copy of this same listener, which fired redundantly every time the `Header` component mounted — i.e., on every page refresh — doubling Firestore round-trips. That duplicate was removed; `App.jsx`'s listener is now the only one.)*

**Route protection:** `Layout.jsx` (the wrapper for every authenticated route) checks `loading`/`user` from the store: shows a full-page loader while `loading` is true, and redirects to `/login` if there's no `user` once loading finishes. `Landing` (`/`), `Login`, `Register`, and `Agreement` are the only routes outside this wrapper and are reachable without being logged in.

**Roles/permissions:** there is **no role system** — every authenticated user has identical access to every feature. There's no admin panel, no moderator role, no paid/free tier distinction anywhere in the code.

**Authorization enforcement (server-side):** `firestore.rules` is the real security boundary (client-side route guards only affect UX, not data access):
- `users/{uid}` and `skillProfiles/{uid}` — a user may only read/write the document whose ID matches their own auth `uid`.
- A shared rule covers every other user-data collection (`businessIdeas`, `businessPlans`, `savedNames`, `monthlyReports`, `milestones`, `goals`, `pricingCalculations`, `sales`, `expenses`, `debtors`, `swotAnalyses`, `bookmarkedFunding`, plus `skillProfiles` again via a query-compatible path): reads/updates/deletes require `request.auth.uid == resource.data.userId`; creates require the new document's `userId` field to equal the creator's own `uid`. This is what stops one user from reading or writing another user's ledger entries, business plans, etc.
- Everything not explicitly listed is denied by default (`allow read, write: if false`).

**Session/account management:** password reset via Firebase's email flow (`sendPasswordResetEmail`); account deletion is a manual multi-step client-side process on the Profile page (see §5) — there is no Cloud Function that guarantees complete cleanup, so it's only as thorough as the hardcoded collection list in `Profile.jsx`.

---

## 7. Data Models

### Firestore Collections

All documents are created via `useFirestore().addDocument(collectionName, data)`, which automatically stamps every document with `userId: user.uid` and `createdAt: serverTimestamp()` — individual pages only need to pass their feature-specific fields.

| Collection | Doc ID | Written by | Key fields |
|---|---|---|---|
| `users` | `{uid}` (= auth UID) | Register, Profile, BusinessHubView, `useAuth` | `fullName, email, age, sex, acceptTerms, province, district, occupation, businessProfile {name, sector, isPacraRegistered}, lastActive, createdAt`. *(`selectedPath` is read in several places but never written anywhere — see §11.)* |
| `skillProfiles` | `{uid}` (= auth UID) | Skill Profile Builder | `fullName, age, province, district, educationLevel, preferredWorkType, selectedSkills[], languages, topIndustry, secondIndustry, biggestChallenge, currentStatus` |
| `businessIdeas` | auto | Idea Validator | `wizardData {businessType, problem, solution, budget, location, extraInfo}, score, verdict, result {…AI analysis…}, timestamp` |
| `businessPlans` | auto | Business Plan Builder | full 8-step form data (business basics, market, products, marketing, operations, financials) + computed totals |
| `pricingCalculations` | auto | Pricing Calculator | `productName, costs[], recommendedPrice, profitMargin, costPerUnit` |
| `savedNames` | auto | Business Name Generator | `name {name, meaning, reason}, description, sector` |
| `swotAnalyses` | auto | SWOT Analysis | `businessName* , description, sector, swot {strengths[], weaknesses[], opportunities[], threats[], summary}` (*actually the business *type*, not a chosen name — see §11) |
| `sales` | auto | Business Ledger (Sales Book) | `item, quantity, pricePerUnit, total, paymentMethod, customerName, dueDate, note, isDebtPayment?` |
| `expenses` | auto | Business Ledger (Expense Book) | `description, amount, category, date, note` |
| `debtors` | auto | Business Ledger (Debtors Book) | `customerName, description, amount, dateCredited, dueDate, status (current/paid), note, paidAt?` |
| `bookmarkedFunding` | auto | *(declared in rules/data-privacy/account-deletion lists; no page currently writes to it — see §11)* | — |
| `monthlyReports`, `milestones`, `goals` | auto | *(only written by the unrouted `GrowthTracker.jsx` — see §11)* | — |

**Relationships:** everything is a flat, per-user collection — no document references or subcollections. The implicit relationship between documents is entirely by convention: every document carries the owning user's `userId`, and a handful of pages cross-reference collections by re-querying them (e.g. the Business Ledger's Credit Score reads `businessPlans` and `pricingCalculations`; Career Matches/CV Generator/Cover Letter AI all read the one `skillProfiles` document).

### localStorage "collections" (not synced, not shared across devices)

| Key | Written by | Purpose |
|---|---|---|
| `impunga_idea_pipeline` | Idea Validator | The validated-idea handoff object consumed by Business Plan Builder, Pitch Deck Generator, SWOT Analysis, Registration Guide |
| `impunga_registration_roadmap` | Registration Guide | In-progress AI roadmap + step completion/target dates |
| `impunga_business_kpis` | KPI & Summaries | Custom KPI targets |
| `impunga_savings_goals` / `impunga_savings_txs` | Savings Tracker | Goals and transaction log |
| `impunga_gigs` | Piece-Work Board & Zambian Jobs (shared) | Job/gig listings |
| `impunga_portfolios` | Portfolio Showcase | Freelancer listings |
| `impunga_businesses` | Market Directory | Business listings |
| `impunga_tenders` | B2B Tenders | Tender listings |
| `impunga_assets` | Asset Sharing | Rentable asset listings |
| `impunga_hub_profile_{uid}` | Investment Matchmaker | Community Connection Hub profile |
| `impunga_chat_history` | AI Advisor / AIChatPanel | Saved chat threads (max 20) |
| `impunga_ai_*` | `lib/gemini.js` | 6-hour response cache for one-shot AI calls |
| `impunga_last_route`, `impunga_visited_business/skills/finance` | Layout | Dashboard's "continue where you left off" + journey-progress tracking |
| `impunga_theme` | themeStore | light/dark/system preference |
| `impunga_lang` | LanguageContext | en/bem/nya preference |

### Static reference data (bundled into the app, not user data)

`businessSectors.js`, `businessTypes.js`, `pacraSteps.js`, `fundingSources.js`, `marketPrices.js`, `careers.js`, `jobs.js`, `provinces.js`, `dailyTips.js`, `engineModules.js` — all plain JS arrays/objects shipped in the JS bundle, not fetched from anywhere.

---

## 8. Setup & Installation

### Prerequisites
- Node.js (a recent LTS version — the project targets modern JS/ES2020+ output)
- npm
- A Firebase project (Firestore + Authentication enabled)
- A Groq API key (free tier available at [groq.com](https://groq.com)) — despite the env var being named for Gemini, this must be a **Groq** key

### Steps

1. **Clone the repo** and enter the app folder:
   ```bash
   git clone https://github.com/jetslavushimanda/impunga.git
   cd impunga-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create your environment file** — copy the example and fill in real values:
   ```bash
   cp .env.example .env
   ```
   Required variables (all must be prefixed `VITE_` to be exposed to the Vite client bundle):

   | Variable | What it is |
   |---|---|
   | `VITE_GEMINI_API_KEY` | **A Groq API key** (see the naming note at the top of this document) — get one at console.groq.com |
   | `VITE_FIREBASE_API_KEY` | Firebase Web API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (`your-project.firebaseapp.com`) |
   | `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket (`your-project.appspot.com`) |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
   | `VITE_FIREBASE_APP_ID` | Firebase app ID |

   All of these come from your Firebase project's web app config (Firebase Console → Project Settings → General → Your apps).

4. **Set up Firebase:**
   - In the [Firebase Console](https://console.firebase.google.com), create a project (or use an existing one matching `.firebaserc`'s `"impunga"` alias — edit that file if your project ID differs).
   - Enable **Authentication** → Sign-in methods: Email/Password, Google, and (optionally) Apple.
   - Enable **Cloud Firestore** (start in production mode — the rules file handles access control).
   - Deploy the security rules: `firebase deploy --only firestore:rules` (requires the [Firebase CLI](https://firebase.google.com/docs/cli), `firebase login`, and the project linked via `.firebaserc`).

5. **Run the dev server** (see §9).

---

## 9. How to Run

All commands run from inside `impunga-app/`.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server (hot-reload) — default `http://localhost:5173` |
| `npm run build` | Production build → outputs to `dist/` (chunk-split per the manual chunks in `vite.config.js`, PWA service worker generated by `vite-plugin-pwa`) |
| `npm run preview` | Serves the built `dist/` folder locally, to sanity-check a production build before deploying |
| `npm run lint` | Runs ESLint across the project |

**No automated test suite exists in this repo** — there are no `*.test.js`/`*.spec.js` files and no test runner configured in `package.json`. Verifying a change currently means running it in the dev server and clicking through it by hand.

**Deployment:** the project is set up for **Vercel** — `vercel.json` rewrites every path to `/index.html` so client-side routing survives a hard refresh or a direct deep-link (without this, refreshing on e.g. `/business-ledger` would 404, since there's no matching file on the server). Firestore rules deploy separately via the Firebase CLI (they are not part of the Vercel build).

---

## 10. Key User Flows

### Flow A — New user: sign up → validate an idea → get a business plan and pitch deck
1. Land on `/` → click **"Get Started — It's Free"** → `/register`.
2. Fill Step 1 (name/email/password/age/sex), tick the disclaimers checkbox (opens the legal modal, "Accept & Close"), fill Step 2 (province → district) → account is created, `users/{uid}` document is written, redirected to `/dashboard`.
3. From the Dashboard (or Sidebar → "Business Space"), go to **Idea Validator** (`/idea-validator`). Walk the 4-step wizard: pick a business type, describe the problem and your solution, state your starting budget and location.
4. Click **Generate Blueprint** — the AI scores the idea, gives a verdict, and writes back unit economics, competitor intel, capital allocation, and risk assessment. This also silently saves the idea to `localStorage['impunga_idea_pipeline']`.
5. Optionally click **Save** to also persist it to Firestore (`businessIdeas`), and/or **Download PDF** for the "Startup Blueprint" document.
6. Navigate to **Business Plan Builder** (`/business-plan`) — it detects the pipeline data and pre-fills the "what does the business do" fields. Walk the 8 steps, filling in market, products, marketing, operations, and financial figures (costs/revenue update live).
7. Click **"Generate Full Business Plan"** — the AI rewrites all the raw notes into polished business-plan prose, and a full branded PDF (with a financial summary table) is produced.
8. Navigate to **Pitch Deck Generator** (`/pitch-deck`) — because the idea is still in the pipeline, it **auto-generates** a 10-slide deck immediately on page load. Download as PDF or as a real PowerPoint (.pptx) file.

### Flow B — Existing entrepreneur: log a sale, log an expense, check profitability
1. Log in (`/login`) → land on `/dashboard`.
2. Go to **Business Ledger** (`/business-ledger`) — lands on the tab menu.
3. Open **Sales Book**, fill in an item, quantity, price, and payment method (Cash / Mobile Money / Credit). If Credit is chosen, a customer name and due date are required — submitting this also silently creates a linked Debtors entry.
4. Open **Expense Book**, log a business expense with a category (e.g. "Transport," "Stock/Inventory").
5. Open **Profit & Loss**, pick "This Month" — see computed income, expenses, net profit, and margin, plus a weekly bar chart.
6. Click **"AI Financial Health Check"** — the AI compares your cost/revenue/margin figures against typical Zambian sector benchmarks and returns specific, actionable commentary.
7. Click **"Download PDF"** to get a branded profit-and-loss statement for the current month.
8. Open the **Credit Score** tab — see a 0–100 score computed from this ledger data plus your saved business plan and pricing history, presented as a circular gauge with a tier label (e.g. "Good Standing").

### Flow C — Job seeker: build a skill profile → get matched → apply-ready in one sitting
1. Log in → Sidebar → "Career Connect" → **Skill Profile Builder** (`/skill-profile-builder`).
2. Step 1: enter personal details, province/district, education level, preferred work type.
3. Step 2: either take the guided skills quiz, tap chips in the skill catalogue, **or** describe your work history in a paragraph and let the AI extract your skills automatically (note: this replaces, not adds to, any skills already picked).
4. Step 3: pick your top two industries of interest and your current status → submit, writing your `skillProfiles/{uid}` document.
5. Redirected to **Career Matches** (`/career-matches`) — see your top 5 best-fit careers out of 15, each scored by skill overlap plus an industry-interest bonus. Pick one and click **"Generate Predictive Roadmap"** for an AI-built plan: skill gaps, real training institutions near you, and a numbered path forward.
6. Go to **CV Generator** (`/cv-generator`) — your skills and a summary are pre-filled from your profile; add education/experience/referees, then **download a PDF CV**.
7. Go to **Cover Letter AI** (`/cover-letter-generator`) — enter a specific job title and company you're targeting; the AI writes a tailored letter referencing your actual skills; edit if needed, then **download a real .docx file**.
8. Optionally go to **Interview Prep Wizard** (`/interview-prep`) to rehearse: pick the same career, generate 6 questions (read aloud if you want), answer by typing or speaking, and get an AI readiness score with strengths/areas to improve.

### Flow D — Finding money: from idea to a shortlist of funding sources
1. After validating an idea (Flow A, steps 3–5), go to **Investment Matchmaker** (`/investment-matchmaker`).
2. On the "AI Pitch Matcher" tab, it auto-detects your pipeline idea and generates a matched list of realistic funding sources (grants, bank SME loans, angel/VC) with reasoning for each.
3. Separately, visit **Grants Portal** (`/grants-portal`) to browse the full static catalogue of ~20 real Zambian/international grant and competition programs; use the "Eligibility Engine" checkboxes (youth-led, women-led, sector) to narrow the list; bookmark ones you're interested in (note: this bookmark is lost on refresh — not yet persisted).
4. Visit **Loans Portal** (`/loans-portal`) if debt financing is more appropriate — run the EMI calculator against your ledger's monthly revenue/expenses to check real affordability (DSCR for a business loan), and use the 3-question quiz to get pointed toward the right category of lender.

---

## 11. Known Gaps, Dead Code & Inconsistencies

Flagged explicitly rather than silently glossed over, since an accurate walkthrough shouldn't claim more than the code actually does.

**Unreachable / unused code:**
- `src/pages/GrowthTracker.jsx` — fully built (monthly revenue/expense tracking, milestones, goals, PDF export) but has no route anywhere and is not imported by any other file. Its Firestore collections (`monthlyReports`, `milestones`, `goals`) are consequently never actually written to by the live app.
- `src/components/shared/EmptyState.jsx` and `src/components/shared/PageHeaderCard.jsx` — built components with no importers anywhere in `src/`.
- `src/store/businessStore.js` — a Zustand store with setters for saved ideas/plans/calculations/funding/milestones/goals, but no page in the app actually calls any of its setters — it's effectively inert.
- `@google/genai` npm package — installed, never imported.
- The `bookmarkedFunding` Firestore collection is referenced in `firestore.rules`, `DataPrivacy.jsx`'s data inventory, and `Profile.jsx`'s account-deletion list, but no page in the current codebase actually writes to it.

**Simulated / not-actually-persisted features** (important for setting correct expectations in a walkthrough):
- "Apply Now" on Zambian Jobs / Piece-Work Board, "Contact Professional" on Portfolio Showcase, and "Contact/Bid/Request" on Market Directory / B2B Tenders / Asset Sharing all just show a success toast — no message, application, or bid is transmitted or stored anywhere.
- Grants Portal's "bookmark" and pipeline checklist state is plain in-memory React state — lost on refresh.
- DataPrivacy's "Access & Audit Log" is hardcoded fake data, not a real log.
- Investment Matchmaker's "Community Connection Hub" directory registration is saved only to the current browser's `localStorage`, not a real shared directory, despite importing (unused) Firestore functions that suggest it once was meant to be.

**Real inconsistencies worth a developer's attention:**
- **Account deletion is incomplete relative to Data Privacy's own claims:** `Profile.jsx`'s delete-account flow removes documents from `businessIdeas, businessPlans, pricingCalculations, milestones, monthlyReports, goals, bookmarkedFunding`, but **not** `skillProfiles` or `sales` — both of which `DataPrivacy.jsx` lists as data the platform stores about you. Deleting your account today would leave those two behind.
- **OAuth sign-ups are missing profile fields** that email/password sign-up collects (age, sex, province, district, `acceptTerms`) — these stay blank until a user manually fills them in via Profile.
- **`selectedPath`** is read from the user profile in three places (`App.jsx`, `useAuth.js` twice) and consumed by `ComplianceTracker.jsx`, but no code anywhere writes it — it will always be `undefined`/falsy in practice.
- **SWOT Analysis** saves its result under a field literally named `businessName`, but the value stored there is actually the business *type* (a category, not a chosen name).
- Four independent, hand-maintained lists of "what modules/routes exist" can drift out of sync with each other: `Sidebar.jsx`'s nav array, `Layout.jsx`'s mobile bottom-nav array, `src/data/engineModules.js`, and a separate hardcoded route catalogue embedded inside the AI's semantic-search prompt in `useGemini.js`.
- `src/styles/aiResponse.css` (styling for AI chat text) has no dark-mode rules, unlike the rest of the app's Tailwind `dark:` classes everywhere else.
- Dashboard's "Economic Intelligence" news/alert cards are static hardcoded placeholder content, not live or AI-generated, despite reading as a real news feed.

If you're recording a walkthrough video, the safest framing is: **Idea Validator, Business Plan Builder, Pricing Calculator, Business Ledger, SWOT Analysis, Business Name Generator, Skill Profile Builder, and the account/profile system are real, persisted, per-user features.** Everything under "Community & Connect" (job board, tenders, rentals, directory, portfolio showcase) and the Savings/KPI-target tools are **working prototypes backed by local browser storage**, not a live multi-user marketplace — describe them as such rather than implying real transactions occur.
