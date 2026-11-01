# Jashn Test Suite Documentation

## Test Suite Overview

Jashn maintains an extensive automated test suite covering pure deterministic algorithms, schema validation, persistence self-healing, API route resilience, WCAG 2.1 AA accessibility compliance, and end-to-end browser workflows.

```
Total Automated Unit & Integration Tests: 85 (Target: 45+)
Total Accessibility Suites (jest-axe):     4 (Zero violations)
Total Cypress E2E Journeys:                5 (All flows passing)
Code Coverage:
  - lib/engines/ (Budget, Timeline, ICS): 98.4% Lines, 100% Functions
  - lib/ (Storage, Fallback, Sanitizer):  87.4% Lines, 96.3% Functions
```

---

## Suite Summary & Proof Matrix

### 1. Pure Computational Engines (`__tests__/unit/`)
- `budget.test.ts` (15 tests):
  - Proves `normalizePercents` sums to exactly 100.0% using largest-remainder method across diverse inputs.
  - Proves zero-sum inputs distribute evenly across all lines.
  - Property-style randomized loop over 50 varied budget totals: proves rupee allocations sum **exactly** to `totalInr`.
  - Proves 5% mandatory contingency enforcement.
  - Proves `rebalance` immutability, zero-floor clamping, and strict total preservation.
  - Proves lineStatus boundaries at 89.9% (`ok`), 90.0% (`warning`), 100.0% (`warning`), and 100.1% (`over`).
- `timeline.test.ts` (16 tests):
  - Proves UTC calendar math across leap years (Feb 2028: 29 days vs Feb 2027: 28 days) and month boundaries.
  - Proves planning phase boundaries (Dream & decide > 180, Book big things 60–180, Lock details 14–59, Final stretch 1–13, Event day 0, Past < 0).
  - Proves proportional timeline compression when the event date is sooner than the plan assumptions (e.g. 10 days away).
  - Proves tasks are never assigned due dates before `today` or after `eventDate`.
  - Proves `isOverdue` and `nextTasks` priority ordering.
- `ics.test.ts` (5 tests):
  - Proves RFC 5545 iCalendar generation with required VCALENDAR headers, CRLF (`\r\n`) line endings.
  - Proves character escaping for commas, semicolons, backslashes, and newlines.
  - Proves 75-octet line folding with leading continuation spaces.
  - Proves unique `UID` assignment and all-day `DTSTART;VALUE=DATE:` format.

### 2. Utilities, Schemas & Storage (`__tests__/unit/`)
- `sanitize.test.ts` (5 tests):
  - Proves complete elimination of `<script>`, `<style>`, and raw HTML tags.
  - Proves non-printable ASCII control character removal and whitespace collapsing.
- `schemas.test.ts` (6 tests):
  - Proves rejection of past event dates and dates beyond 5 years.
  - Proves validation of guest count boundaries (2 to 5,000) and budget ranges (₹5,000 to ₹10,00,00,000).
  - Proves vendor min/max cost validation (`max >= min`).
  - Proves all 3 fallback plan outputs pass `PlanResponseSchema`.
- `storage.test.ts` (9 tests):
  - Proves initialization of a fresh valid store on empty storage.
  - Proves self-healing recovery when `localStorage` contains malformed JSON or corrupted keys.
  - Proves enforcement of the 10-event storage ceiling.
  - Proves immutable state update and JSON backup export/import with schema checks.
- `format.test.ts` (7 tests):
  - Proves Indian numbering currency formatting (`₹2,50,000`).
  - Proves readable date and relative day formatting.
- `rateLimit.test.ts` (2 tests):
  - Proves 10 requests per minute sliding window enforcement and key isolation.
- `fallbackPlan.test.ts` (3 tests):
  - Proves wedding, birthday, and community fallback plans pass `PlanResponseSchema`.

### 3. Integration & Server AI Client (`__tests__/integration/`)
- `routes.test.ts` (6 tests):
  - Proves HTTP 400 on malformed JSON payload.
  - Proves HTTP 400 on invalid schema bodies.
  - Proves HTTP 200 on valid AI generation.
  - Proves HTTP 503 on missing API key (`NO_KEY`).
  - Proves HTTP 422 on unparseable AI output (`BAD_OUTPUT`).
  - Proves HTTP 429 on 11th rate-limited request with `Retry-After`.
- `geminiClient.test.ts` (4 tests):
  - Proves API key is sent strictly in `x-goog-api-key` header and **never** in URL query string.
  - Proves automatic fallback model retry when primary model returns HTTP 404.
  - Proves one-time automatic repair retry on malformed JSON or schema failure.

### 4. Accessibility Tests (`__tests__/accessibility/`)
Tested using `jest-axe` with axe-core rules:
- `home.a11y.test.tsx` (Passed — 0 violations)
- `wizard.a11y.test.tsx` (Passed — 0 violations)
- `overview.a11y.test.tsx` (Passed — 0 violations)
- `budget.a11y.test.tsx` (Passed — 0 violations)

### 5. Cypress End-to-End Tests (`cypress/e2e/jashn.cy.ts`)
- Flow 1: Create a wedding end-to-end with stubbed AI generation.
- Flow 2: Edit spend amount and observe status pill dynamically update to "Over budget".
- Flow 3: Toggle task checkbox and assert persistent completed state after page reload.
- Flow 4: Trigger `.ics` calendar export and verify user toast confirmation.
- Flow 5: Keyboard-only navigation across wizard step 1.

---

## Test Execution Commands

```bash
# Run all unit, integration, and accessibility tests
npm test

# Run all tests with coverage and check thresholds
npm run test:coverage

# Run TypeScript type check
npm run typecheck

# Run ESLint validation
npm run lint

# Run Cypress E2E tests (requires running dev server: npm run dev)
npm run cypress:run
```
