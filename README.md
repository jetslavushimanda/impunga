# IMPUNGA

**Start. Match. Build Zambia.**

IMPUNGA is Zambia's first Economic Intelligence Platform built for the JETS National Innovation Challenge 2026. It gives every Zambian with a business idea access to professional tools, AI mentorship, funding information, and step-by-step business guidance — completely free.

The name IMPUNGA comes from the Bemba word meaning **the seed that grows**.

---

## Live Demo

[impunga.vercel.app](https://impunga.vercel.app)

---

## The Problem IMPUNGA Solves

Millions of Zambians have business ideas every day. Most never start because of five walls:

1. They do not know if their idea is viable
2. They do not know how to register with PACRA
3. They do not know how to write a business plan
4. They price their products wrong and make no profit
5. They do not know where to find funding

IMPUNGA breaks all five walls down — permanently, and for free.

---

## Engines & Modules

IMPUNGA is divided into two engines, containing a total of 12 fully functional modules:

### Engine 1 — Start Your Business (10 Modules)
| Module | Description |
|--------|-------------|
| Idea Validator | AI analyses your business idea for the Zambian market and gives a viability score out of 10 |
| Registration Guide | Step-by-step PACRA, ZRA and bank account registration with official links and progress tracking |
| Business Plan Builder | 8-section guided business plan builder with professional PDF download |
| SWOT Analysis | AI generates a full Strengths, Weaknesses, Opportunities and Threats analysis |
| Business Name Generator | AI generates 8 unique Zambian business names with meanings and reasoning |
| Pricing Calculator | True cost calculator with profit margins, break-even analysis and monthly projections |
| Invoice Generator | Create professional Kwacha invoices and download as PDF |
| Business Ledger | Track sales, expenses and debtors |
| Funding Finder | 25+ real Zambian funding sources including CEEC, Tony Elumelu Foundation and more |
| AI Business Advisor | Full conversational AI mentor available 24 hours with Zambia-specific advice |

### Engine 2 — Match Your Skills (2 Modules)
| Module | Description |
|--------|-------------|
| Skill Profile Builder | Build your professional skill profile, selecting education level, province, district, and core skills |
| Career Matches | Run matching algorithm against common Zambian occupations to evaluate job suitability and identify skill gaps |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite 8 | Fast component-based UI |
| Styling | Tailwind CSS v4 | Responsive professional design |
| Icons | Lucide React | Clean SVG icons throughout |
| Routing | React Router v6 | Navigation between all pages |
| Database | Firebase Firestore | Real-time cloud data storage |
| Authentication | Firebase Auth | Email and Google Sign In |
| AI | Groq API (Llama 3.3 70B) | Business advice and content generation |
| PDF Generation | jsPDF + AutoTable | Business plans and invoice downloads |
| Charts | Recharts | Pricing projections and data visualisation |
| State Management | Zustand | Clean application state |
| Form Handling | React Hook Form + Zod | Multi-step form validation |
| PWA | Vite PWA Plugin | Offline capability and app install |
| Deployment | Vercel | Free global hosting with CI/CD |

**Total development cost: Zero Zambian Kwacha.**

---

## Features

- **AI-powered** — Real AI responses specific to the Zambian market. References PACRA, ZRA, CEEC and all 10 provinces
- **PDF downloads** — Business plan, invoice and registration checklist all download as professional PDFs
- **25+ funding sources** — Government, NGO, international and competition funding with eligibility filtering
- **Response caching** — AI responses are cached for 24 hours to reduce API calls during demonstrations
- **Progressive Web App** — Installs on any phone or computer like a native app
- **Mobile first** — Bottom navigation bar, scrollable sidebar, responsive at all screen sizes
- **Rate limit protection** — Countdown timer shows users how long to wait when AI limit is reached
- **Offline capable** — Registration Guide and Pricing Calculator work without internet during load shedding

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Firebase project (free tier)
- Groq API key (free tier — 14,400 requests per day)

### Installation

```bash
git clone https://github.com/jetslavushimanda/impunga.git
cd impunga
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_GEMINI_API_KEY=your_groq_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Getting a Groq API key:**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Click API Keys → Create API Key
4. Copy the key starting with `gsk_`

**Getting Firebase credentials:**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password and Google)
4. Enable Firestore Database (start in test mode)
5. Go to Project Settings → Web App → copy the config values

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Building for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx          # Top navigation bar
│   │   ├── Sidebar.jsx         # Side navigation with all modules
│   │   └── Layout.jsx          # Main layout with bottom nav bar
│   └── shared/
│       ├── LoadingSpinner.jsx   # Loading states
│       ├── ErrorMessage.jsx     # Error display
│       ├── SuccessToast.jsx     # Toast notifications
│       ├── EmptyState.jsx       # Empty data states
│       └── OfflineBanner.jsx    # Offline status banner
├── pages/
│   ├── Landing.jsx             # Minimal landing page
│   ├── Login.jsx               # Email and Google sign in (modernized theme)
│   ├── Register.jsx            # 3-step registration with dynamic location selectors
│   ├── ChoosePath.jsx          # Onboarding path selection (Engine 1, Engine 2, or Both)
│   ├── Dashboard.jsx           # Main hub with dynamic statistics based on selected path
│   ├── IdeaValidator.jsx       # AI business idea analysis
│   ├── RegistrationGuide.jsx   # PACRA/ZRA step-by-step guide
│   ├── BusinessPlanBuilder.jsx # 8-section plan with PDF export
│   ├── PricingCalculator.jsx   # Cost and profit calculator
│   ├── FundingFinder.jsx       # 25+ Zambian funding sources
│   ├── AIAdvisor.jsx           # Conversational AI chat
│   ├── BusinessNameGenerator.jsx # AI name suggestions
│   ├── InvoiceGenerator.jsx    # PDF invoice creator
│   ├── MarketPrices.jsx        # Zambian market price data
│   ├── SWOTAnalysis.jsx        # AI SWOT generator
│   ├── SocialMediaGenerator.jsx # AI marketing content
│   ├── WhatsAppTemplates.jsx   # Business message templates
│   ├── BusinessLedger.jsx      # Sales, expenses, and debtor tracker
│   ├── SkillProfileBuilder.jsx # User skill portfolio builder (dropdown selectors)
│   ├── CareerMatches.jsx       # Skill-to-career matchmaker
│   └── Profile.jsx             # User account management
├── hooks/
│   ├── useAuth.js              # Firebase authentication hook
│   ├── useFirestore.js         # Firestore CRUD operations
│   ├── useGemini.js            # AI API hook with caching
│   └── useAI.js               # AI hook alias
├── lib/
│   ├── firebase.js             # Firebase initialisation
│   ├── gemini.js               # Groq API client with caching
│   └── utils.js                # Shared utility functions
├── store/
│   ├── authStore.js            # Zustand auth state
│   └── businessStore.js        # Zustand business data state
├── data/
│   ├── provinces.js            # All 10 provinces and 116 districts
│   ├── fundingSources.js       # 25+ Zambian funding sources
│   ├── businessTypes.js        # PACRA business structure data
│   ├── pacraSteps.js           # PACRA and ZRA registration steps
│   ├── dailyTips.js            # 100 Zambian business tips
│   ├── businessSectors.js      # 20 Zambian business sectors
│   └── marketPrices.js         # Zambian market price data
└── styles/
    └── index.css               # Tailwind v4 global styles and components
```

---

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{collection}/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Deployment

The app is deployed on Vercel with automatic deployments on every push to the `main` branch.

To deploy your own instance:

1. Push the repository to GitHub
2. Connect the repository to [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Vercel automatically builds and deploys on every commit

---

## License

Built for the JETS National Innovation Challenge 2026 — Republic of Zambia.

---

*IMPUNGA · Start. Match. Build Zambia.*
