# Phase 12 Validation

## Required Checks

### Command Input

- Natural-language input routes into a known-intent action.
- Slash-style input routes into the same intent/action layer.
- Unsupported prompts fail clearly without breaking the workspace.

### Quick Commands

- Baseline chips are always visible.
- Context-aware chips appear when selection or case state makes them relevant.
- Clicking a chip triggers the same result path as typed input.

### Right-Panel Routing

- AI-triggered results appear in a distinct `AI result` mode in the existing right panel.
- Returning to node detail is clear and stable.
- Node detail and AI result do not render as confusing mixed content.

### Feedback / History

- The command bar shows inline execution status.
- Recent command history is visible but lightweight.
- Feedback does not rely on transient toast behavior alone.

### Regression Safety

- `pnpm exec tsc --noEmit`
- `pnpm test -- --runInBand`
- `pnpm build`

## UAT Pass Condition

Phase 12 is verified only when the command surface feels integrated, known intents trigger the right behavior reliably, and the right panel communicates AI results clearly without harming the workspace flow.
