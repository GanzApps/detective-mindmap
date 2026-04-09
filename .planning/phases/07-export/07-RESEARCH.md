# Phase 7: Export - Research

**Date:** 2026-04-09
**Status:** Complete

## Goal

Research how to implement current-view graph export for both renderers, with a detailed PDF path and a compact menu-based export UX.

## Findings

### 1. Active renderer export should flow through `GraphWorkspace`

- `src/components/graph/GraphWorkspace.tsx` already knows which renderer is active and keeps both canvases mounted.
- This makes it the cleanest place to expose renderer-specific export handles upward.
- A small imperative contract is likely better than trying to infer the active canvas from the shell.

### 2. Current renderers do not yet expose export-friendly handles

- `src/components/graph/ForceGraph2D.tsx` owns its `canvasRef`, zoom state, simulation state, and draw scheduling internally.
- `src/components/graph/MindMap3D.tsx` likewise owns its canvas and render loop internally.
- Neither renderer currently exports a `canvas`, `redraw`, or `snapshot` API, so Phase 7 should add explicit export handles rather than reaching into internals indirectly.

### 3. Direct PNG export is straightforward for the current-view requirement

- Because the user chose current-view export only, direct canvas export is the primary path for PNG.
- `canvas.toDataURL('image/png')` or a blob-based download path should preserve exactly what the active renderer is showing.
- For correctness, each renderer should provide a way to force a fresh draw before capture so the exported frame is current.

### 4. PDF should be utility-driven, not component-driven

- The PDF path needs structured case metadata, entity/connection summaries, and current evidence/highlight context from store-backed state.
- This points to a dedicated export utility module under `src/lib/export/` rather than embedding generation logic in UI components.
- UI components should orchestrate export intent; utility code should build the actual PNG/PDF outputs.

### 5. Menu UX fits the current shell without over-expanding scope

- `src/components/layout/CaseHeader.tsx` already has a single `Export Report` button and an adjacent action cluster.
- Replacing or evolving that single entry point into a small menu aligns with the Phase 7 context without adding a large modal workflow.

### 6. html2canvas should be treated as a complementary path, not the default graph snapshot source

- The current workspace mixes DOM and Canvas, but the user explicitly chose current-view graph export only.
- That means html2canvas is most useful as a researched/validated support path for PDF composition or fallback handling, not as the primary way to capture the graph image.
- The roadmap concern about mixed Canvas + DOM capture remains valid, so a spike/validation step is still warranted.

## Recommended Plan Shape

1. Add renderer export handles and validate capture behavior.
2. Add export utility modules plus dependencies for PNG/PDF generation.
3. Wire the header export button to a small menu and active renderer orchestration.
4. Add tests and full verification.

## Risks

- Exporting during an in-flight animation frame may produce stale or partially updated output unless redraw is forced first.
- 3D export needs to preserve the active camera view exactly; resetting camera state before capture would violate the current-view decision.
- PDF content can sprawl quickly if entity and connection listings are not intentionally formatted.

## Implementation Guidance

- Prefer `useImperativeHandle` or a small exported ref contract from both renderers.
- Keep export formatting logic under `src/lib/export/`.
- Use the shared store as the source of case, selection, highlight, and active view metadata for the PDF path.
