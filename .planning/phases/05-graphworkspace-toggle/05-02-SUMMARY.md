# 05-02 Summary

- Unified renderer selection flow so both graph components consume the same `selectedNodeId` and `onSelectNode` contract through `GraphWorkspace`.
- Removed the renderer-local node detail cards from `ForceGraph2D` and `MindMap3D` so the shared workspace is the only detail-surface owner.
- Added active-surface redraw hooks so the mounted-but-hidden renderer can resume cleanly without losing its internal state when toggled back into view.
