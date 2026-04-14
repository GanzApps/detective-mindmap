# Phase 12 Plan: AI Command Routing + Workspace Polish

## Goal

Turn the bottom command surface into a polished, known-intent investigation orchestrator that accepts natural and slash-style input, routes results into the right analysis panel, and finishes the remaining shell cohesion work.

## Execution Shape

Phase 12 will execute in three waves:

1. `12-01` command surface behavior and intent parsing foundation
2. `12-02` AI result routing and right-panel mode integration
3. `12-03` command-surface polish, lightweight history, and validation

## Locked Decisions

- support both natural-language prompts and slash-style commands through one known-intent parser
- route AI results into a separate `AI result` mode inside the existing right-side panel
- use a mix of static and context-aware quick command chips
- show execution feedback inline in the command bar, with lightweight recent-command history

## Scope

### In Scope

- polished command input shell
- known-intent parsing and routing
- slash command discoverability without requiring slash syntax
- static plus contextual quick command chips
- right-panel AI result mode
- inline execution state and lightweight recent command history
- final command-surface visual integration with the workspace shell

### Out of Scope

- freeform AI reasoning
- remote/backend LLM orchestration
- brand-new graph interaction features outside command routing
- collaboration or persistence architecture changes

## Dependencies

- Phase 11 interaction parity must remain stable
- right analysis panel from Phase 9 must stay the canonical detail surface
- graph focus and selection behavior from Phases 10-11 must not regress

## Validation Target

Phase 12 is only done when:

- the command bar accepts natural and slash-style input into the same known-intent flow
- commands trigger the correct workspace/graph actions
- AI results can cleanly replace node detail in a separate right-panel mode
- quick chips feel useful in idle and contextual states
- command feedback is readable without obscuring the graph
