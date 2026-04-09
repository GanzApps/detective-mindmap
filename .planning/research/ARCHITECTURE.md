# Architecture Patterns

**Project:** Detective Case Investigation Platform
**Domain:** Interactive graph visualization app (Next.js, D3.js, Canvas 3D)
**Researched:** 2026-04-09
**Confidence:** HIGH — patterns drawn from the actual source file (3d_mindmap_fixed.html), the project spec, and well-established React/D3 integration doctrine.

---

## Recommended Architecture

```
App (Next.js App Router)
├── layout.tsx                     — root shell (theme, fonts)
└── app/
    ├── page.tsx                   — redirect or landing
    └── cases/
        └── [caseId]/
            └── page.tsx           — main investigation workspace

src/
├── components/
│   ├── layout/
│   │   ├── CaseHeader.tsx         — title, status badge, Export/Actions
│   │   ├── EvidenceSidebar.tsx    — file tree by category
│   │   └── StatusBar.tsx          — entity count, connection count
│   ├── graph/
│   │   ├── GraphWorkspace.tsx     — owns view-mode toggle, mounts 2D or 3D
│   │   ├── ForceGraph2D.tsx       — D3 force simulation owner
│   │   ├── MindMap3D.tsx          — Canvas 3D renderer owner
│   │   └── NodeDetailPanel.tsx    — slide-in panel on node click
│   ├── controls/
│   │   ├── GraphToolbar.tsx       — Reset, Pause rotation, Labels toggle
│   │   ├── FilterPanel.tsx        — Filters & Layers control
│   │   └── TimelineBar.tsx        — bottom timeline scrubber
│   └── shared/
│       ├── AICommandBar.tsx       — UI placeholder, no logic v1
│       └── Tooltip.tsx            — portal-rendered hover tooltip
│
├── lib/
│   ├── graph/
│   │   ├── forceSimulation.ts     — pure: D3 force setup, tick logic
│   │   ├── projection3d.ts        — pure: 3D→2D math (extracted from HTML)
│   │   ├── hitTest.ts             — pure: point-in-node hit detection
│   │   ├── graphLayout.ts         — pure: connected subgraph, depth sort
│   │   └── graphTypes.ts          — shared Node, Edge, GraphState types
│   ├── data/
│   │   ├── mockCases.ts           — hardcoded case data (typed)
│   │   ├── caseRepository.ts      — fetch interface (mock now, real API later)
│   │   └── dataTypes.ts           — Case, Evidence, Entity, Connection types
│   └── export/
│       └── reportExporter.ts      — snapshot / PDF generation
│
├── hooks/
│   ├── useGraphState.ts           — node/edge state, selection, hover
│   ├── useViewMode.ts             — '2d' | '3d' toggle with transition state
│   ├── useCanvasRenderer.ts       — animation loop, resize observer for Canvas
│   └── useCaseData.ts             — loads from caseRepository, owns case state
│
└── store/ (optional, if prop-drilling becomes unwieldy)
    └── caseStore.ts               — Zustand slice for case + graph state
```

---

## Component Boundaries

| Component | Owns | Receives | Does NOT touch |
|-----------|------|----------|----------------|
| `CaseHeader` | Header UI | `caseId`, `caseStatus` | Graph, data fetching |
| `EvidenceSidebar` | File tree | `evidenceCategories[]` | Graph, canvas |
| `GraphWorkspace` | View-mode toggle, mounts renderer | `graphData`, `onNodeSelect` | D3 simulation internals, Canvas ctx |
| `ForceGraph2D` | D3 simulation lifecycle, SVG/Canvas | `nodes[]`, `edges[]`, `selectedId` | 3D projection, sidebar |
| `MindMap3D` | Canvas element, animation loop | `nodes[]`, `edges[]`, `selectedId` | D3, layout decisions |
| `NodeDetailPanel` | Detail UI for selected node | `selectedNode`, `connections[]` | Which renderer is active |
| `GraphToolbar` | Button UI only | callback props | State, data |
| `FilterPanel` | Filter UI | `filters`, `onFilterChange` | Graph internals |
| `TimelineBar` | Timeline scrubber UI | `events[]`, `onScrub` | Rendering |

**The golden rule:** `ForceGraph2D` and `MindMap3D` are siblings, not nested. `GraphWorkspace` conditionally renders one or the other. Both receive the same `GraphData` shape. They never communicate directly.

---

## Data Flow

```
caseRepository (mock/API)
    │
    ▼
useCaseData (hook)          ← loads case, evidence, entities, connections
    │
    ▼
cases/[caseId]/page.tsx     ← top-level page, owns all state
    │
    ├──▶ CaseHeader          (caseId, status)
    ├──▶ EvidenceSidebar     (evidence[])
    │
    └──▶ GraphWorkspace      (graphData: {nodes, edges}, selectedId, onNodeSelect)
              │
              ├── [mode=2d] ForceGraph2D
              │       └── forceSimulation.ts (pure lib)
              │
              └── [mode=3d] MindMap3D
                      └── projection3d.ts, hitTest.ts (pure libs)
              │
              └──▶ NodeDetailPanel  (selectedNode)
```

**State ownership:**
- `selectedNodeId` lives in `page.tsx` or a shared hook — both renderers need it and `NodeDetailPanel` reads it.
- `viewMode` ('2d' | '3d') lives in `GraphWorkspace` — it owns the toggle UI.
- `graphData` flows down from `useCaseData` through `page.tsx` — single source of truth.
- Filter state lives in `FilterPanel` and flows up to `page.tsx` to produce a `filteredGraphData` before passing to `GraphWorkspace`.

---

## D3.js + React Integration Pattern

### The Core Problem

D3 wants to own DOM mutations. React also wants to own DOM mutations. Letting them both touch the same DOM is a rewrite-causing mistake.

### The Pattern: D3 Owns the Canvas/SVG, React Owns Everything Else

D3's force simulation is pure computation — it ticks `node.x, node.y` positions. The render step is where the conflict lives.

**Implementation for `ForceGraph2D`:**

```typescript
// ForceGraph2D.tsx
export function ForceGraph2D({ nodes, edges, selectedId, onNodeSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  // 1. Simulation setup — runs once on mount, updates when data changes
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Create simulation using pure lib (testable separately)
    const sim = createForceSimulation(nodes, edges);
    simulationRef.current = sim;

    // D3 ticks → we call our own draw function (React never touches canvas pixels)
    sim.on('tick', () => drawGraph2D(ctx, canvas.width, canvas.height, sim.nodes(), edges, selectedId));

    return () => { sim.stop(); };
  }, [nodes, edges]);   // re-init when graph data changes

  // 2. Re-draw without re-simulating when selection changes
  useEffect(() => {
    if (!canvasRef.current || !simulationRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    drawGraph2D(ctx, canvas.width, canvas.height, simulationRef.current.nodes(), edges, selectedId);
  }, [selectedId]);

  // 3. Click events use hitTest (pure function)
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const hit = hitTest2D(simulationRef.current!.nodes(), e.clientX - rect.left, e.clientY - rect.top);
    onNodeSelect(hit?.id ?? null);
  }, [onNodeSelect]);

  return <canvas ref={canvasRef} onClick={handleClick} className="w-full h-full" />;
}
```

**Key invariants:**
- React renders exactly one `<canvas>` element with a ref. No more.
- D3 simulation ticks call a draw function directly. React never re-renders on tick.
- `selectedId` changes trigger a direct canvas redraw via a second `useEffect`, not a React re-render cycle.
- All D3 setup is in `lib/graph/forceSimulation.ts` — importable and testable without a DOM.

---

## Canvas 3D Renderer Integration Pattern

### Porting Strategy from `3d_mindmap_fixed.html`

The existing source has clear seams. Extract these into `lib/graph/`:

| Vanilla Code | Extracted To | Notes |
|---|---|---|
| `project(n)` function | `projection3d.ts → projectNode(n, rotX, rotY, zoom, W, H)` | Pure — takes params, returns `{sx, sy, sc, tz}` |
| `hitTest(mx, my)` function | `hitTest.ts → hitTest3D(nodes, mx, my, rotX, rotY, zoom, W, H)` | Pure — returns node or null |
| `getConnected(id)` | `graphLayout.ts → getConnectedIds(edges, id)` | Pure — works for both 2D and 3D |
| `draw()` body | `renderer3d.ts → drawFrame(ctx, nodes, edges, state)` | Stateless render function |
| `animate()` loop | `useCanvasRenderer.ts` hook | React lifecycle owner |
| Global `rotX, rotY, zoom` state | `MindMap3D` component state via `useRef` | Mutation-safe across animation frames |
| Mouse/touch event handlers | `MindMap3D` component | React synthetic events |

**Implementation for `MindMap3D`:**

```typescript
// MindMap3D.tsx
export function MindMap3D({ nodes, edges, selectedId, onNodeSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable camera state — useRef, NOT useState (avoids re-render on every drag frame)
  const camera = useRef({ rotX: 0.28, rotY: 0.55, zoom: 1 });
  const dragging = useRef({ active: false, lx: 0, ly: 0 });
  const hoverId = useRef<number | null>(null);
  const autoRot = useRef(true);
  const rafId = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    // Call pure render function from lib/graph/renderer3d.ts
    drawFrame3D(ctx, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio, nodes, edges, {
      ...camera.current,
      selectedId,
      hoverId: hoverId.current,
    });
  }, [nodes, edges, selectedId]);

  // Animation loop — only animates when autoRot is true
  useEffect(() => {
    const loop = () => {
      if (autoRot.current) {
        camera.current.rotY += 0.003;
        draw();
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, [draw]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  // Mouse handlers — mutate refs directly, no setState → no re-render
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (dragging.current.active) {
      camera.current.rotY += (mx - dragging.current.lx) * 0.008;
      camera.current.rotX += (my - dragging.current.ly) * 0.008;
      dragging.current.lx = mx; dragging.current.ly = my;
      autoRot.current = false;
    }
    // hitTest is a pure function call
    const hit = hitTest3D(nodes, mx, my, camera.current.rotX, camera.current.rotY, camera.current.zoom,
      canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight);
    hoverId.current = hit?.id ?? null;
    draw();
  }, [nodes, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseDown={/* ... */}
      onClick={/* hitTest → onNodeSelect */}
      onWheel={/* zoom */}
    />
  );
}
```

**Key invariant:** Camera rotation and hover state are `useRef` values, not `useState`. The animation loop and mouse handlers mutate them and call `draw()` directly. React never re-renders the component during interaction — only when `nodes`, `edges`, or `selectedId` props change.

---

## Data Shape

Both renderers consume identical types. This is the contract:

```typescript
// lib/graph/graphTypes.ts

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;       // 'person' | 'location' | 'object' | 'event' | 'organization'
  tier: number;           // 0=central, 1=primary, 2=secondary — drives visual size
  // 3D positional hints (optional — simulation can place freely)
  x?: number;
  y?: number;
  z?: number;             // 3D only — ignored by D3 2D simulation
}

export interface GraphEdge {
  id: string;
  source: string;         // node id
  target: string;         // node id
  label?: string;
  strength?: number;      // D3 link force weight
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

The `z` coordinate is only meaningful in 3D mode. The D3 force simulation ignores it. The 3D renderer uses it as the initial position hint, then lets the user rotate freely.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: D3 Managing the DOM Alongside React

**What goes wrong:** Calling `d3.select(svgRef.current).selectAll('circle').data(nodes).enter().append('circle')` — D3 mutates the DOM, React diffs it on re-render, they conflict, nodes flicker or duplicate.

**Instead:** Either let D3 manage an entire `<canvas>` (React only mounts it, never touches its content), OR use D3 for math only and let React render SVG elements. For a complex investigation graph with many nodes, Canvas is better for performance — use the "D3 computes, Canvas draws" pattern.

### Anti-Pattern 2: useState for Animation Frame Values

**What goes wrong:** Storing `rotX`, `rotY`, `hoverId` in `useState`. Each mouse-move fires `setState`, React queues a re-render, `useEffect` re-runs, the animation loop is recreated — jank at 60fps.

**Instead:** `useRef` for all values that change at animation speed. `useState` only for values that should trigger a React re-render (e.g., `selectedId` which shows `NodeDetailPanel`).

### Anti-Pattern 3: Simulation Re-Creation on Every Re-Render

**What goes wrong:** Creating a new `d3.forceSimulation` inside a component body or a `useEffect` with too-broad dependencies. Every filter change or selection re-creates the simulation, nodes jump to random positions.

**Instead:** Create simulation once in a `useEffect` with `[nodes, edges]` as the only deps. Update alpha/reheat on incremental changes. Persist the simulation in a `useRef` so it survives React re-renders.

### Anti-Pattern 4: GraphData Defined In Each Renderer

**What goes wrong:** `ForceGraph2D` uses `{source, target}` edge format, `MindMap3D` uses `{a, b}`. Adding a new entity type requires touching both renderers.

**Instead:** One canonical `graphTypes.ts`. Both renderers import from it. Adapters live in each renderer if the library requires a different shape (D3 needs `source`/`target`; the 3D renderer can use them directly).

### Anti-Pattern 5: Putting Projection Math in the Component

**What goes wrong:** The `project(n)` function lives inside `MindMap3D`. It cannot be unit tested without mounting the component.

**Instead:** `lib/graph/projection3d.ts` exports `projectNode(node, rotX, rotY, zoom, W, H): ProjectedNode`. Jest test: call with known inputs, assert `sx/sy` are within expected bounds. Zero DOM required.

---

## Testability Strategy

### Pure Function Layer (lib/graph/) — Jest only, no DOM

These are extracted directly from `3d_mindmap_fixed.html` and made side-effect-free:

| Function | What to test |
|----------|-------------|
| `projectNode(node, rotX, rotY, zoom, W, H)` | Known 3D coords → expected screen position at identity rotation |
| `hitTest3D(nodes, mx, my, rotX, rotY, zoom, W, H)` | Point inside node radius returns that node; point outside returns null |
| `hitTest2D(nodes, mx, my)` | Same contract for 2D positioned nodes |
| `getConnectedIds(edges, nodeId)` | Returns direct neighbors, excludes non-connected |
| `createForceSimulation(nodes, edges)` | Returns simulation; after `.tick()` x 100, nodes have finite positions |
| `buildGraphFromCase(caseData)` | Case data in → GraphData out; correct node/edge counts |

### Component Layer — React Testing Library

```typescript
// ForceGraph2D.test.tsx
it('calls onNodeSelect when a node is clicked', () => {
  const onSelect = jest.fn();
  const { container } = render(
    <ForceGraph2D nodes={mockNodes} edges={mockEdges} selectedId={null} onNodeSelect={onSelect} />
  );
  fireEvent.click(container.querySelector('canvas')!, { clientX: ..., clientY: ... });
  expect(onSelect).toHaveBeenCalledWith(mockNodes[0].id);
});
```

Mock `hitTest` in component tests — test that the component wires up correctly, not that the math is right (math is tested separately).

### Integration Layer — Playwright (future)

- Load a case, click a node, assert `NodeDetailPanel` shows the right label.
- Toggle 2D/3D, assert both canvases render without errors.

---

## Suggested Build Order

The dependency graph dictates this order. Nothing here is arbitrary.

```
Phase 1: Foundation
  types → mockData → caseRepository (mock impl)
  Rationale: Everything downstream depends on these types. Build once, never rewrite.

Phase 2: App Shell
  layout.tsx → CaseHeader → EvidenceSidebar → page.tsx wiring
  Rationale: Lets you verify data flow before graphs exist. Visually reviewable.

Phase 3: 3D Renderer Port
  projection3d.ts → hitTest.ts → renderer3d.ts → MindMap3D.tsx → useCanvasRenderer.ts
  Rationale: The 3D source already exists and works. Port it while the vanilla code is
  fresh. Pure lib extraction first means testable before mounting in React.

Phase 4: 2D Force Graph
  forceSimulation.ts → ForceGraph2D.tsx
  Rationale: 3D is done first because it has an existing reference implementation.
  D3 simulation is more complex to debug; do it after 3D is verified working.

Phase 5: GraphWorkspace + Toggle
  GraphWorkspace.tsx → viewMode toggle → NodeDetailPanel
  Rationale: Both renderers exist; now connect them with shared state and the UI toggle.

Phase 6: Controls + Filters
  GraphToolbar → FilterPanel → TimelineBar → AICommandBar (placeholder)
  Rationale: UI polish after core graph is working.

Phase 7: Export
  reportExporter.ts → Export button wiring
  Rationale: Last — depends on everything else being stable.
```

**Dependency rule:** `lib/graph/` has zero React dependencies. It can be built and tested before any component exists. This is the correct starting point for Phase 3 and 4.

---

## Scalability Considerations

| Concern | At 50 nodes (v1) | At 500 nodes | At 5K nodes |
|---------|-----------------|--------------|-------------|
| D3 force ticks | No issue | Throttle alpha decay | Web Worker for simulation |
| Canvas 3D frame | No issue (~0.5ms) | Depth sort becomes O(n log n) concern | Frustum culling, LOD |
| GraphData in state | useState fine | Consider Zustand | Normalized store required |
| Re-renders on hover | useRef pattern handles it | Same | Same |

For v1 (mock data, ~30 nodes per the reference HTML), none of these are concerns. The architecture supports future scaling without structural changes.

---

## Sources

- Source analysis: `3d_mindmap_fixed.html` (in-project file, read directly)
- Project specification: `.planning/PROJECT.md`
- D3 + React Canvas integration: established pattern from D3 v7 docs (d3js.org) and Observable notebooks — HIGH confidence (well-documented, stable since D3 v5)
- React `useRef` for animation loops: React docs on escape hatches — HIGH confidence
- Next.js App Router component conventions: Next.js 14/15 docs — HIGH confidence
