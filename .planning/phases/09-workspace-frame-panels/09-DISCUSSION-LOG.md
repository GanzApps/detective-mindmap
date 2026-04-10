# Phase 9: Workspace Frame + Panels - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `09-CONTEXT.md`.

**Date:** 2026-04-10
**Phase:** 09-workspace-frame-panels
**Areas discussed:** Left rail default state, Minimap behavior, Right analysis panel idle behavior, Timeline behavior

---

## Left Rail Default State

| Option | Description | Selected |
|--------|-------------|----------|
| Raw Evidence | Best case-opening context; filters remain secondary controls | ✓ |
| Filters & Layers | Open directly into graph control mode | |

**User's choice:** `Raw Evidence`
**Notes:** User approved the recommendation with `y`.

---

## Minimap Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom-right, always visible | Matches reference and preserves orientation at all times | ✓ |
| Bottom-right, hover only | Lower visual weight but weaker orientation anchor | |

**User's choice:** Bottom-right inside the graph area, always visible
**Notes:** User approved the recommendation with `y`.

---

## Right Analysis Panel Idle Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Quiet default state | Panel stays visible and preserves workspace structure | ✓ |
| Collapsed | More graph space but unstable width and weaker shell structure | |
| Empty-only shell | Minimal placeholder with no meaningful default state | |

**User's choice:** Visible, calm default state
**Notes:** User approved this together with the timeline choice.

---

## Timeline Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsed by default with handle | Preserves graph space while keeping timeline first-class | ✓ |
| Always expanded | Maximum chronology visibility but more crowding | |

**User's choice:** Collapsed by default, with visible handle
**Notes:** User approved this together with the right panel choice.

---

## the agent's Discretion

- Exact minimap treatment and opacity
- Exact timeline handle treatment and motion
- Exact quiet-state content for the right analysis panel

## Deferred Ideas

- Search-focus flow, node semantics, and AI routing intentionally deferred to later phases already defined in the roadmap
