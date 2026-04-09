# Phase 5: GraphWorkspace + Toggle - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 05-graphworkspace-toggle
**Areas discussed:** Node detail panel, Toggle behavior, Panel placement, Implementation priority

---

## Node Detail Panel

| Option | Description | Selected |
|--------|-------------|----------|
| Compact inspector | Mostly factual inspector surface | |
| Medium detail panel | Properties and connection summary | |
| Richer case-analysis panel | More visual hierarchy and stronger workspace feel | yes |

**User's choice:** Richer case-analysis panel
**Notes:** The shared detail surface should feel like part of the investigation workflow rather than a thin factual readout.

---

## Toggle Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Keep selection and panel exactly as-is | Preserve both state and panel presentation | |
| Keep selection, panel may reframe slightly | Shared selection with renderer-aware framing | |
| Keep selection highlighted, panel stays more minimal | Preserve highlight continuity while keeping the panel restrained | yes |

**User's choice:** Keep selection highlighted, panel stays more minimal
**Notes:** Highlight continuity matters more than forcing a heavy identical panel state through every renderer transition.

---

## Panel Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Right-side slide-in panel | Docked slide-in surface | |
| Fixed right column | Persistent integrated workspace column | |
| Floating inspector card | Floating panel near the graph area | yes |

**User's choice:** Floating inspector card
**Notes:** The detail surface should feel attached to the graph workspace rather than consume a permanent side column.

---

## Implementation Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Seamless toggle continuity | State continuity above all else | |
| Cleaner panel UX and readability | Better panel design and readability first | yes |
| Simpler architecture and tests | Simpler implementation and test surface first | |

**User's choice:** Cleaner panel UX and readability
**Notes:** The panel should feel intentionally designed even if that means some extra coordination work in the toggle layer.

---

## the agent's Discretion

None.

## Deferred Ideas

None.
