---
phase: 08-design-tokens-shell-alignment
fixed_at: 2026-04-10T00:00:00Z
review_path: .planning/phases/08-design-tokens-shell-alignment/08-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 8: Code Review Fix Report

**Fixed at:** 2026-04-10T00:00:00Z
**Source review:** .planning/phases/08-design-tokens-shell-alignment/08-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5 (1 Critical, 4 Warning)
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: Shell CSS custom properties are never defined — all token references resolve to nothing

**Files modified:** `src/app/globals.css`
**Commit:** f72a476
**Applied fix:** Added a `:root` block to `globals.css` defining all 30 `--shell-*` CSS custom properties: backgrounds, text, borders, accent, semantic (destructive), spacing (xs–3xl), radii (sm–pill), shadows (sm–lg), and layout dimensions (header-h, footer-h, sidebar-w). The `@import "tailwindcss"` directive was preserved at the top.

---

### WR-01: `<details>` dropdowns have no close-on-outside-click behaviour

**Files modified:** `src/components/layout/CaseHeader.tsx`
**Commit:** 92af592
**Applied fix:** Replaced both native `<details>`/`<summary>` elements (Export Report and Actions menus) with controlled `useState` dropdowns. Added `exportOpen`/`actionsOpen` state variables, toggled via `onClick`, closed via `onBlur` with a 150ms setTimeout. Dropdown items call `setExportOpen(false)` / `setActionsOpen(false)` on click. Also replaced `hover:bg-[var(--shell-accent-hover)]` with `hover:bg-shell-accent-hover` (resolving IN-01 as a side effect). `useState` was added to the import.

---

### WR-02: Entity/connection panels in `CaseWorkspaceShell` bypass shell tokens entirely

**Files modified:** `src/components/layout/CaseWorkspaceShell.tsx`
**Commit:** 8c37f01
**Applied fix:** Replaced all raw palette utilities in the entity and connection panel sections (lines 126–234) with shell token equivalents: `rounded-[2rem]` → `rounded-shell-xl`, `border-slate-800` → `border-shell-border`, `bg-slate-900/80` → `bg-shell-surface`, `text-slate-50` → `text-shell-text-primary`, `text-slate-500` → `text-shell-text-muted`, `border-cyan-400/30 bg-cyan-400/10 text-cyan-100` → `border-shell-accent/30 bg-shell-accent-muted text-shell-text-primary`, `border-rose-500/20 text-rose-200` → `border-shell-destructive/20 text-shell-destructive`. Also migrated outer spacing utilities (`space-y-6`, `gap-6`, `space-y-4`) to `space-y-shell-lg`, `gap-shell-lg`, and `space-y-shell-md`.

---

### WR-03: `CaseListPage` is entirely unstyled with shell tokens

**Files modified:** `src/components/pages/CaseListPage.tsx`
**Commit:** 95e175a
**Applied fix:** Migrated all raw palette utilities across the full component to shell token equivalents: `bg-slate-950` → `bg-shell-bg`, `text-slate-100` → `text-shell-text-primary`, `rounded-[2rem]` → `rounded-shell-xl`, `border-slate-800` → `border-shell-border`, `bg-slate-900/80` → `bg-shell-surface`, `text-slate-50` → `text-shell-text-primary`, `text-slate-300/400/500` → `text-shell-text-secondary/muted`, `bg-cyan-400` → `bg-shell-accent`, `text-slate-950` → `text-shell-accent-fg`, `rounded-2xl` → `rounded-shell-lg`, spacing gaps to `gap-shell-lg`. The radial gradient hero background was simplified to `bg-shell-surface` to stay within the token system.

---

### WR-04: `layout.tsx` root body uses raw palette, not shell tokens

**Files modified:** `src/app/layout.tsx`
**Commit:** 380b76c
**Applied fix:** Replaced `bg-slate-950 text-slate-100` with `bg-shell-bg text-shell-text-primary` on the root `<body>` element so future theme changes in `globals.css` propagate automatically.

---

_Fixed: 2026-04-10T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
