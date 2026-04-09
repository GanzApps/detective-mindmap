# Phase 2: App Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 02-app-shell
**Areas discussed:** Landing and routing flow, Case list behavior, Workspace shell layout, CRUD interaction style

---

## Landing and Routing Flow

| Option | Description | Selected |
|--------|-------------|----------|
| `/` redirects straight to `/cases` | Immediate entry into the application shell | ✓ |
| Minimal landing page first | Intro page with CTA into `/cases` | |

**User's choice:** `/` redirects straight to `/cases`
**Notes:** The case list is the intended primary entry point for v1.

---

## Case List Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Compact table | Dense, admin-like list | |
| Card list | Card-based browse view | |
| Simple dashboard-style list | More hierarchy than a table without becoming a full dashboard | ✓ |

**User's choice:** Simple dashboard-style list
**Notes:** The list should feel like part of the product experience, not a raw admin screen.

---

## Workspace Shell Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Close to the reference now | Match the dark investigation board immediately | |
| Functional first, lighter shell now, polish later | Build structure first and defer fidelity | ✓ |
| Dark shell now, but still simplified | Preserve more of the visual tone now | |

**User's choice:** Functional first, polish later
**Notes:** Structural correctness matters more than high-fidelity styling in Phase 2.

---

## CRUD Interaction Style

| Option | Description | Selected |
|--------|-------------|----------|
| Inline controls in the workspace | Immediate in-place editing controls | |
| Modal/dialog driven | Explicit flows for create/delete actions | ✓ |
| Side panel or form area | Persistent controls docked beside content | |

**User's choice:** Modal/dialog driven
**Notes:** Clear, contained flows are preferred for the first implementation.

---

## the agent's Discretion

- Exact component composition within the shell
- How much visual styling is needed to make the shell feel coherent while still staying functional-first

## Deferred Ideas

- Closer visual matching to the dark investigation-board reference
- Inline editing/power-user workflows after the shell foundation is stable

