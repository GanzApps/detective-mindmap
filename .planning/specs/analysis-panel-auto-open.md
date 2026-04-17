# Spec: Analysis Panel Auto-Open

## Objective

The right-side analysis panel currently requires a manual toolbar toggle to appear. Detectives should not have to find and click a button — the panel should open automatically when there is something meaningful to show (a selected node or an AI command result), and close automatically when there isn't.

**User story:** As a detective, when I click a node on the graph, the analysis panel slides in immediately with the node's details. When I dismiss the node or an AI result, the panel slides away. I never need to hunt for a button to see my selection.

**Success looks like:**
- Selecting a node → panel slides in from the right, showing node detail
- Executing an AI command → panel slides in, showing AI result
- Deselecting a node (Escape / click empty canvas) with no active AI result → panel slides out
- Dismissing AI result with no selected node → panel slides out
- Selecting a new node after manually closing via X → panel slides back in
- No manual analysis toggle button in the toolbar

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Zustand (store unchanged)

## Commands

```bash
pnpm dev
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

## Project Structure

Affected files only:
```
src/components/layout/
  CaseWorkspaceShell.tsx   — auto-open logic (useEffect), animated wrapper,
                             remove toolbar toggle, update X button handler
  WorkspaceAnalysisPanel.tsx — no changes expected

src/components/layout/__tests__/
  WorkspacePanels.test.tsx — update/extend tests for auto-open behavior
```

## Behavior Specification

### Auto-open trigger

In `CaseWorkspaceShell`, replace the manual `analysisOpen` toggle with a `useEffect` that drives it:

```typescript
useEffect(() => {
  if (selectedNodeId !== null || aiResult !== null) {
    setAnalysisOpen(true);
  } else {
    setAnalysisOpen(false);
  }
}, [selectedNodeId, aiResult]);
```

`analysisOpen` stays as `useState(false)` — its value is now driven by the effect, not by a button click.

### Auto-close trigger

The same effect handles close. When `selectedNodeId` and `aiResult` both clear, `setAnalysisOpen(false)` fires. The panel slides out.

### X button (panel header close)

The X button in the panel header must clear the cause, not just hide the panel. Replace `onClick={() => setAnalysisOpen(false)}` with a handler that calls both:
- `onSelectNode(null)` — deselects current node
- `onDismissAIResult()` — clears AI result

Both are idempotent. Clearing both guarantees the `useEffect` closes the panel cleanly.

### Toolbar toggle — removed

Delete the analysis panel toggle button (the chart/bar-chart icon button) from the toolbar completely. No replacement.

### Animation

Replace the conditional render `{analysisOpen && <div>...}` with a permanently-mounted outer wrapper that transitions `width`:

```tsx
{/* Analysis panel — always mounted, width animates open/closed */}
<div
  className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out
    ${analysisOpen ? 'w-80' : 'w-0'}`}
>
  <div className="flex h-full w-80 flex-col border-l border-shell-border bg-shell-surface">
    {/* header + content unchanged */}
  </div>
</div>
```

- Outer div: clips content via `overflow-hidden`, animates width 0 ↔ 320px
- Inner div: always `w-80` so content layout doesn't reflow during animation
- `transition-[width]` is a Tailwind JIT arbitrary transition; falls back gracefully
- `duration-300` = 300ms, `ease-in-out`

No JS animation library needed. Pure CSS transition.

## Code Style

Follow existing shell patterns:
- `useEffect` for side effects derived from props (pattern already used for `committedSearchNodeId` reset)
- All logic stays in `CaseWorkspaceShell` — `WorkspaceAnalysisPanel` is purely presentational
- No new state fields; `analysisOpen: boolean` stays, its source of truth changes

## Testing Strategy

Framework: Jest + React Testing Library (jsdom), same as existing layout tests.

Existing test file: `src/components/layout/__tests__/WorkspacePanels.test.tsx`

New test cases to add:
- Panel is hidden when `selectedNodeId=null` and `aiResult=null`
- Panel appears when `selectedNodeId` changes to a non-null value
- Panel appears when `aiResult` becomes non-null
- Panel disappears when both are cleared
- Panel header X button triggers `onSelectNode(null)` AND `onDismissAIResult`

Do NOT test CSS animation timing — that is a visual concern, not a behavioral one.

## Boundaries

- **Always:** `pnpm exec tsc --noEmit` + `pnpm test` + `pnpm build` before marking done
- **Ask first:** Any change to `WorkspaceAnalysisPanel` internals, any change to the `aiResult` data flow outside of `CaseWorkspaceShell`
- **Never:** Add an animation library dependency. Never add a separate "open" prop to `WorkspaceAnalysisPanel` — shell owns the open/close logic entirely.

## Success Criteria

- [ ] Selecting a node opens the analysis panel (no button click needed)
- [ ] Executing an AI command opens the analysis panel
- [ ] Deselecting a node (Escape / canvas click) with no AI result closes the panel
- [ ] Dismissing AI result with no selected node closes the panel
- [ ] After panel X closes (clears node + AI result), selecting a new node re-opens it
- [ ] No analysis toggle button exists in the toolbar
- [ ] Panel open/close is visually animated (width slide)
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm test` passes (all existing + new tests)
- [ ] `pnpm build` passes

## Open Questions

None — all requirements confirmed.

---
*Created: 2026-04-17 · Feature: analysis-panel-auto-open*
