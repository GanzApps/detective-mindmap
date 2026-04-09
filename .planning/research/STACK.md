# Technology Stack

**Project:** Detective Case Investigation Platform
**Researched:** 2026-04-09
**Confidence Note:** WebSearch and WebFetch are unavailable in this environment. All version data and ecosystem assessments are from training knowledge (cutoff August 2025). Versions marked [VERIFY] should be confirmed against npmjs.com before locking the package.json.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x | App shell, routing, SSR foundation | App Router is the current standard; React Server Components available for future API data fetching without refactor; file-based routing suits the multi-view structure (graph view, case list, export). Do NOT use Pages Router — it's legacy. | [MEDIUM confidence — Next.js 15 was current at knowledge cutoff] |
| React | 19.x | UI rendering | Ships with Next.js 15; concurrent features reduce jank during heavy D3 simulation ticks. |
| TypeScript | 5.x | Type safety | Enforced at project level. Critical here: graph node/edge interfaces must be typed once and shared between 2D and 3D renderers. No `any` allowed on graph data structures. |

### Graph Rendering

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| D3.js | 7.x | 2D force-directed graph simulation and SVG rendering | D3 v7 is the current stable line. Direct import of sub-modules (`d3-force`, `d3-selection`, `d3-zoom`, `d3-drag`) keeps bundle lean — do NOT import the full `d3` barrel. The force simulation runs on plain data objects; React only re-renders the SVG output, not on each tick. This is the established pattern for D3 + React. [HIGH confidence — D3 v7 has been stable since 2021] |
| Custom Canvas Renderer | N/A (no library) | 3D mindmap mode | The existing `3d_mindmap_fixed.html` contains a complete, working vanilla Canvas 3D projection engine: rotation via rotX/rotY Euler angles, perspective divide (FOV + tz depth), depth-sorted draw order, hit-testing, glow effects, depth-based opacity. Port this directly into a TypeScript class or module. Adding three.js or babylon.js for this would add 500KB+ bundle weight for a problem already solved in ~300 lines of vanilla JS. [HIGH confidence — the working reference exists in the project] |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first styling for all UI chrome | Tailwind v4 (released early 2025) switches to CSS-native config via `@theme` — no `tailwind.config.js` required. Dark theme (`dark:` variants) suits the investigation board aesthetic. Use CSS variables for graph colors (node/edge palette) so Tailwind and D3 share the same color values. [MEDIUM confidence — Tailwind v4 GA status should be verified] |

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | 5.x | Global case state (nodes, edges, selected entity, active filters, 2D/3D mode toggle) | Zero boilerplate for the state shape this app needs. Does not require a Provider wrapper — the store is imported directly. The 2D↔3D toggle is one boolean in store; both renderers subscribe to the same `nodes`/`edges` slices. Redux Toolkit is overkill for a client-only v1 with no complex async flows. React Context alone is insufficient — graph filter/selection updates would trigger excessive re-renders across the component tree. [HIGH confidence] |

### Data Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | 3.x | Runtime schema validation for case/entity/edge data types | Define the canonical `CaseSchema`, `EntitySchema`, `EdgeSchema` once in Zod; infer TypeScript types from those schemas. When the API is wired in v2, parse API responses through the same schemas — zero changes to UI components. [HIGH confidence] |
| localStorage bridge | N/A (built-in) | Persistence in v1 (no backend) | Zustand's `persist` middleware serializes store slices to localStorage. One line of config. No IndexedDB needed at v1 scale (detective case data is text + metadata, rarely exceeds a few MB). |

### Export

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| html2canvas | 1.4.x | Canvas/DOM snapshot for the graph view | Captures the SVG force graph + Canvas 3D view as a raster image for report export. Straightforward, widely used. Alternative: use the SVG serializer directly for vector export, but html2canvas handles the mixed SVG+Canvas+DOM case without custom logic. [MEDIUM confidence — verify it handles mixed SVG/Canvas layout correctly for this specific use] |
| jsPDF | 2.x | PDF assembly for Export Report | Pairs with html2canvas: snapshot → insert into PDF. The combination is the de facto standard for client-side PDF generation in React apps. No server required. [MEDIUM confidence] |

### Testing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Jest | 29.x | Unit testing framework | Next.js 15 ships with Jest config via `next/jest`. Pure function tests for graph math (force simulation helpers, 3D projection, hit-testing) run in Node without a DOM. [HIGH confidence] |
| React Testing Library | 14.x | Component integration tests | Tests behavior, not implementation — correct for testing graph interaction handlers and sidebar state. Avoid testing D3 internals; test what the user sees (node counts, selection state, panel content). [HIGH confidence] |
| @testing-library/user-event | 14.x | Realistic event simulation for RTL tests | Replaces `fireEvent` for pointer/drag interactions on the canvas. [HIGH confidence] |

### Dev Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ESLint | 9.x | Linting | Next.js 15 includes `eslint-config-next`. Extend with `@typescript-eslint` rules. [HIGH confidence] |
| Prettier | 3.x | Code formatting | No controversy — consistent formatting for a team project. [HIGH confidence] |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| 2D Graph | D3.js v7 | react-force-graph, Cytoscape.js | react-force-graph wraps D3 but hides the force simulation — you lose direct control over node rendering, tick callbacks, and custom SVG elements. Cytoscape.js is excellent but adds its own layout engine on top of a large bundle; the project already chose D3 and this is correct for investigation graphs. |
| 3D Graph | Custom Canvas (port from 3d_mindmap_fixed.html) | three.js, react-three-fiber, 3d-force-graph | three.js adds ~500KB; react-three-fiber adds more. The reference implementation already solves the exact problem (rotation, zoom, depth sort, glow, hit-test) in ~300 lines. Porting it is faster and produces a smaller, more maintainable result. 3d-force-graph uses three.js internally — same bundle problem. |
| State | Zustand | Redux Toolkit, Jotai, Valtio | Redux Toolkit has required boilerplate (slices, actions, selectors) for no benefit in this client-only app. Jotai is atom-based and better suited to fine-grained UI state than a graph dataset. Valtio's proxy model has subtle issues with non-serializable state. Zustand's flat store pattern is the cleanest fit. |
| Styling | Tailwind CSS v4 | CSS Modules, styled-components | CSS Modules require per-file stylesheets — cumbersome for a dark-theme investigation board with many custom variants. styled-components adds runtime CSS-in-JS overhead. Tailwind's utility classes are faster for dark-mode UI iteration. |
| PDF Export | html2canvas + jsPDF | Puppeteer, playwright | Server-side headless browser screenshot requires a backend. This is v1: no backend. Client-side is correct. |
| Validation | Zod | io-ts, yup | io-ts is more complex without better guarantees. Yup lacks the TypeScript-first inference that makes the API-swappable data layer pattern work cleanly. Zod is the 2025 standard for TypeScript schema validation. |

---

## Data Model Recommendation

Define these interfaces/schemas once and share across 2D and 3D renderers:

```typescript
// types/graph.ts — inferred from Zod schemas

interface GraphNode {
  id: string;
  label: string;
  type: 'person' | 'location' | 'event' | 'evidence' | 'organization';
  tier?: number;          // optional: used by 3D renderer for node sizing
  metadata: Record<string, string>;
  // 3D positions are computed at render time, NOT stored in data
}

interface GraphEdge {
  id: string;
  source: string;         // node id
  target: string;         // node id
  label?: string;
  strength?: number;      // D3 force link distance hint
}

interface Case {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'pending';
  nodes: GraphNode[];
  edges: GraphEdge[];
  evidence: EvidenceItem[];
  createdAt: string;
  updatedAt: string;
}
```

Key constraint: **3D spatial positions (x, y, z) are NOT stored in the data model.** The 3D renderer computes or assigns them. The same `nodes`/`edges` arrays feed both renderers without transformation.

---

## Installation

```bash
# Bootstrap
npx create-next-app@latest detective-platform --typescript --tailwind --app --no-src-dir

# Graph
npm install d3
npm install --save-dev @types/d3

# State + validation
npm install zustand zod

# Export
npm install html2canvas jspdf

# Testing
npm install --save-dev jest @testing-library/react @testing-library/user-event @testing-library/jest-dom jest-environment-jsdom
```

---

## D3 + React Integration Pattern

The standard 2025 pattern for D3 force graphs in React avoids letting D3 mutate the DOM. Instead:

1. Run `d3.forceSimulation()` in a `useEffect` hook on a ref to the node/edge data.
2. On each tick, update React state (or a ref) with computed `x`/`y` positions.
3. Render `<svg>` elements declaratively in JSX using those positions.

This keeps React as the single source of truth for the DOM. The alternative (letting D3 own the DOM via `d3.select`) works but bypasses React's diffing and complicates testing.

**Exception:** For very large graphs (200+ nodes), the tick-driven state update pattern causes render bottlenecks. In that case, render into a `<canvas>` using D3 for simulation only and custom draw calls for rendering. For the detective use case (20–100 entities typical), SVG + tick state is fine.

---

## What NOT to Use

| Library | Why Not |
|---------|---------|
| `react-force-graph` / `react-force-graph-2d` | Abstracts away the D3 simulation — loses control needed for custom node shapes, selection highlighting, edge labels. The project spec explicitly chose direct D3. |
| `three.js` / `@react-three/fiber` | 500KB+ bundle for 3D rendering already solved by the vanilla Canvas approach. |
| `vis.js` / `sigma.js` | Alternative graph libs with their own layout engines. They conflict with D3 force simulation and don't allow the shared data model needed for 2D/3D toggle. |
| `recharts` / `chart.js` | Charting libraries, not graph/network visualization libraries. Not applicable here. |
| Redux Toolkit | Overkill for client-only v1. Zustand is simpler and sufficient. |
| `framer-motion` | Animation library. Avoid in v1 — graph animations are handled by D3 ticks and Canvas draw loops, not CSS transitions. Add only if specific UI transition needs emerge. |
| `react-query` / `tanstack-query` | Server-state management. Not needed in v1 (mock data). Add in v2 when real API is wired. |

---

## Sources

- Training knowledge (August 2025 cutoff) — MEDIUM confidence for version numbers
- `3d_mindmap_fixed.html` in project root — HIGH confidence for 3D Canvas renderer approach
- `PROJECT.md` constraints section — HIGH confidence for stack requirements
- Version numbers marked [VERIFY] should be confirmed at npmjs.com before project init
