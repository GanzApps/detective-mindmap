# Phase 10 Research

## Objective

Research how to deliver the reference-aligned graph visual language and search-focus behavior without destabilizing the Phase 9 workspace shell or prematurely taking on Phase 11 interaction-parity work.

## Key Findings

1. The search seam already exists in the current 2D renderer flow. `GraphWorkspace.tsx` owns `searchQuery`, passes it into `ForceGraph2D.tsx`, and `forceSimulation.ts` already exposes `getSearchMatches()` and `getBestSearchMatch()`. Phase 10 should evolve this into an explicit dropdown-selection flow rather than replacing the whole search stack.
2. The current 2D renderer still applies focus implicitly from a raw string search via `searchMatchIds`. That means search focus and search typing are still coupled. Phase 10 should split them into two states:
   - suggestion query state
   - committed focus target state
3. The current 2D graph data model already supports semantic styling at the node level. `ForceGraphNodeDatum` carries `color`, `glyph`, and `radius`, so iconic shapes can be introduced by extending draw logic rather than redesigning the graph data structures.
4. The current 2D color system is still partially legacy/placeholder. `forceSimulation.ts` drives `ENTITY_TYPE_COLOR` plus single-letter glyphs, but that is not yet enough to meet the approved shape language. Phase 10 should turn node rendering into a real semantic symbol system rather than just tint + letter.
5. Dimmed network focus is already conceptually supported in both 2D and 3D via `focusSelectedNeighborhood`, but the current treatment is implementation-led rather than UX-led. Phase 10 should refine dimming thresholds and label behavior so the focus state feels intentional instead of simply filtered.
6. `renderer3d.ts` is still tier-palette driven, not entity-semantics driven. Phase 10 can safely establish the semantic token/shape contract in shared graph utilities first, but full 3D parity should remain partial and pragmatic until Phase 11.
7. The minimap introduced in Phase 9 now depends on renderer-emitted node colors and dimming state. Any semantic color changes in Phase 10 should therefore update minimap output as part of the same system, not as a separate patch.
8. The existing tests cover shell structure and some renderer continuity, but there is little dedicated coverage yet for:
   - search suggestion vs. committed focus state
   - label density/readability rules
   - semantic node styling hooks
   - dimming behavior for unrelated network elements

## Planning Implications

- Keep `GraphWorkspace.tsx` as the orchestration seam for search query state and committed search selection state.
- Refactor `ForceGraph2D.tsx` to support:
  - suggestion list rendering
  - explicit selection commit
  - richer semantic node drawing
- Extend `forceSimulation.ts` with shared semantic helpers for:
  - entity shape metadata
  - semantic color mapping
  - label/edge-emphasis helpers
- Update `renderer3d.ts` only to the degree needed to keep colors and dimming semantically aligned; full 3D interaction parity still belongs to Phase 11.
- Add focused graph tests rather than overloading shell tests with graph-specific assertions.

## Reusable Codebase Assets

- `src/components/graph/GraphWorkspace.tsx` - current search orchestration seam and renderer continuity shell
- `src/components/graph/ForceGraph2D.tsx` - main implementation target for typeahead, focus, and semantic 2D drawing
- `src/lib/graph/forceSimulation.ts` - shared search helpers and 2D drawing primitives
- `src/components/graph/MindMap3D.tsx` - current 3D renderer wrapper that can adopt semantic color output incrementally
- `src/lib/graph/renderer3d.ts` - current 3D drawing pipeline
- `src/components/graph/GraphMinimap.tsx` - should inherit semantic color and dimming changes automatically

## Validation Architecture

- Fast loop:
  - `pnpm exec tsc --noEmit`
  - targeted graph tests for search flow and renderer semantics
- Full loop:
  - `pnpm test -- --runInBand`
  - `pnpm build`
- Manual checks should confirm:
  - search does not immediately refocus while typing
  - selecting a result commits focus cleanly
  - default graph remains readable
  - semantic shapes/colors are recognizable at a glance

## Risks

- If Phase 10 overreaches into drag persistence or full 3D parity, it will blur into Phase 11 and create avoidable rework.
- If search UI and committed focus state are not separated clearly, the graph may feel jumpy and difficult to scan.
- If iconic shapes are implemented only as decorative labels instead of primary node silhouettes, the semantic benefit will be weak.
- If edge labels are not aggressively curated, the information-rich default state may become noisy again.

---
*Phase: 10-graph-visual-language-search-focus*
*Research completed: 2026-04-13*
