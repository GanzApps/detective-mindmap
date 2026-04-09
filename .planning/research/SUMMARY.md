# Project Research Summary

**Project:** Detective Case Investigation Platform
**Domain:** Interactive link-analysis / investigation board (web-based)
**Researched:** 2026-04-09
**Confidence:** HIGH (architecture, pitfalls) / MEDIUM (stack versions, features)

---

## Executive Summary

This is a web-based investigation board in the tradition of Maltego and i2 Analyst's Notebook — but lightweight, desktop-browser-native, and differentiated by a 2D/3D view toggle that no competitor offers in a clean web package. The recommended architecture is a Next.js App Router shell with a client-only v1: D3.js force simulation for 2D graph rendering, a TypeScript port of the existing `3d_mindmap_fixed.html` Canvas renderer for 3D, Zustand for global state, and Zod-validated typed interfaces that deliberately decouple the UI from the data source.

The highest-confidence recommendation: **build the pure-function graph library first (`lib/graph/`) before writing any React components.** All critical math — 3D projection, hit testing, force simulation setup, connected-node traversal — lives in this zero-dependency layer, is tested with plain Jest, and forms the stable foundation both renderers depend on.

The dominant risk is D3/Canvas vs. React DOM ownership conflicts. Ten specific pitfalls have been identified with concrete prevention patterns; the most dangerous involve SSR crashes, animation loop leaks, and the 2D/3D toggle destroying computed node positions. Every one is preventable from day one.

---

## Key Findings

### Recommended Stack

| Technology | Version | Role | Confidence |
|-----------|---------|------|------------|
| Next.js | 15 (App Router) | Framework shell, routing | MEDIUM — verify at npmjs |
| React | 19 | UI runtime | MEDIUM — verify at npmjs |
| TypeScript | 5 | Type safety | HIGH |
| D3.js | 7 (sub-modules) | 2D force simulation + Canvas draw | HIGH |
| Custom Canvas 3D | (port from HTML) | 3D mindmap renderer | HIGH |
| Zustand | 5 | Global state | HIGH |
| Zod | 3 | Schema-first typed data layer | HIGH |
| Tailwind CSS | 4 | Dark-theme utility styling | MEDIUM — verify v4 GA + Next.js PostCSS |
| html2canvas + jsPDF | 1.4 / 2 | Client-side PDF export | MEDIUM — spike needed |
| Jest + RTL | 29 / 14 | Testing | HIGH |

**What NOT to use:** `react-force-graph`, `three.js`/`react-three-fiber`, Redux Toolkit, `vis.js`, `sigma.js`, full `d3` barrel import

---

### Architecture Approach

Three-layer architecture:

```
lib/graph/          ← pure functions, zero React, Jest-testable
  graphTypes.ts     ← shared types (GraphNode, GraphEdge, Case)
  projection3d.ts   ← 3D projection math
  hitTest.ts        ← click detection
  forceSimulation.ts← D3 force setup helpers

hooks/              ← state bridges
  useCaseData.ts    ← data fetching from repository
  useGraphState.ts  ← selection, filters, viewMode
  useViewMode.ts    ← 2D/3D toggle

components/
  GraphWorkspace    ← owns view-mode toggle; mounts BOTH renderers
  ForceGraph2D      ← D3 simulation in useRef; Canvas draw
  MindMap3D         ← Canvas 3D animation; ported from HTML
  NodeDetailPanel   ← slide-in panel on node select
  EvidenceSidebar   ← file tree, no graph coupling
  CaseHeader        ← name, status, export, actions
  GraphToolbar      ← stats, zoom controls
  FilterPanel       ← show/hide by entity type
  TimelineBar       ← read-only event markers
  AICommandBar      ← placeholder input in v1

lib/data/
  caseRepository.ts ← interface (mock impl v1, API impl v2)
  mockCases.ts      ← hardcoded sample cases
```

**Critical invariant:** Both renderers must be hidden with CSS `display:none` on toggle — never unmounted. Unmounting destroys D3's in-place node position mutations.

---

### Expected Features

**Table stakes (must have in v1):**
- Typed entity nodes (person, location, event, evidence, organization)
- Labeled directional edges
- Node click → detail panel
- Pan, zoom, zoom-to-fit
- Evidence file sidebar with category tree
- Case metadata header
- Entity/connection count display
- Timeline bar (read-only)
- Filters and Layers panel
- **2D/3D view toggle** — the differentiator; must be v1
- PNG snapshot + PDF report export
- Save/restore to localStorage

**Defer to v2:**
- Undo / redo (critical for trust but complex; scope carefully)
- Path finding between nodes (BFS)
- Timeline ↔ graph sync
- Evidence file preview
- Layout algorithm selector
- Annotation / notes on nodes and edges

**Explicitly out of scope:**
- Real-time collaboration, authentication, AI-generated connections, geospatial map, mobile layout, plugin marketplace

---

### Critical Pitfalls

| # | Pitfall | Prevention | When to Apply |
|---|---------|-----------|---------------|
| 1 | D3 + React DOM conflict | Ref escape hatch: React renders `<canvas ref>`, D3 owns everything inside via `useEffect` | Phase 4, before any D3 code |
| 2 | SSR crash (`document`/`window`/Canvas) | `'use client'` + `dynamic({ ssr: false })` on all graph components | Phase 2, first graph placeholder |
| 3 | DPR blur / event coordinate mismatch | `ResizeObserver` + `ctx.setTransform(dpr,0,0,dpr,0,0)`; CSS-pixel hit testing | Phase 3, canvas init |
| 4 | rAF memory leak / zombie frames | `cancelAnimationFrame` in `useEffect` cleanup; `running` boolean guard for StrictMode | Phase 3, animate() port |
| 5 | Simulation restart on every render | `useMemo` on graph data; simulation `useEffect` deps = data only, not UI state | Phase 4, first tick |
| 6 | Toggle destroys node positions | CSS `display:none`, not unmount; both renderers always mounted | Phase 5, design before either renderer |
| 7 | `globalAlpha` leak (already in reference file) | `ctx.save()/ctx.restore()` around every node draw | Phase 3, port |

---

## Suggested Phase Order

| Phase | Name | Goal | Research Needed |
|-------|------|------|----------------|
| 1 | Foundation | Shared types, Zod schemas, mock repository | No — standard patterns |
| 2 | App Shell | Layout, routing, case header, sidebar, Zustand | No — standard patterns |
| 3 | 3D Renderer Port | Port `3d_mindmap_fixed.html` to TypeScript; pure functions first | No — source is in-project |
| 4 | 2D Force Graph | D3 simulation, Canvas draw, pan/zoom, drag | Yes — D3 Canvas drag edge cases |
| 5 | GraphWorkspace + Toggle | Connect renderers, CSS toggle, NodeDetailPanel | No — pitfalls documented |
| 6 | Controls + Filters + Timeline | FilterPanel, TimelineBar, AICommandBar placeholder | No — standard patterns |
| 7 | Export | PNG snapshot, PDF report | Spike needed — html2canvas mixed-layout |

---

## Confidence Gaps to Address

1. **Tailwind v4 + Next.js 15 PostCSS:** Verify compatibility before project init. Fallback to Tailwind 3.4.x is trivial.
2. **html2canvas mixed Canvas+DOM:** MEDIUM confidence. Spike with realistic graph snapshot before committing to this export path.
3. **Version numbers:** All versions reflect August 2025 training cutoff. Verify at npmjs.com before locking `package.json`.
4. **Scale:** Architecture validated for 20–100 nodes. Real case data in v2 may require Canvas 2D rendering and/or Web Worker simulation.

---

*Research completed: 2026-04-09 | Ready for roadmap: yes*
