---
phase: 08
slug: design-tokens-shell-alignment
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-10
---

# Phase 08 - UI Design Contract

> Visual and interaction contract for the shell/token foundation phase.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react or existing minimal icon set |
| Font | existing app font stack until a later typography phase revisits it |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon spacing |
| sm | 8px | Dense controls and chips |
| md | 16px | Default control spacing |
| lg | 24px | Card and panel padding |
| xl | 32px | Section gaps |
| 2xl | 48px | Major shell breathing room |
| 3xl | 64px | Page-level top/bottom spacing |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 | 1.6 |
| Label | 12px | 500 | 1.4 |
| Heading | 24px | 600 | 1.2 |
| Display | 36px | 600 | 1.1 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | light: `#f8fafc`, dark: `#0f172a` | Page background and large surfaces |
| Secondary (30%) | light: `#ffffff`, dark: `#111827` | Cards, rails, elevated panels |
| Accent (10%) | `#7c3aed` | Primary actions, active tabs, command focus, selected shell emphasis |
| Destructive | `#ef4444` | Destructive actions only |

Accent reserved for: primary CTA, active navigation/tab state, focused command surface, and selected shell-level emphasis only.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Context-specific, concise verb-first labels |
| Empty state heading | Clear description of what is missing |
| Empty state body | One sentence plus the next action |
| Error state | Problem plus recovery path |
| Destructive confirmation | Action-specific and explicit |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not required |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
