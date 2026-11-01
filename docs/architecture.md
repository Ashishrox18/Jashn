# Jashn Architecture

## Overview & Product Philosophy

**Jashn** (*Plan the celebration, not the stress*) is an event planning assistant designed specifically for weddings, birthdays, and community gatherings in India.

The core architecture is built around one fundamental principle:
> **AI proposes, deterministic code disposes.**

Generative AI models excel at lateral ideation, cultural context synthesis, and qualitative rationale. However, LLMs are fundamentally unreliable at deterministic arithmetic, date arithmetic, timezone boundary calculation, and calendar RFC compliance. Jashn decouples creative synthesis from computational certainty:

1. **AI Layer**: Generates structured proposals (categories, rationales, percentages, week offsets, vendor vetting questions, ideas).
2. **Deterministic Engine Layer**: Pure, unit-tested TypeScript engines normalize percentages to exactly 100.0%, allocate exact rupee amounts to the single rupee, compress timeline dates proportionally, and build valid RFC 5545 iCalendar files.

---

## Architectural Data Flow

```
[ User Event Brief ]
         │
         ▼
[ Next.js API Routes (/api/plan) ]
  ├── 16 KB Body & Malformed JSON Protection
  ├── Zod Request Schema Validation
  ├── Rate Limiter (10 req/min sliding window)
  └── Text Sanitizer (strips HTML, control chars)
         │
         ▼
[ Server-Only AI Client (lib/ai/gemini.ts) ]
  ├── Strict System Boundaries (<brief> delimiters)
  ├── Structured JSON Mode (responseMimeType: "application/json")
  ├── Primary Model: gemini-3.6-flash (or Groq provider)
  ├── 404 Automatic Model Fallback: gemini-3.1-flash-lite
  └── Automatic Repair Retry on Schema Mismatch
         │ (Fallback if Offline or Unconfigured)
         ▼
[ Deterministic Fallback Plan (lib/fallbackPlan.ts) ]
         │
         ▼
[ Pure Computational Engines (lib/engines/) ]
  ├── budget.ts   ──> Largest remainder normalization & exact INR distribution
  ├── timeline.ts ──> UTC calendar day math & proportional compression
  └── ics.ts      ──> RFC 5545 iCalendar serialization with 75-octet line folding
         │
         ▼
[ Safe Storage Layer (lib/storage.ts) ]
  ├── LocalStorage read/write Zod validation
  ├── Auto-recovery on corruption (never crashes UI)
  └── JSON Backup Export & Import (1 MB limit)
         │
         ▼
[ Accessible UI Components & Workspaces ]
  ├── Overview (CountdownRing, Recharts Donut, Next Milestones)
  ├── Budget (Live Table, Spent Inputs, What-If Rebalancer)
  ├── Timeline (Grouped by Month, Filters, .ics Download)
  ├── Vendors (Pipeline, Copy Vetting Questions, Red Flags)
  └── Ideas & Assist (Grouped Inspiration, Refresh, Q&A)
```

---

## Why LocalStorage? (Zero Authentication Constraint)

1. **Organizer Specification**: The event organizer explicitly prohibited user authentication. No login walls, no email collection, no OAuth flows.
2. **Anonymous Identity**: A persistent UUID v4 is automatically generated on first client boot and stored in `localStorage`.
3. **Data Privacy & Ownership**: Users retain complete control over their event data. All data resides on their local machine.
4. **Portability**: A complete JSON backup export/import feature is built-in with strict 1 MB size checks and Zod validation, enabling cross-device transfers without an account.
5. **Resilience**: The storage layer is wrapped with `safeParse` on both read and write. Even if the user manually corrupts `localStorage` in browser DevTools, the store automatically reinitializes to a fresh valid state without crashing.

