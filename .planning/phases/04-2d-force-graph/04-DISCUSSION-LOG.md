# Phase 4: 2D Force Graph - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 04-2d-force-graph
**Areas discussed:** Visual fidelity, Edge and label density, Search behavior, Implementation priority

---

## Visual Fidelity

| Option | Description | Selected |
|--------|-------------|----------|
| Match closely now | Match the visual tone closely now | yes |
| Interaction first | Preserve the interaction model first, simplify visuals where needed | |
| Functional first | Functional graph first, polish later | |

**User's choice:** Match closely now
**Notes:** The first 2D graph should feel visually aligned with the investigation-board reference rather than landing as a raw engineering scaffold.

---

## Edge and Label Density

| Option | Description | Selected |
|--------|-------------|----------|
| Broad labels | Show edge labels broadly by default | |
| Selective labels | Show labels selectively so the canvas stays readable | yes |
| Minimal labels | Keep labels minimal now, expand later | |

**User's choice:** Selective labels
**Notes:** Readability wins over maximal relationship text density in the first 2D pass.

---

## Search Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Highlight only | Highlight matches only | |
| Highlight and dim | Highlight matches and gently dim non-matches | |
| Highlight and auto-center | Highlight matches and auto-center the best match | yes |

**User's choice:** Highlight and auto-center the best match
**Notes:** Search should help users navigate the graph, not just indicate matches.

---

## Implementation Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Visual fidelity | Favor visual fidelity if tradeoffs appear | |
| Smooth interaction and stability | Favor drag/pan/zoom behavior and runtime stability | yes |
| Cleaner architecture | Favor cleaner architecture and testability | |

**User's choice:** Smooth interaction and stability
**Notes:** Stability and interaction quality outrank stricter abstraction when the two conflict.

---

## the agent's Discretion

None.

## Deferred Ideas

None.
