# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start Next.js dev server
pnpm build        # production build
pnpm lint         # ESLint via next lint
pnpm test         # run all Jest tests
pnpm test -- --testPathPattern=src/lib/graph   # run tests in a specific dir
pnpm test -- src/lib/graph/__tests__/graphTypes.test.ts  # single test file
```

## Architecture

**Domain:** Detective-style case investigation workspace. Cases contain entities (nodes) and connections (edges) forming a relationship graph, with evidence files attached.

**Stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS · Zustand · D3 · Jest/ts-jest

### Data model (`src/lib/data/dataTypes.ts`, `src/lib/graph/graphTypes.ts`)
- `Case` → `{ graph: GraphData, evidence: EvidenceCategory[] }`
- `GraphData` → `{ nodes: GraphNode[], edges: GraphEdge[] }`
- `GraphNode` has `type: EntityType` (person/location/event/evidence/organization/vehicle/digital), `status`, `tier`, and `parent` for hierarchical layout
- All types are Zod-derived — extend schemas there, not just the TypeScript types

### State (`src/store/caseStore.ts`)
Single Zustand store persisted to `localStorage`. Supports multi-tab case viewing: `openTabs`, `activeTabCaseId`, and `perTabState` (per-tab workspace state). Most mutation actions (setSelectedNode, setActiveFilters, etc.) write to both the active tab's `perTabState` and the top-level global fields for backwards compat. Use the `selectActive*` selectors when reading state in components.

### Graph rendering
Two canvas-based renderers, both togglable via `viewMode: '2d' | '3d'`:
- **2D:** `ForceGraph2D.tsx` — D3 force simulation via `src/lib/graph/forceSimulation.ts`
- **3D:** `MindMap3D.tsx` — custom canvas renderer via `src/lib/graph/renderer3d.ts` + `projection3d.ts`

Both renderers share node positions via `SharedNodePosition` so switching view modes keeps layout stable. Both expose a `ref` handle (`ForceGraph2DExportHandle`, `MindMap3DExportHandle`) for export and capture. Graph logic in `src/lib/graph/` is UI-free and independently testable.

### Layout (`src/components/layout/`)
`CaseWorkspaceShell` is the top-level layout for a case workspace. It owns:
- Collapsible sidebar (evidence + entity/connection lists)
- Center column: `GraphWorkspace` → `TimelineBar` → `AICommandBar`
- Collapsible right analysis panel

`CaseWorkspacePage` (`src/components/pages/`) wires store state into `CaseWorkspaceShell`. App routes live in `src/app/` using Next.js App Router conventions (`cases/[caseId]/page.tsx`).

### AI Command Bar (`src/lib/ai/knownIntents.ts`)
Pattern-matched "known intents" — no external AI calls. `executeKnownIntent()` parses a command string against a fixed set of `KnownIntentId`s and returns an `AIResultPayload` with highlighted node IDs and findings. Extend by adding cases inside `knownIntents.ts`.

### Design tokens
All UI colors, spacing, and radius values reference CSS variables via `var(--shell-*)`. These are defined in `src/app/globals.css` and mapped to Tailwind utility classes in `tailwind.config.ts`. Graph entity colors (`ENTITY_TYPE_COLOR`) are JS constants in `graphTypes.ts` — not shell tokens.

### Export (`src/lib/export/`)
`reportExporter.ts` exports the active graph canvas as PNG or PDF (via jsPDF + html2canvas). Uses the `GraphWorkspaceExportHandle` ref from `GraphWorkspace`.

## Planning artifacts

Before changing product behavior, read:
- `.planning/PROJECT.md` — product definition
- `.planning/STATE.md` — current execution state
- `.planning/ROADMAP.md` — phase roadmap

Update these after scope-changing work.
