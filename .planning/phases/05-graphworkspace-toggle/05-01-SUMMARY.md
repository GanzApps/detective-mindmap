# 05-01 Summary

- Added `src/components/graph/GraphWorkspace.tsx` as the shared graph-area owner for the case workspace.
- Moved renderer composition out of `CaseWorkspaceShell` so the shell delegates graph-area concerns to `GraphWorkspace`.
- Mounted both `ForceGraph2D` and `MindMap3D` together and switched visibility with CSS `display` instead of conditional unmounting.
