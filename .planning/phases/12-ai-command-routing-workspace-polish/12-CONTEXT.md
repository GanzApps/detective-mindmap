# Phase 12 Context: AI Command Routing + Workspace Polish

## Phase Goal

Turn the bottom command surface into a usable investigation orchestrator and finish the remaining shell polish so the command bar, quick actions, right analysis panel, and workspace framing feel like one coherent product.

## Prior Decisions Carried Forward

- The workspace shell, left rail, right analysis panel, timeline dock, and minimap are already established from Phases 8-11.
- The graph interaction model is already defined: typeahead-first search, committed focus, dimmed unrelated nodes, and parity between `2D` and `3D`.
- The first AI implementation must use known intents only, not freeform agent reasoning.
- The right analysis panel is the canonical place for surfaced investigation detail; Phase 12 should reuse that surface rather than invent a second result container.

## Locked Phase 12 Decisions

### Command Input Behavior (AI-01, AI-02)

- **Decision:** support both natural-language prompts and slash-style commands, with one known-intent parser underneath.
- The input should feel natural-language friendly first, while still exposing command-style discoverability for users who prefer direct control.
- Slash commands are encouraged, not required.

### Right-Panel AI Result Routing (AI-03)

- **Decision:** use a separate `AI result` mode inside the existing right-side panel.
- Node detail and AI result are distinct panel modes instead of stacked mixed content.
- AI actions can temporarily take over the right panel, but they should do so cleanly and legibly.

### Quick Command Chips (AI-01)

- **Decision:** use a mix of static and context-aware chips.
- A stable baseline set of chips should always be visible so the surface feels purposeful.
- Additional chips should adapt to case context, current selection, or current focus state.

### Command Execution Feedback (SHELL-09, AI-02)

- **Decision:** show inline command status in the command bar, supported by lightweight recent-command history.
- Avoid toast-first feedback because command execution needs durable, readable status in an investigation workflow.
- The command surface should communicate `running`, `complete`, and `failed` states without obscuring the graph.

## Scope Boundaries

### In Scope

- command bar visual polish
- known-intent parsing and routing
- quick command chip design and behavior
- right-panel AI result mode
- inline execution feedback and lightweight command history
- final command-surface cohesion with the workspace shell

### Out of Scope

- freeform AI reasoning beyond known intents
- backend LLM orchestration beyond the mockable known-intent layer
- new graph renderer features unrelated to command routing
- collaboration or persistence infrastructure changes

## Reuse Targets

- `src/components/layout/AICommandBar.tsx`
- `src/components/layout/WorkspaceAnalysisPanel.tsx`
- `src/components/layout/CaseWorkspaceShell.tsx`
- `src/components/graph/GraphWorkspace.tsx`
- `src/store/caseStore.ts`

## Research Focus

Research and planning should answer:

1. How to implement a known-intent parser that accepts both natural language and slash-command entry without duplicating routing logic
2. How to structure right-panel mode switching between node detail and AI result without making the workspace feel unstable
3. How to design quick chips so they feel useful in both idle and selection-focused states
4. How to expose command execution state/history without adding noisy chrome
5. What final shell polish is still needed for the command surface to feel fully integrated

## Canonical References

### Milestone Source of Truth

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

### Prior Phase Context

- `.planning/phases/09-workspace-frame-panels/09-CONTEXT.md`
- `.planning/phases/10-graph-visual-language-search-focus/10-CONTEXT.md`
- `.planning/phases/11-2d-3d-interaction-parity/11-CONTEXT.md`

### Reference Notes

- `.planning/notes/investigation-workspace-revamp-model.md`
- `.planning/notes/ui-reference-mac-video-alignment.md`

### Reference Assets

- `.planning/references/mac-ui-reference/2026-04-09.mp4`
- `.planning/references/mac-ui-reference/graph-view-selected-filters.png`

---
Phase: `12-ai-command-routing-workspace-polish`  
Context gathered: `2026-04-14`
