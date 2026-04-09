---
phase: 08-design-tokens-shell-alignment
reviewed: 2026-04-10T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/app/globals.css
  - src/app/layout.tsx
  - src/components/layout/AICommandBar.tsx
  - src/components/layout/CaseHeader.tsx
  - src/components/layout/CaseWorkspaceShell.tsx
  - src/components/layout/EvidenceSidebar.tsx
  - src/components/layout/TimelineBar.tsx
  - src/components/pages/CaseListPage.tsx
  - src/components/pages/CaseWorkspacePage.tsx
  - tailwind.config.ts
findings:
  critical: 1
  warning: 4
  info: 4
  total: 9
status: issues_found
---

# Phase 8: Code Review Report

**Reviewed:** 2026-04-10T00:00:00Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

This phase introduces the shell token design system: a set of `--shell-*` CSS custom properties
referenced by Tailwind utility aliases defined in `tailwind.config.ts`. The shell token aliases
are used consistently across the five new/updated layout components (`AICommandBar`, `CaseHeader`,
`EvidenceSidebar`, `TimelineBar`, and largely `CaseWorkspaceShell`).

The critical blocker is that **`globals.css` never defines any `--shell-*` CSS custom properties**.
Every `var(--shell-*)` call in the codebase resolves to an invalid/empty value at runtime, meaning
all shell-token-based colors, spacing, radii, and shadows will be invisible or zero. Nothing will
crash outright but the entire visual design of the workspace shell will be broken until the token
definitions are added to `globals.css`.

Beyond that blocker, three correctness-level warnings exist: the `<details>` dropdown menus in
`CaseHeader` have no close-on-outside-click behaviour; `CaseWorkspaceShell` contains a large
section (the entity/connection panels) that bypasses the shell token system entirely and uses raw
`slate-*` palette values; and `CaseListPage` is completely unstyled with shell tokens, relying
solely on raw palette values. These are not blocking bugs but they undermine the alignment goal
of this phase.

---

## Critical Issues

### CR-01: Shell CSS custom properties are never defined — all token references resolve to nothing

**File:** `src/app/globals.css:1`

**Issue:** `globals.css` contains only `@import "tailwindcss"`. The entire
`tailwind.config.ts` token system (`--shell-bg`, `--shell-surface`, `--shell-surface-raised`,
`--shell-surface-overlay`, `--shell-text-primary`, `--shell-text-secondary`, `--shell-text-muted`,
`--shell-text-inverse`, `--shell-border`, `--shell-border-strong`, `--shell-border-focus`,
`--shell-accent`, `--shell-accent-hover`, `--shell-accent-muted`, `--shell-accent-fg`,
`--shell-destructive`, `--shell-destructive-bg`, `--shell-space-xs/sm/md/lg/xl/2xl/3xl`,
`--shell-radius-sm/md/lg/xl/pill`, `--shell-shadow-sm/md/lg`, `--shell-header-h`,
`--shell-footer-h`, `--shell-sidebar-w`) is never given concrete values. At runtime every
`var(--shell-*)` reference produces an empty string, causing all shell-token-derived colors to
fall back to the browser default (transparent/black), all shell-token-derived spacing to collapse
to 0, and all shell-token-derived radii/shadows to disappear.

This affects every layout component reviewed and the gradient in `TimelineBar` (line 64).

**Fix:** Add a `:root` block (and optionally a `[data-theme="dark"]` variant) to `globals.css`
that defines every token with concrete values, for example:

```css
@import "tailwindcss";

:root {
  /* Backgrounds */
  --shell-bg:              #020617;   /* slate-950 */
  --shell-surface:         #0f172a;   /* slate-900 */
  --shell-surface-raised:  #1e293b;   /* slate-800 */
  --shell-surface-overlay: #1e293b99;

  /* Text */
  --shell-text-primary:    #f8fafc;   /* slate-50  */
  --shell-text-secondary:  #cbd5e1;   /* slate-300 */
  --shell-text-muted:      #64748b;   /* slate-500 */
  --shell-text-inverse:    #020617;

  /* Borders */
  --shell-border:          #1e293b;   /* slate-800 */
  --shell-border-strong:   #334155;   /* slate-700 */
  --shell-border-focus:    #22d3ee;   /* cyan-400  */

  /* Accent */
  --shell-accent:          #22d3ee;   /* cyan-400  */
  --shell-accent-hover:    #67e8f9;   /* cyan-300  */
  --shell-accent-muted:    rgba(34, 211, 238, 0.10);
  --shell-accent-fg:       #020617;

  /* Semantic */
  --shell-destructive:     #f43f5e;   /* rose-500  */
  --shell-destructive-bg:  rgba(244, 63, 94, 0.12);

  /* Spacing */
  --shell-space-xs:  0.25rem;
  --shell-space-sm:  0.5rem;
  --shell-space-md:  1rem;
  --shell-space-lg:  1.5rem;
  --shell-space-xl:  2rem;
  --shell-space-2xl: 3rem;
  --shell-space-3xl: 4rem;

  /* Radii */
  --shell-radius-sm:   0.5rem;
  --shell-radius-md:   0.75rem;
  --shell-radius-lg:   1rem;
  --shell-radius-xl:   1.25rem;
  --shell-radius-pill: 9999px;

  /* Shadows */
  --shell-shadow-sm: 0 1px 3px 0 rgba(0,0,0,0.4);
  --shell-shadow-md: 0 4px 12px 0 rgba(0,0,0,0.5);
  --shell-shadow-lg: 0 10px 40px -4px rgba(0,0,0,0.6);

  /* Layout */
  --shell-header-h:  4rem;
  --shell-footer-h:  3rem;
  --shell-sidebar-w: 20rem;
}
```

---

## Warnings

### WR-01: `<details>` dropdowns have no close-on-outside-click behaviour

**File:** `src/components/layout/CaseHeader.tsx:72-132`

**Issue:** Both the "Export Report" (line 72) and "Actions" (line 105) menus are implemented with
the native `<details>`/`<summary>` element. The native `<details>` element does not close when
the user clicks anywhere outside it. Once opened, the only ways to close the dropdown are to
click the summary again or, in some browsers, press Escape. This is a functional regression
compared to standard dropdown UX and can leave both menus open simultaneously, stacking overlapping
dropdown panels.

**Fix:** Either replace with a controlled `useState` dropdown that registers a `pointerdown`
listener on `document` to close when clicking outside, or attach a `blur` handler. Minimal
example using state:

```tsx
const [exportOpen, setExportOpen] = useState(false);
// in JSX:
<div className="relative">
  <button
    type="button"
    onClick={() => setExportOpen((o) => !o)}
    onBlur={() => setTimeout(() => setExportOpen(false), 150)}
    ...
  >
    {isExporting ? 'Exporting\u2026' : 'Export Report'}
  </button>
  {exportOpen && (
    <div className="absolute right-0 z-10 mt-2 ...">
      ...
    </div>
  )}
</div>
```

---

### WR-02: Entity/connection panels in `CaseWorkspaceShell` bypass shell tokens entirely

**File:** `src/components/layout/CaseWorkspaceShell.tsx:126-234`

**Issue:** The "Graph Nodes" and "Relationship Edges" panels (lines 126–234) use raw Tailwind
palette utilities throughout:
- `rounded-[2rem]` instead of `rounded-shell-xl`
- `border-slate-800` instead of `border-shell-border`
- `bg-slate-900/80` instead of `bg-shell-surface`
- `text-slate-50` instead of `text-shell-text-primary`
- `text-slate-500` instead of `text-shell-text-muted`
- `border-cyan-400/30 bg-cyan-400/10 text-cyan-100` instead of shell accent tokens
- `border-rose-500/20 text-rose-200` instead of shell destructive tokens

Additionally, the outer container uses `space-y-6` (line 87), `gap-6` (line 102), `space-y-6`
(line 109), and `space-y-4` (line 115) instead of `space-y-shell-md/lg` equivalents.

This means when the shell token theme changes (e.g., a light theme via `data-theme`), these
panels will not respond and will remain hard-coded to the dark palette.

**Fix:** Replace raw palette values with their shell-token equivalents:

```tsx
// Before:
<div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-black/30">
// After:
<div className="rounded-shell-xl border border-shell-border bg-shell-surface p-shell-md shadow-shell-lg">

// Before: text-slate-50 / text-slate-500
// After:  text-shell-text-primary / text-shell-text-muted

// Before: border-cyan-400/30 bg-cyan-400/10 text-cyan-100
// After:  border-shell-accent/30 bg-shell-accent-muted text-shell-text-primary

// Before: border-rose-500/20 text-rose-200
// After:  border-shell-destructive/20 text-shell-destructive
```

---

### WR-03: `CaseListPage` is entirely unstyled with shell tokens

**File:** `src/components/pages/CaseListPage.tsx:23-113`

**Issue:** `CaseListPage` uses no shell tokens at all. It hard-codes raw palette values for every
style decision: `bg-slate-950`, `text-slate-100`, `bg-[radial-gradient(...)]`, `border-slate-800`,
`bg-slate-900/80`, `text-cyan-300/70`, `text-slate-50`, `rounded-[2rem]`, `rounded-full`, etc.
This is the page users land on before entering a workspace, so it is the first impression of the
design system. If the purpose of phase 8 is design token alignment, `CaseListPage` is out of scope
for that alignment and represents an unresolved split between two styling approaches.

**Fix:** Migrate `CaseListPage` to shell tokens following the same pattern as the workspace shell
components. At minimum align `rounded-[2rem]` → `rounded-shell-xl`, `border-slate-800` →
`border-shell-border`, `bg-slate-900/80` → `bg-shell-surface`, `text-slate-50` →
`text-shell-text-primary`, `text-cyan-300/70` → `text-shell-text-muted`, and accent
elements → `bg-shell-accent text-shell-accent-fg`.

---

### WR-04: `layout.tsx` root body uses raw palette, not shell tokens

**File:** `src/app/layout.tsx:16`

**Issue:** The root `<body>` element applies `bg-slate-950 text-slate-100` directly. Since the
shell token system defines `--shell-bg` (mapped to `bg-shell-bg`) and `--shell-text-primary`
(mapped to `text-shell-text-primary`), the root body should use those tokens so that any future
theme change in `globals.css` propagates automatically.

**Fix:**

```tsx
// Before:
<body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
// After:
<body className="min-h-screen bg-shell-bg text-shell-text-primary antialiased">
```

---

## Info

### IN-01: `--shell-accent-hover` referenced via inline `var()` instead of the registered Tailwind token

**File:** `src/components/layout/CaseHeader.tsx:73`

**Issue:** The export summary hover style uses `hover:bg-[var(--shell-accent-hover)]` (an arbitrary
value class) rather than `hover:bg-shell-accent-hover` (the registered Tailwind token from
`tailwind.config.ts`). This is inconsistent with the rest of the file and prevents tree-shaking
optimisation of that class.

**Fix:**

```tsx
// Before:
className="... hover:bg-[var(--shell-accent-hover)]"
// After:
className="... hover:bg-shell-accent-hover"
```

---

### IN-02: Duplicate computation of `activeEvidenceLabel` / `selectedNodeLabel` across page and shell

**File:** `src/components/pages/CaseWorkspacePage.tsx:51-55` and `src/components/layout/CaseWorkspaceShell.tsx:72-85`

**Issue:** `activeEvidenceFile`, `activeEvidenceLabel`, and `selectedNodeLabel` are computed in
both `CaseWorkspacePage` (lines 51–55) and independently recomputed inside `CaseWorkspaceShell`
(lines 72–85). The page-level copies are used only to populate the `exportContext` object (line
74–76 of the page). The duplication means any change to the derivation logic must be made in two
places.

**Fix:** Pass `activeEvidenceLabel` and `selectedNodeLabel` as props to `CaseWorkspaceShell` (or
expose them via a callback/ref), so the shell can surface them upward to the page for export
context rather than each layer computing independently.

---

### IN-03: `resolvedCaseData` alias is a no-op assignment

**File:** `src/components/pages/CaseWorkspacePage.tsx:49`

**Issue:** `const resolvedCaseData = caseData;` on line 49 adds no type narrowing (TypeScript
already knows `caseData` is non-null after the `if (!caseData)` guard on line 39) and creates
a second name for the same value. It adds cognitive overhead without benefit.

**Fix:** Remove the alias and use `caseData` directly in the JSX and `exportContext`.

---

### IN-04: Debug/placeholder strings remain in production-rendered components

**File:** `src/components/layout/AICommandBar.tsx:9`, `src/components/layout/TimelineBar.tsx:29-31`

**Issue:** `AICommandBar` renders the string `"AICommandBar"` as visible content in a `<p>` tag
(line 9). `TimelineBar` similarly renders `"TimelineBar"` as its eyebrow label (line 29) and
`"Timeline and status strip"` as its heading (line 31), which are clearly scaffold names rather
than user-facing copy. These will appear verbatim in the UI.

**Fix:** Replace debug strings with appropriate user-facing labels or a `{/* placeholder */}`
comment if the component is intentionally not yet complete:

```tsx
// AICommandBar line 9 — remove or replace:
// <p className="...">AICommandBar</p>  ← remove

// TimelineBar line 29 — replace with user-facing copy:
<p className="...">Case Intelligence</p>
<h2 className="...">Timeline & Status</h2>
```

---

_Reviewed: 2026-04-10T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
