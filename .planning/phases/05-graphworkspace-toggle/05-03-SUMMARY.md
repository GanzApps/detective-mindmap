# 05-03 Summary

- Added `src/components/graph/NodeDetailPanel.tsx` as the shared floating investigation card for node analysis.
- Surfaced label, type, tier, connection counts, relationship summaries, and raw properties with stronger visual hierarchy than the old renderer-local panels.
- Wired dismissal through the shared workspace path so deselect and explicit close actions collapse the panel consistently.
