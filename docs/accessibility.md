# Jashn Accessibility Implementation (WCAG 2.1 AA)

Jashn is built from the ground up to meet and exceed Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.

## Accessibility Checklist & Technical Implementation

### 1. Landmarks & Document Structure
- **Skip Link**: The very first interactive element in `app/layout.tsx` is an accessible skip link (`<a href="#main-content">Skip to main content</a>`). It is visually hidden (`sr-only`) until focused via keyboard navigation (`focus:not-sr-only`).
- **Semantic Landmarks**:
  - `<header>`: Contains primary branding and global navigation.
  - `<nav aria-label="Main">`: Clearly labeled main navigation.
  - `<main id="main-content">`: Single main region containing unique page views.
  - `<footer>`: Landmark footer with persistent planning and legal disclaimer.
- **Language**: `<html lang="en">` is declared on root.
- **Page Titles**: Route-specific descriptive titles configured via Next.js metadata.

---

### 2. ARIA Tabs Pattern (`components/ui/Tabs.tsx`)
Follows the W3C WAI-ARIA Authoring Practices Guide (APG) for Tab panels:
- `role="tablist"` on the container with an `aria-label`.
- `role="tab"` on each tab button.
- `aria-selected="true"` on the active tab; `aria-selected="false"` on inactive tabs.
- `aria-controls="tabpanel-{id}"` links each tab to its associated panel.
- **Roving Tabindex**: Active tab has `tabIndex={0}`; inactive tabs have `tabIndex={-1}`.
- **Keyboard Navigation**:
  - `ArrowRight` / `ArrowLeft`: Moves focus and activates the next/previous tab in a circular loop.
  - `Home` / `End`: Immediately moves focus to the first or last tab.
- `role="tabpanel"` on content panels with `aria-labelledby="tab-{id}"` and `tabIndex={0}`.

---

### 3. Forms, Labels & Error Handling
- **Visible `<label>`**: Every input, textarea, and select element has a visible, programmatically associated `<label htmlFor="...">` tag.
- **Required Fields**: Required inputs display visible text asterisks (`*`) alongside standard `required` attributes.
- **Accessible Error Alerts**: Validation errors are marked with `role="alert"` and linked to their respective inputs via `aria-describedby="error-{field}"`.
- **Live Regions & Loading States**:
  - Active submission states set `aria-busy="true"` and update an `aria-live="polite"` status message.
  - Toast notifications use a polite live region (`aria-live="polite"`, `aria-atomic="true"`).

---

### 4. Non-Color Reliant Status Communication
Information is never conveyed using color alone (WCAG 1.4.1):
- **Budget Status Pills**:
  - `ok`: Green color + Check circle icon + "On track" text label.
  - `warning`: Amber color + Alert triangle icon + "Near limit" text label.
  - `over`: Red color + Alert circle icon + "Over budget" text label.
- **Task Priorities**: Combines priority color + distinct icon + explicit text ("High", "Medium", "Low").
- **Vendor Status**: Distinct icon + textual badge ("Booked", "Quoted", "Contacted", "To contact").

---

### 5. Charts & Data Visualizations (WCAG 1.1.1)
- **Image Roles**: Visual SVGs (Countdown ring, Recharts budget donut) have `role="img"` and detailed textual `aria-label` summaries describing the data values and totals.
- **Adjacent Data Tables**: In accordance with accessible chart best practices, the visual budget donut is accompanied directly by an accessible HTML `<table>` with `<th scope="col">` headers, row categories, percentages, and exact rupee values.

---

### 6. Modal Dialogs & Focus Traps
- The event deletion confirmation modal implements `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
- Upon opening, focus is automatically trapped on the safe action ("Cancel" button).
- Pressing `Escape` or clicking outside closes the dialog.

---

### 7. Visual Contrast, Sizing & Motion
- **Color Contrast (WCAG 1.4.3)**: Every text color meets or exceeds 4.5:1 contrast against its respective surface, tested across both light mode (Ivory `#FBF7F2` surface) and dark mode (Plum-charcoal `#15111A` surface).
- **Touch Target Sizes (WCAG 2.5.5)**: All interactive buttons, tabs, inputs, and links have minimum dimensions of 44 × 44 pixels (`min-h-[44px] min-w-[44px]`).
- **Focus Indicators**: Visible `:focus-visible` outline rings (2px solid marigold accent `#B45309` / `#FBBF24` with offset) on all interactives.
- **Prefers-Reduced-Motion**: Framer Motion transitions and SVG countdown animations automatically respect the user's OS preference (`@media (prefers-reduced-motion: reduce)`), rendering final states immediately without vestibular trigger animations.

