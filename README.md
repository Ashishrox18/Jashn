# Jashn (जश्न)

> ### **Plan the celebration, not the stress.**

**Jashn** is a GenAI-powered event planning companion engineered for Indian weddings, birthdays, and community gatherings.

Describe your celebration once, and Jashn helps create a structured plan with an **exact rupee budget, dated milestone timeline, vendor checklist, vetting questions, and curated inspiration**. It then becomes an active planning workspace where you can track spending, manage tasks, rebalance budgets, export events to your calendar, and ask context-aware questions.

---

## Services & Technologies

### Generative AI

| Service | How It's Used |
|---|---|
| **Google Gemini API** | Primary Generative AI service for personalized event plans, budget recommendations, timelines, vendor questions, and creative ideas. |
| **Groq API / Llama 3.3** | Alternative LLM inference provider for fast responses and resilient fallback support. |
| **Google Antigravity** | AI-assisted development environment used for rapid prototyping, feature development, code iteration, and application refinement. |

### Application & Backend

| Technology | Purpose |
|---|---|
| **Next.js** | Full-stack framework powering the web application and secure server-side API routes. |
| **TypeScript** | Type-safe application development and business logic. |
| **Zod** | Validates user inputs and AI-generated structured JSON responses. |

### Planning & Processing

| Component | Purpose |
|---|---|
| **Deterministic Engines** | Handles exact budget allocation, percentage normalization, and timeline calculations. |
| **RFC 5545 iCalendar** | Generates `.ics` files for exporting event milestones to calendar applications. |

### Data & Storage

- **Browser LocalStorage** — Stores event plans and user progress locally.
- **JSON Backup & Import/Export** — Enables users to back up and restore event planning data.

### Quality, Security & Reliability

- 🧪 **Jest** — Automated unit and integration testing.
- ♿ **Accessibility Testing** — Designed to support WCAG 2.1 AA accessibility standards.
- 🔒 **Server-Side API Security** — AI credentials remain protected on the server.
- 🛡️ **Rate Limiting & Input Sanitization** — Helps protect APIs and validate incoming requests.

---

## Architecture Philosophy

> **AI proposes. Deterministic code disposes.**

Generative AI brings **creativity and personalization** to the planning experience, while deterministic TypeScript engines handle **exact financial calculations and calendar scheduling**.

This hybrid architecture combines the flexibility of AI with the accuracy and reliability required for real-world event planning.

---

### The Jashn Experience

**Describe your event → AI creates a personalized plan → Deterministic engines ensure accuracy → Track, adjust, and celebrate.**
---

## The One-Sentence Product Loop
> **Describe your event → AI drafts a structured plan → deterministic engines turn it into real rupee amounts and real calendar dates → you track and adjust it → ask Jashn when you are stuck.**

---

## Key Design Principle: AI Proposes, Deterministic Code Disposes
LLMs are creative partners, not calculators. Jashn never relies on an AI model for arithmetic or date calculations:
- **AI Output**: Gemini produces structured JSON representing category percentages, rationale, milestone week offsets, vendor questions, and theme ideas.
- **Pure Engines**: Pure, unit-tested TypeScript engines normalize percentages to exactly 100.0%, convert them into rupee amounts that sum **strictly and exactly** to the total budget, compress task timelines proportionally when dates are close, and serialize RFC 5545 `.ics` calendar files.

---

## Chosen Vertical: Indian Celebrations
Indian events have unique scale, rituals, multi-day coordination, and budgetary norms:
- **Weddings**: Spans selected functions (Haldi, Mehendi, Sangeet, Ceremony, Reception) with realistic budget allocation (catering ~32-35%, venue ~22%, decor ~13%, photo ~10%, attire ~8%, entertainment ~5%, and mandatory contingency ≥ 5%).
- **Birthdays**: Tailored by honoree age (magicians and interactive games for kids; marquee lighting and memory montages for milestone birthdays and seniors).
- **Community Events**: Focuses on civic logistics, noise/sound licenses, municipal permissions, waste segregation, fire safety, and crowd control.

---

## How It Works (Data Flow)

```
[ User Event Brief ] (Basics ➔ Scale ➔ Taste & Constraints)
         │
         ▼
[ Next.js API Routes (/api/plan) ]
  ├── Zod Request Validation
  ├── Rate Limiter (10 req/min per user+IP)
  └── Sanitization (Strips HTML, script tags, control chars)
         │
         ▼
[ Server-Only AI Client (lib/ai/gemini.ts) ]
  ├── Strict System Prompt with <brief> Delimiters
  ├── JSON Mode (responseMimeType: "application/json")
  ├── Primary Model (gemini-3.6-flash or Groq Llama 3.3)
  ├── Automatic Fallback Model (gemini-3.1-flash-lite)
  └── Automatic Repair Retry on Schema Validation Error
         │ (Offline / No Key Fallback)
         ▼
[ Deterministic Fallback Engine (lib/fallbackPlan.ts) ]
         │
         ▼
[ Pure Computational Engines (lib/engines/) ]
  ├── budget.ts   ──> Largest remainder normalization & exact rupee allocation
  ├── timeline.ts ──> UTC calendar day math & proportional compression
  └── ics.ts      ──> RFC 5545 iCalendar generation with 75-octet line folding
         │
         ▼
[ Safe Storage Layer (lib/storage.ts) ]
  ├── LocalStorage read/write Zod validation & auto-healing
  └── JSON Backup Export & Import (1 MB limit)
         │
         ▼
[ Dynamic Accessible Workspace (/event/[id]) ]
  ├── Overview (Countdown ring, Recharts budget donut, next 3 tasks)
  ├── Budget (Live spend tracker, what-if rebalancing simulator)
  ├── Timeline (Grouped by month, overdue filters, .ics download)
  ├── Vendors (Pipeline status, copy vetting questions, red flags)
  └── Ideas & Assistant (Theme cards, refresh with tweak, Ask Jashn Q&A)
```

---

## Design System & Aesthetics
- **Color Palette**:
  - Light mode: Warm ivory background (`#FBF7F2`), deep plum-maroon primary (`#7A1F4B`), celebratory marigold accent (`#B45309`).
  - Dark mode: Plum-charcoal background (`#15111A`), soft plum (`#E879B0`), warm gold accent (`#FBBF24`).
- **Typography**: Fraunces for headings, Inter for UI body text.
- **Visual Polish**: Gradient hairline under the header, animated circular SVG countdown ring, 1px subtle borders, generous spacing.
- **Currency**: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`.

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### 2. Installation
```bash
cd Jashn
npm install
```

### 3. Environment Variables
Copy the example environment configuration:
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
# Gemini API Key (Server only - no NEXT_PUBLIC_ prefix)
GEMINI_API_KEY=your_gemini_api_key_here

# Configurable Models (Verify at https://ai.google.dev/gemini-api/docs/models)
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite

# Optional: Groq Provider Key (works out of the box if GEMINI_API_KEY is unset)
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables Reference

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional* | None | Google Gemini API key. Never exposed to browser. |
| `GEMINI_MODEL` | Optional | `gemini-3.6-flash` | Primary Gemini model. Older shut-down models (`gemini-2.0-flash`, `gemini-2.5-*`) are never used. |
| `GEMINI_FALLBACK_MODEL` | Optional | `gemini-3.1-flash-lite` | Automatic fallback model used on HTTP 404. |
| `GROQ_API_KEY` | Optional | None | Groq API key for ultra-fast Llama 3.3 inference. |

*\*Note: If no API key is provided or if network fails, Jashn automatically degrades gracefully to the deterministic fallback plan engine. The entire app remains fully functional offline.*

---

## Automated Test Results

Jashn contains **85 automated unit, integration, and accessibility tests**, all passing green:

```text
> jashn@1.0.0 test:coverage
> jest --coverage

PASS __tests__/unit/format.test.ts
PASS __tests__/unit/rateLimit.test.ts
PASS __tests__/accessibility/overview.a11y.test.tsx
PASS __tests__/accessibility/budget.a11y.test.tsx
PASS __tests__/accessibility/wizard.a11y.test.tsx
PASS __tests__/integration/routes.test.ts
PASS __tests__/accessibility/home.a11y.test.tsx
PASS __tests__/unit/storage.test.ts
PASS __tests__/unit/budget.test.ts
PASS __tests__/unit/ics.test.ts
PASS __tests__/integration/geminiClient.test.ts
PASS __tests__/unit/timeline.test.ts
PASS __tests__/unit/schemas.test.ts
PASS __tests__/unit/fallbackPlan.test.ts
PASS __tests__/unit/sanitize.test.ts

------------------|---------|----------|---------|---------|--------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s  
------------------|---------|----------|---------|---------|--------------------
All files         |   88.66 |    64.78 |   94.73 |   88.69 |                    
 lib              |   87.73 |    57.33 |   96.29 |   87.42 |                    
  fallbackPlan.ts |   92.85 |    54.54 |     100 |   92.85 |                    
  format.ts       |     100 |    92.85 |     100 |     100 |                    
  rateLimit.ts    |      85 |    66.66 |     100 |      85 |                    
  sanitize.ts     |     100 |      100 |     100 |     100 |                    
  storage.ts      |   84.46 |     38.7 |   94.11 |   83.83 |                    
 lib/ai           |   65.71 |    49.09 |   72.72 |   66.99 |                    
  gemini.ts       |    62.1 |    44.68 |    62.5 |   63.44 |                    
  prompts.ts      |     100 |       75 |     100 |     100 |                    
 lib/engines      |   98.14 |       79 |     100 |    98.4 |                    
  budget.ts       |   97.54 |     75.8 |     100 |   98.18 |                    
  ics.ts          |     100 |      100 |     100 |     100 |                    
  timeline.ts     |   97.59 |       80 |     100 |   97.36 |                    
------------------|---------|----------|---------|---------|--------------------

Test Suites: 15 passed, 15 total
Tests:       85 passed, 85 total
Snapshots:   0 total
Time:        1.444 s
Ran all test suites.
```

### Running Test Commands
- `npm test`: Runs all unit, integration, and accessibility tests.
- `npm run test:coverage`: Generates full code coverage report against strict engine thresholds.
- `npm run typecheck`: Validates TypeScript strict mode (`zero any`, `noUncheckedIndexedAccess: true`).
- `npm run lint`: Runs ESLint validation.
- `npm run cypress:run`: Runs Cypress end-to-end browser tests.

---

## Accessibility (WCAG 2.1 AA Compliant)
- **Keyboard Navigation**: Skip link as first focusable element (`href="#main-content"`), roving tabindex on ARIA tabs (ArrowLeft, ArrowRight, Home, End), focus trap on dialog modals with Escape key dismiss.
- **Accessible Forms**: Every input has a visible `<label>`, required indicators in text, and inline errors in `role="alert"` linked via `aria-describedby`.
- **Non-Color Dependent**: Status pills and priorities always combine icon + color + explicit text.
- **Charts**: `role="img"` with descriptive `aria-label` and an adjacent, accessible HTML data table.
- **Motion & Contrast**: Full support for `prefers-reduced-motion` and minimum 4.5:1 color contrast.

---

## Security Architecture
- **No Client Secrets**: AI keys are accessed only on the server inside Next.js route handlers (`app/api/`). `gemini.ts` enforces `import 'server-only'`.
- **Header Key Transport**: Keys are transmitted via `x-goog-api-key` headers, never in URL parameters.
- **Content Security Policy (CSP)**: Strict CSP in `next.config.mjs` with frame-ancestors none, nosniff, and strict referrer policy.
- **Prompt Injection Defense**: Untrusted text is encapsulated in `<brief>` tags with explicit negative instructions and validated through strict Zod schemas.
- **Rate Limiting**: 10 requests/min sliding window per user UUID and client IP with `Retry-After`.
- **Resilient LocalStorage**: Zod validation on read and write with self-healing recovery if storage is tampered with or corrupted.

---

## Assumptions
1. **India-First**: Currency calculations are in INR (₹) formatted according to the Indian numbering system. Vendor costs represent realistic average Indian market estimates.
2. **Estimates Only**: All costs are ballpark planning estimates. Jashn explicitly advises users to confirm with local vendors and authorities.
3. **UTC Calendar Handling**: All dates are handled as ISO `YYYY-MM-DD` strings in UTC milliseconds to prevent timezone shifts.

---

## Decisions & Trade-offs
1. **Zero Auth (Organizer Rule)**: User accounts are prohibited. An anonymous UUID in `localStorage` serves as the user identity. Cross-device transfers are handled via portable 1 MB JSON backup export/import.
2. **LocalStorage vs Server DB**: Without authentication, storing data in browser `localStorage` guarantees immediate user ownership and offline availability, protected by automated schema validation.
3. **AI Proposes, Engines Dispose**: LLMs are kept away from financial arithmetic and calendar scheduling. Pure engines perform all division, proportional compression, and percentage normalization.

---

## Limitations
1. **Per-Instance Rate Limiting**: The in-memory sliding window rate limiter is per server instance. In a distributed multi-region cluster, a shared Redis or KV store would be substituted.
2. **Browser Quota**: `localStorage` has a ~5 MB browser limit. Jashn caps the workspace at 10 active events to ensure storage quotas are never exceeded.

---

## Future Work
- Multi-currency conversion for destination NRI weddings.
- WhatsApp RSVP export integration.
- Multi-collaborator peer-to-peer sync via WebRTC or encrypted cloud vaults.

