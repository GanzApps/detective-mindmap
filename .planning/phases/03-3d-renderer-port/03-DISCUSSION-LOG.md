# Phase 3: 3D Renderer Port - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 03-3d-renderer-port
**Areas discussed:** Visual fidelity, detail surface, controls and labels, interaction priority

---

## Visual Fidelity

| Option | Description | Selected |
|--------|-------------|----------|
| Match closely now | Match `3d_mindmap_fixed.html` as closely as practical in Phase 3 | ✓ |
| Interaction exact, visuals simplified | Preserve interactions but allow more visual simplification | |
| Functional first | Prioritize a plain functional port and polish later | |

**User's choice:** Match the reference as closely as practical now.
**Notes:** The reference is the baseline, not a loose inspiration.

---

## Detail Surface

| Option | Description | Selected |
|--------|-------------|----------|
| Panel only | Only show the right-side detail panel from the reference | |
| Panel plus stronger in-canvas emphasis | Show the panel and make selected neighborhoods pop more strongly in the canvas | ✓ |
| Minimal panel | Keep the panel minimal and focus mainly on canvas behavior for now | |

**User's choice:** Panel plus stronger in-canvas emphasis.
**Notes:** Selection behavior should read clearly both in the scene and in the panel.

---

## Controls and Labels

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve labels broadly | Keep labels broadly visible like the reference | ✓ |
| Fewer labels by default | Reduce label density to keep the scene cleaner | |
| Very restrained labels | Keep labels minimal now and expand later | |

**User's choice:** Preserve labels broadly.
**Notes:** Readability from the original renderer should remain intact in the first pass.

---

## Interaction Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Visual fidelity | Favor matching the exact look if tradeoffs appear | |
| Smooth interaction and stability | Favor drag/zoom/hover quality and runtime stability | ✓ |
| Code extraction and testability | Favor abstraction cleanliness if tradeoffs appear | |

**User's choice:** Smooth interaction and stability.
**Notes:** Clean extraction still matters, but not at the cost of interaction quality.

---

## the agent's Discretion

None.

## Deferred Ideas

None.
