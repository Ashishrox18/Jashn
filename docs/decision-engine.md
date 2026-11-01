# Jashn Decision Engine Specification

## 1. Budget Normalization Engine (`lib/engines/budget.ts`)

### The Largest Remainder Method (Hare-Niemeyer Algorithm)
When the AI proposes budget percentages, the raw output rarely sums to exactly 100.0%. Standard `Math.round` produces rounding errors (e.g. 99.9% or 100.1%), causing visual discrepancies and broken totals.

Jashn uses the **Largest Remainder Method** with a fixed target of 1,000 tenths of a percent (100.0%):
1. **Scale**: For each category, compute raw tenths:
   $$\text{rawTenths}_i = \frac{\text{percent}_i}{\sum \text{percent}} \times 1000$$
2. **Integer Truncation**: Calculate $\text{floorTenths}_i = \lfloor \text{rawTenths}_i \rfloor$.
3. **Remainder**: Calculate fraction $\text{rem}_i = \text{rawTenths}_i - \text{floorTenths}_i$.
4. **Discrepancy Distribution**: Calculate deficit:
   $$\Delta = 1000 - \sum \text{floorTenths}_i$$
   Sort categories by descending remainder $\text{rem}_i$ and add 1 tenth (+0.1%) to the top $\Delta$ categories.
5. **Guarantee**: Every category percentage has at most 1 decimal place, and the sum across all categories is **mathematically guaranteed to equal exactly 100.0%**.

### Mandatory Contingency Enforcement
Indian celebrations routinely encounter unforeseen expenses (overtime music permits, unexpected guest turnout, emergency weather contingencies). Jashn enforces:
- If `contingency` is missing, a 5% contingency line is automatically inserted, deducting from the largest category.
- If `contingency < 5%`, the deficit is deducted from the highest allocated category and credited to contingency.

### Exact Rupee Allocation Algorithm
1. Convert total budget $\text{totalInr}$ into ₹100 units:
   $$\text{totalUnits} = \lfloor \text{totalInr} / 100 \rfloor$$
2. Distribute integer units using the largest remainder method based on normalized percentages.
3. If $\text{totalInr} \pmod{100} \neq 0$ (e.g., ₹2,50,050), the odd residue (₹50) is allocated to the highest-budget category.
4. **Result**: The sum of allocated rupee amounts strictly equals `totalBudgetInr` down to the exact rupee.

---

## 2. Timeline Scheduling & Compression Engine (`lib/engines/timeline.ts`)

### UTC Date Arithmetic
Local browser time math causes off-by-one errors when users are in different time zones or daylight transitions. Jashn handles all dates as plain `YYYY-MM-DD` strings in UTC milliseconds:
$$\text{daysUntil}(\text{eventDate}, \text{today}) = \text{round}\left(\frac{\text{Date.UTC}(\text{eventDate}) - \text{Date.UTC}(\text{today})}{86,400,000}\right)$$

### Proportional Compression (Worked Example)
Standard Indian wedding plans assume a 24-week (~168 days) planning runway. When an organizer plans an event occurring in **10 days**:

#### Inputs:
- Event date: `2026-11-11`
- Planning date (`today`): `2026-11-01`
- $\text{daysUntil} = 10$ days
- Original Task: *Book Royal Palace Venue* (`weeksBefore: 20` $\implies$ 140 days prior)
- Max planned offset across plan: $\text{maxPlannedDays} = 140$ days

#### Calculation:
Because $\text{maxPlannedDays} (140) > \text{daysUntil} (10)$, the engine triggers **proportional compression**:
$$\text{compressedOffset} = \text{round}\left(\frac{\text{weeksBefore} \times 7}{\text{maxPlannedDays}} \times \text{daysUntil}\right)$$
$$\text{compressedOffset} = \text{round}\left(\frac{140}{140} \times 10\right) = 10 \text{ days}$$
$$\text{dueDate} = \text{eventDate} - 10 \text{ days} = \text{2026-11-01 (Today)}$$

For a later task (*Send Digital Invites*, `weeksBefore: 4` $\implies$ 28 days prior):
$$\text{compressedOffset} = \text{round}\left(\frac{28}{140} \times 10\right) = 2 \text{ days}$$
$$\text{dueDate} = \text{eventDate} - 2 \text{ days} = \text{2026-11-09}$$

#### Safeguards:
- No task due date is ever scheduled before `today`.
- No task due date is ever scheduled after `eventDate`.
- The UI surfaces an honest notice: *"Your event is sooner than a typical plan — Jashn compressed the timeline."*

---

## 3. Fallback Plans & AI Model Fallback (`lib/fallbackPlan.ts` & `lib/ai/gemini.ts`)

### Deterministic Plan Templates
When offline or when `GEMINI_API_KEY` is unset:
- **Wedding Template**: Adapts to selected wedding functions (Haldi, Mehendi, Sangeet, Ceremony, Reception).
- **Birthday Template**: Adapts to honoree age brackets (Kids < 13, Adults 13-59, Seniors 60+).
- **Community Template**: Automatically includes municipal sound permissions, police NOC, fire clearances, waste segregation, and crowd control.

### AI Model Fallback Matrix
1. **Primary**: `GEMINI_MODEL` (default: `gemini-3.6-flash`).
2. **HTTP 404 Recovery**: If Google deprecates or changes the model alias, the client retries once using `GEMINI_FALLBACK_MODEL` (default: `gemini-3.1-flash-lite`).
3. **Alternative Provider**: If `GROQ_API_KEY` is present, Groq OpenAI-compatible JSON endpoint is supported.
4. **Repair Retry**: On JSON parse error or Zod schema validation failure, the client sends a single repair prompt before failing gracefully to the deterministic fallback plan.

