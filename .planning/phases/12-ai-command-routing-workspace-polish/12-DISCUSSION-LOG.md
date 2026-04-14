# Phase 12 Discussion Log

Date: `2026-04-14`
Phase: `12-ai-command-routing-workspace-polish`

## Decisions

1. Command input behavior
- Choice: `both`
- Decision: support natural-language input and slash-style commands through one known-intent parser

2. Right-panel AI results
- Choice: `separate mode`
- Decision: AI output uses a separate `AI result` mode in the existing right-side panel instead of stacking with node detail

3. Quick command chips
- Choice: `mixed`
- Decision: keep a baseline set of static chips and add context-aware chips when case/selection state allows

4. Command execution feedback
- Choice: `inline status + lightweight history`
- Decision: command execution state should live in the command surface rather than relying on transient toasts

## Summary

Phase 12 is locked around a known-intent orchestration model that feels polished but controlled. The command surface should accept both natural and command-style input, route results into a dedicated AI panel mode, surface useful quick actions in both idle and contextual states, and communicate execution status directly inside the workspace.

## Next Step

- `/gsd-plan-phase 12`
