# 06-01 Summary

- Extended `src/store/caseStore.ts` with shared entity filter state and layer preferences for edge labels, node labels, and selection-neighborhood focus.
- Added a compact `FilterPanel` inside `src/components/graph/GraphWorkspace.tsx` so graph-specific controls live with the shared workspace instead of inside individual renderers.
- Kept `src/components/layout/CaseWorkspaceShell.tsx` focused on composition by passing a grouped `GraphWorkspace` prop contract rather than owning graph control state directly.
