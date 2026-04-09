# Phase 6: Controls + Filters + Timeline + Persistence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 06-controls-filters-timeline-persistence
**Areas discussed:** Filter behavior, Layers behavior, Timeline bar, Persistence scope

---

## Filter behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Hide non-matching nodes | Remove filtered-out nodes from view entirely | |
| Dim non-matching nodes | Keep context visible while emphasizing matches | ✓ |
| Hide in 2D, dim in 3D | Split behavior by renderer | |

**User's choice:** Dim non-matching nodes.
**Notes:** Preserving investigation context matters more than hard pruning the graph.

---

## Layers behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Edge labels and node labels | Minimal first-pass layer controls | |
| Edge labels, node labels, and evidence highlights | Add visibility control for evidence highlight overlays | |
| Edge labels, node labels, and focus selected neighborhood | Add a focus-mode style control tied to current selection | ✓ |

**User's choice:** Edge labels, node labels, and a focus-selected-neighborhood toggle.
**Notes:** The first Layers panel should lean toward investigation focus rather than adding more visibility toggles.

---

## Timeline bar

| Option | Description | Selected |
|--------|-------------|----------|
| Mostly visual status bar with current case timeline label and placeholder scrubber | Footer-first, light interaction | ✓ |
| Read-only timeline with visible events/markers | More explicit event representation from existing data | |
| Minimal footer bar now | Save richer timeline treatment for later | |

**User's choice:** Mostly visual status bar with a current case timeline label and placeholder scrubber.
**Notes:** The footer should establish the investigation-board feel without over-expanding timeline scope in this phase.

---

## Persistence scope

| Option | Description | Selected |
|--------|-------------|----------|
| Persist everything practical | Restore cases, mutations, selection, filters, view mode, and layers | ✓ |
| Persist data and preferences, but not current selection | Slightly narrower restoration | |
| Persist only case data and graph mutations | Keep UI state ephemeral | |

**User's choice:** Persist everything practical.
**Notes:** Reload should preserve investigation context, not just raw graph data.

---

## the agent's Discretion

- Exact layout/composition of the controls and footer can be decided during planning so long as it stays desktop-first and visually aligned with the dark investigation-board shell.

## Deferred Ideas

- Richer event-driven timeline behavior is deferred.
- Evidence highlight visibility toggles are deferred from the first Layers panel.
