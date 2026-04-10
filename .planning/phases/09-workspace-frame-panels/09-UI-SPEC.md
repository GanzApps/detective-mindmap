---
phase: 09
slug: workspace-frame-panels
status: draft
created: 2026-04-10
---

# Phase 09 - UI Design Contract

> Visual and structural contract for the workspace frame and persistent panel rebuild.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | existing codebase + shell token system |
| Preset | none |
| Component library | existing custom components |
| Icon library | lucide-react or existing minimal icon set |
| Theme base | shell tokens introduced in Phase 8 |

---

## Layout Contract

| Region | Behavior |
|--------|----------|
| Top shell | stays stable; header remains the workspace anchor |
| Left rail | persistent, tabbed, defaulting to `Raw Evidence` |
| Center graph | remains the hero surface and widest region |
| Right panel | persistent shell region; quiet when idle, populated on selection/result |
| Timeline | visible as a first-class bottom band but collapsed by default |
| Command surface | remains persistent below the graph/timeline frame |

### Approximate Width Guidance

| Region | Guidance |
|--------|----------|
| Left rail | ~300-340px |
| Right panel | ~340-400px |
| Minimap | small fixed inset, visually quiet |

---

## Interaction Contract

| Element | Contract |
|---------|----------|
| Left rail tabs | `Raw Evidence` default; `Filters & Layers` secondary |
| Filters panel | grouped by entity types, connection layers, and time range |
| Right analysis panel | visible even in idle state; no major layout jump on selection |
| Timeline | collapsed by default with visible handle/affordance |
| Minimap | bottom-right in graph area; always visible; quiet visual treatment |

---

## Copywriting Contract

| Element | Copy Direction |
|---------|----------------|
| Right panel idle state | calm investigative summary, not empty technical placeholder |
| Left rail tabs | explicit and literal labels |
| Timeline handle | clear action wording or iconography indicating expand/collapse |
| Filters group labels | operational and specific, not generic |

---

## Color and Emphasis

| Element | Direction |
|---------|-----------|
| Active tab | shell accent purple |
| Idle panels | shell-surface / shell-surface-raised hierarchy |
| Minimap | low-noise shell treatment; should not compete with graph semantics |
| Right panel selected/result state | shell-aligned emphasis, not legacy cyan overlay styling |

---

## Checker Sign-Off

- [ ] Layout bands clear and stable
- [ ] Left rail tabs and grouped filters match the phase scope
- [ ] Right panel idle/active states preserve graph visibility
- [ ] Timeline collapsed state still reads as first-class
- [ ] Minimap placement matches reference direction

**Approval:** pending
