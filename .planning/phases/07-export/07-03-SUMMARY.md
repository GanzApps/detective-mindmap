# Phase 7 Wave 3 Summary

## Outcome

Connected the export utilities to the workspace header through a compact menu-based flow.

## Delivered

- Replaced the static export button with one menu offering PNG, PDF, or both
- Threaded export callbacks through `CaseHeader`, `CaseWorkspaceShell`, and `CaseWorkspacePage`
- Added page-level orchestration that combines current case/store context with the active renderer export handle

## Verification

- `pnpm exec tsc --noEmit`
- `npx jest src/components/layout/__tests__/CaseHeader.test.tsx src/components/pages/__tests__/CaseWorkspacePage.test.tsx --runInBand`
