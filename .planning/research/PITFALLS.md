# Domain Pitfalls

**Domain:** D3.js force graph + Canvas 3D renderer in Next.js (App Router)
**Researched:** 2026-04-09
**Confidence:** HIGH — patterns from D3 v7, React 18, Next.js 14/15; verified against the project's actual 3d_mindmap_fixed.html source

---

## Critical Pitfalls

Mistakes that cause rewrites, permanent bugs, or broken renders.

---

### Pitfall 1: D3 and React Both Mutating the DOM — Tearing and Stale State

**What goes wrong:**
D3's `.join()`, `.append()`, `.attr()`, and force simulation tick handlers all write directly to DOM nodes. React's reconciler independently writes to the same nodes on re-render. The result is one system undoing the other's writes: nodes teleport back to their pre-drag positions after any React state update; force simulation ticks get wiped when React re-renders a parent; SVG attributes set by D3 are reset to their initial JSX values.

**Why it happens:**
D3 selects real DOM nodes and mutates them imperatively. React's virtual DOM diffing re-applies JSX-declared attributes on every render cycle. They run on independent schedules with no coordination.

**Pattern that solves it — Ref Escape Hatch:**
Hand D3 a ref-owned DOM node and never render inside it with JSX. The React component renders a single `<svg>` or `<canvas>` element with a ref, then passes that ref to D3 in a `useEffect`. React owns nothing inside that element; D3 owns everything inside it. The `useEffect` dependency array contains only the data — not render state like hover or selection — so React re-renders never retrigger D3 mutation.

```typescript
// GraphCanvas.tsx
const svgRef = useRef<SVGSVGElement>(null);

useEffect(() => {
  if (!svgRef.current) return;
  const svg = d3.select(svgRef.current);

  // D3 owns all children from this point — no JSX children inside <svg>
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id((d: any) => d.id))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const link = svg.selectAll('line').data(edges).join('line');
  const node = svg.selectAll('circle').data(nodes).join('circle');

  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
    node.attr('cx', d => d.x).attr('cy', d => d.y);
  });

  return () => { simulation.stop(); svg.selectAll('*').remove(); };
}, [nodes, edges, width, height]); // data only — no UI state

return <svg ref={svgRef} width={width} height={height} />;
```

**Rule:** Never put React children inside the ref-owned element. Never read D3-mutated DOM state back into React state on tick.

---

### Pitfall 2: SSR Crashing on `document`, `window`, Canvas, and `requestAnimationFrame`

**What goes wrong:**
Next.js App Router renders every component on the server first. D3 internally calls `document.createElementNS`, Canvas contexts call `canvas.getContext('2d')`, and the 3D animation loop calls `requestAnimationFrame` — none of which exist in Node.js. The build crashes or silently produces a broken hydration with a `ReferenceError: document is not defined`.

The reference `3d_mindmap_fixed.html` runs `resize()`, `draw()`, and `animate()` at module top level — directly ported into a component file, all of those execute during SSR and crash immediately.

**Why it happens:**
App Router defaults all components to Server Components. Even `'use client'` components have their module-level code executed during the server render pass for hydration. The DOM/Canvas APIs do not exist in that context.

**Pattern that solves it — `dynamic` with `ssr: false` + `useEffect` guard:**
Any component that touches Canvas, D3, or `window` must be:
1. Marked `'use client'`
2. Imported via `next/dynamic` with `{ ssr: false }` at the page level
3. All DOM/Canvas initialization deferred into `useEffect` (which never runs on the server)

```typescript
// app/cases/[id]/page.tsx (Server Component)
import dynamic from 'next/dynamic';

const GraphView = dynamic(
  () => import('@/components/graph/GraphView'),
  {
    ssr: false,
    loading: () => <div className="graph-skeleton" />,
  }
);

export default function CasePage() {
  return <GraphView />;
}
```

```typescript
// components/graph/GraphView.tsx
'use client';

import { useEffect, useRef } from 'react';

export function GraphView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Safe: this NEVER runs on the server
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    // init D3 or Canvas renderer here
  }, []);

  return <canvas ref={canvasRef} />;
}
```

**Rule:** `dynamic({ ssr: false })` at the import boundary + `useEffect` for all init. Never initialize Canvas or D3 at component module scope.

---

### Pitfall 3: Canvas Size Mismatch — Blurry Rendering on HiDPI Displays

**What goes wrong:**
The canvas appears blurry or visually doubled on Retina/HiDPI screens. Nodes drawn at position `(100, 100)` appear at `(50, 50)` visually, making hit testing incorrect: click events fire in the wrong location relative to drawn content.

**Why it happens:**
CSS size (`canvas.style.width`) and canvas bitmap resolution (`canvas.width`) are independent. On a 2× display, a canvas with CSS width 800px needs `canvas.width = 1600` (the physical pixel count) or it gets upscaled and blurs. The reference file handles this correctly with `window.devicePixelRatio` — but the pattern breaks if resize is not re-applied after React mounts.

The reference file's `resize()` function is correct:
```javascript
dpr = window.devicePixelRatio || 1;
W = cv.offsetWidth; H = cv.offsetHeight;
cv.width = W * dpr; cv.height = H * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

**What breaks in the React port:**
- `cv.offsetWidth` returns `0` during SSR (no layout)
- `resize()` called once at module scope runs before the canvas is mounted
- Window resize listener attached in module scope leaks after component unmounts
- The `setTransform(dpr, 0, 0, dpr, 0, 0)` call must be re-applied after every `canvas.width =` assignment (resizing the canvas resets the context transform)

**Pattern that solves it — ResizeObserver in useEffect:**

```typescript
useEffect(() => {
  const canvas = canvasRef.current!;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // re-apply after resize
    rendererRef.current?.setSize(width, height); // notify renderer
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize(); // initial

  return () => ro.disconnect(); // cleanup on unmount
}, []);
```

**Rule:** Always use `ResizeObserver` on the canvas element (not `window.addEventListener('resize')`). Always re-apply `setTransform` after a canvas resize. Never read `offsetWidth` at module scope.

---

### Pitfall 4: Animation Loop Memory Leak and Zombie Frames

**What goes wrong:**
The animation loop keeps running after the component unmounts (e.g., user navigates away). This causes: `setState` calls on unmounted components (React warning), `getContext` on a detached canvas (throws), continued CPU usage. In React Strict Mode (development), `useEffect` runs twice — the first loop is never cancelled, and you get two overlapping animation loops producing double-speed animation.

**Why it happens:**
`requestAnimationFrame(animate)` schedules a callback that reschedules itself — it runs forever unless explicitly cancelled with `cancelAnimationFrame`. The reference file has no cancellation: `function animate() { ... requestAnimationFrame(animate); }`. This is fine in a vanilla HTML file that lives for the page lifetime, but it is a resource leak in a component that mounts and unmounts.

**Pattern that solves it — rAF handle in useEffect cleanup:**

```typescript
useEffect(() => {
  let rafId: number;
  let running = true;

  function animate() {
    if (!running) return; // guard for the double-invoke in Strict Mode
    // update rotation, draw frame
    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);

  return () => {
    running = false;
    cancelAnimationFrame(rafId);
  };
}, []);
```

**Rule:** Every `requestAnimationFrame` loop started in a component must be cancelled in the `useEffect` cleanup. The `running` boolean guard handles React Strict Mode's double-invocation.

---

### Pitfall 5: Force Simulation Restarting on Every Render — Graph Jumps

**What goes wrong:**
The graph layout "resets" and nodes fly back to their initial positions whenever the parent component re-renders (e.g., a sidebar panel updates, a filter changes, a node is selected). The simulation restarts from scratch on every React render cycle.

**Why it happens:**
If the D3 simulation is created inside `useEffect` with a dependency array that includes UI state (selected node, hover state, filter), the cleanup function destroys the simulation and the next render creates a fresh one — discarding all converged positions. The effect fires for every state change that touches the dependency array.

**Pattern that solves it — Stable Simulation Ref + Separate UI Effect:**

Store the simulation in a `useRef` (stable across renders). Create it once when data changes. Keep UI state (selection, hover) completely out of the simulation's `useEffect` dependencies. Handle UI highlighting as a separate, lightweight effect that reads already-computed node positions without touching the simulation.

```typescript
const simulationRef = useRef<d3.Simulation<NodeDatum, EdgeDatum> | null>(null);

// Effect 1: Simulation — only recreated when graph DATA changes
useEffect(() => {
  if (simulationRef.current) simulationRef.current.stop();

  simulationRef.current = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(edges).id((d: any) => d.id))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2));

  simulationRef.current.on('tick', redraw);

  return () => simulationRef.current?.stop();
}, [nodes, edges, width, height]); // NOT selectedNode, NOT hoverNode

// Effect 2: Highlight — reads positions, does NOT touch simulation
useEffect(() => {
  redraw(); // re-draw with new selection colors using existing positions
}, [selectedNodeId]);
```

**Rule:** Simulation lifecycle (create, destroy) is gated on data. Visual state (selection, hover) triggers only a redraw, not a simulation restart.

---

### Pitfall 6: 2D ↔ 3D Toggle Losing Node Positions

**What goes wrong:**
User carefully drags nodes into a meaningful spatial arrangement in 2D. They toggle to 3D, explore, then toggle back to 2D — all nodes are in their default force-layout positions, losing the custom arrangement. Or the reverse: 3D rotation state is reset every time the user leaves 3D mode.

**Why it happens:**
D3 force simulation mutates the node objects in-place: it writes `x`, `y`, `vx`, `vy` onto each node datum. The 3D renderer stores rotation/zoom in component-local state. If either renderer component unmounts on toggle, that mutable state is destroyed. If the node array is recreated (new reference) on every render, the D3 mutations are lost.

**Pattern that solves it — Shared Mutable Graph State + Stable Identity:**

Keep one authoritative node array in a parent-level `useRef` (or Zustand store). Both renderers read from the same array. D3 writes `x, y` into the objects. The 3D renderer writes `rotX, rotY, zoom` into a separate persistent ref. Neither renderer gets unmounted on toggle — use CSS `display: none` / `visibility: hidden` to hide the inactive one, preserving all mutable state.

```typescript
// types/graph.ts
export interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  // D3 will write x, y, vx, vy here — preserve across toggle
}

// GraphContainer.tsx
const nodesRef = useRef<NodeDatum[]>(initialNodes); // stable reference
const [mode, setMode] = useState<'2d' | '3d'>('2d');

return (
  <div>
    {/* Both mount once — CSS hides the inactive renderer */}
    <div style={{ display: mode === '2d' ? 'block' : 'none' }}>
      <Graph2D nodes={nodesRef.current} />
    </div>
    <div style={{ display: mode === '3d' ? 'block' : 'none' }}>
      <Graph3D nodes={nodesRef.current} />
    </div>
  </div>
);
```

**Rule:** Never unmount the inactive renderer on toggle. Use `display: none`. Keep node data in a stable ref so D3's in-place mutations survive. Treat node positions as mutable side-effects of the simulation, not as React state.

---

### Pitfall 7: Canvas Hit Testing Wrong After DPR Scale

**What goes wrong:**
Mouse click events register at the wrong node. A click on node A selects node B, or clicking a node that should be interactive does nothing. The error is proportional to `window.devicePixelRatio` (2× on Retina) — nodes drawn at CSS pixel position `(100, 100)` are actually at physical pixel `(200, 200)` in the canvas bitmap.

**Why it happens:**
`MouseEvent.clientX/Y` are in CSS pixels. The canvas context has been scaled up by `dpr` via `setTransform`. The reference file's `hitTest` subtracts `rect.left/top` correctly but assumes CSS coordinates match drawn coordinates. If `setTransform(dpr, 0, 0, dpr, 0, 0)` is applied but hit testing uses raw `clientX - rect.left`, everything is off by a factor of `dpr`.

The `project()` function in the reference file outputs CSS-space coordinates (`W/2 + tx*sc`) where `W = cv.offsetWidth` (CSS pixels) — so hit testing in CSS pixels is correct *as long as the transform is applied*. The bug only appears if someone removes or forgets the `setTransform` call.

**Pattern that solves it — Consistent coordinate space in hit testing:**

```typescript
function getCanvasPoint(canvas: HTMLCanvasElement, e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  // Stay in CSS pixel space — matches the projection output space
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}
// The dpr scaling is handled by setTransform on the context,
// so draw calls use CSS coordinates and hit testing uses CSS coordinates.
// Do NOT multiply by dpr in hit testing.
```

**Rule:** Keep all drawing and hit testing in the same coordinate space (CSS pixels). Apply `dpr` scaling only through `ctx.setTransform`, never by manually multiplying coordinates.

---

### Pitfall 8: Export Snapshot Capturing Blank or Misscaled Canvas

**What goes wrong:**
`canvas.toDataURL()` returns a blank PNG, or returns the correct image but at 1× resolution (pixelated when printed), or the SVG export captures the SVG element without the correct D3-applied transforms.

**Why it happens for Canvas export:**
`toDataURL()` captures the current bitmap state. If called before the animation frame paints the final frame (e.g., in a click handler that fires before `requestAnimationFrame` completes), the canvas may be mid-clear or empty. Canvas bitmaps are also rendered at the physical pixel resolution (`width × dpr`), but many PDF generators expect CSS pixel dimensions — the resulting image is `dpr` times too large.

**Why it happens for SVG export:**
D3 applies transforms and attributes directly to DOM elements. `XMLSerializer` captures the current DOM, which includes those attributes — but external stylesheets and Tailwind utility classes are not inline, so the exported SVG looks unstyled. `foreignObject` elements (if used) are not supported in many SVG-to-PDF pipelines.

**Pattern that solves it:**

For Canvas:
```typescript
async function exportCanvas(canvas: HTMLCanvasElement): Promise<string> {
  // 1. Pause animation and ensure one clean frame is drawn
  cancelAnimationFrame(rafIdRef.current);
  draw(); // explicit synchronous draw

  // 2. Export at native resolution; consumer scales down
  const dataUrl = canvas.toDataURL('image/png');

  // 3. Resume animation
  rafIdRef.current = requestAnimationFrame(animate);
  return dataUrl;
}
```

For PDF from Canvas via `html2canvas` + `jsPDF`:
```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

async function exportPDF(containerEl: HTMLElement) {
  // html2canvas re-renders the DOM element into a new canvas,
  // avoiding the blank-canvas-on-toDataURL problem
  const snapshot = await html2canvas(containerEl, { scale: 2 });
  const imgData = snapshot.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px',
                           format: [snapshot.width / 2, snapshot.height / 2] });
  pdf.addImage(imgData, 'PNG', 0, 0, snapshot.width / 2, snapshot.height / 2);
  pdf.save('investigation-report.pdf');
}
```

**Library recommendation:** `html2canvas` (v1.x) + `jspdf` (v2.x) for PDF export. `canvas.toDataURL()` directly for PNG snapshots. Avoid `dom-to-image` — it has known Safari failures.

---

### Pitfall 9: Force Simulation Thrashing at High Node Counts

**What goes wrong:**
With 100–200 nodes the browser tab locks up for 2–5 seconds when the simulation first runs. The UI is unresponsive during layout convergence. On lower-end laptops it may never converge smoothly.

**Why it happens:**
D3's `forceManyBody` (Barnes-Hut approximation) has O(n log n) cost per tick. At 200 nodes with default `alpha` decay and strong repulsion, the simulation runs 300+ ticks while the browser renders nothing. Every tick triggers the `on('tick')` callback which redraws the SVG — 300 synchronous redraws block the main thread.

**Pattern that solves it — Pre-tick off-screen + reduced alpha:**

```typescript
// Run N ticks synchronously before attaching to RAF
simulation.stop();
for (let i = 0; i < 200; i++) simulation.tick(); // converge off main thread tick

// Now attach tick handler for live interaction
simulation.on('tick', redraw).restart();
simulation.alphaDecay(0.03); // slower decay = smoother convergence
simulation.alphaMin(0.001);  // stop earlier

// For very large graphs: reduce tick frequency
let frameCount = 0;
simulation.on('tick', () => {
  frameCount++;
  if (frameCount % 3 === 0) redraw(); // draw every 3rd tick
});
```

**Additional:** Set `d3.forceManyBody().theta(0.9)` (higher theta = faster but less accurate Barnes-Hut). For 50–100 nodes this has negligible visual impact. Freeze converged nodes with `node.fx = node.x; node.fy = node.y` after `alphaMin` is reached to stop continuous recomputation.

---

### Pitfall 10: `useEffect` Dependency Array Causing Infinite Simulation Recreations

**What goes wrong:**
The simulation restarts on every render. Nodes never settle. The graph flickers constantly. CPU pegs at 100%.

**Why it happens:**
Objects and arrays in React props fail referential equality checks (`===`) on every render, even if their contents are identical. If `nodes` or `edges` are declared as literals or recreated with `.map()` in the parent component body, they get a new reference on every render — causing the `useEffect` to see "data changed" and restart the simulation.

```typescript
// Bug: new array reference on every render
function CasePage() {
  const nodes = caseData.entities.map(e => ({ id: e.id, label: e.name }));
  //            ↑ new array every render — breaks useEffect dependency
  return <Graph2D nodes={nodes} />;
}
```

**Pattern that solves it — `useMemo` for derived data:**

```typescript
function CasePage({ caseData }: Props) {
  const nodes = useMemo(
    () => caseData.entities.map(e => ({ id: e.id, label: e.name })),
    [caseData.entities] // stable when entities don't change
  );
  const edges = useMemo(
    () => caseData.connections.map(c => ({ source: c.from, target: c.to })),
    [caseData.connections]
  );
  return <Graph2D nodes={nodes} edges={edges} />;
}
```

**Rule:** All data passed to graph components must be `useMemo`-stabilized. The `useEffect` in the graph component fires only when the memoized reference changes.

---

## Moderate Pitfalls

### Pitfall 11: D3 Drag Conflicting with React Synthetic Events

**What goes wrong:**
Node drag works but clicks don't register, or drag starts immediately on mousedown with no threshold, or the drag handler throws because the D3 simulation node reference is stale.

**Why it happens:**
D3's drag handler attaches to DOM nodes directly via `d3.drag()`. React's `onClick` synthetic event bubbles through the same DOM tree. The interaction between `dragstart` suppressing clicks and React's event delegation causes missed click events on drag-enabled nodes.

**Prevention:**
Use `d3.drag().filter(e => !e.button)` to restrict drag to primary button. Add a drag threshold (`d3.drag().on('start', ...)` that only activates after 5px movement) to distinguish click from drag. Attach all interaction (click, drag, hover) through D3, not React synthetic events, on D3-owned elements.

```typescript
const drag = d3.drag<SVGCircleElement, NodeDatum>()
  .filter(event => !event.button) // primary button only
  .on('start', (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
  })
  .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
  .on('end', (event, d) => {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null; // release node
  });
```

---

### Pitfall 12: Zoom/Pan State Lost on Mode Toggle

**What goes wrong:**
User zooms into a specific cluster of nodes in 2D, toggles to 3D, toggles back — the 2D view is reset to the default zoom/center.

**Prevention:**
Store zoom transform in a `useRef` (or Zustand store) at the parent container level. Pass it down to the 2D graph component. Apply it via `d3.zoom().transform(svg, savedTransform)` when the 2D component becomes visible again rather than remounting from scratch.

---

### Pitfall 13: Stale Closure in Animation Loop Referencing Old State

**What goes wrong:**
After selecting a node, the highlight doesn't appear in the 3D renderer, or the wrong node is highlighted. The animation loop draws with state from when it was created, ignoring subsequent state updates.

**Why it happens:**
`requestAnimationFrame` callbacks close over variables at the time the `useEffect` runs. If `selectedNodeId` changes after the animation loop starts, the loop still reads the original value.

**Prevention:**
Store all state that the animation loop reads in refs, not in component state. Update the refs from state via a separate `useEffect`.

```typescript
const selectedIdRef = useRef<string | null>(null);

// Keep ref in sync with state
useEffect(() => {
  selectedIdRef.current = selectedNodeId;
}, [selectedNodeId]);

// Animation loop reads from ref — always current
function draw() {
  const selected = selectedIdRef.current; // not stale
  // ...
}
```

---

### Pitfall 14: TypeScript Errors on D3 Generic Types with Force Simulation

**What goes wrong:**
TypeScript errors on `d.x`, `d.y`, `d.source.x`, `d.target.x` — D3's simulation types declare these as `number | undefined` because nodes may not have positions yet. Edge source/target are typed as `string | NodeDatum` because D3 replaces string IDs with object references after simulation init.

**Prevention:**
Declare typed interfaces that extend D3's simulation types and cast after simulation initializes.

```typescript
import * as d3 from 'd3';

export interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'person' | 'location' | 'evidence' | 'event';
}

export interface EdgeDatum extends d3.SimulationLinkDatum<NodeDatum> {
  label?: string;
  strength?: number;
}

// After simulation.force('link') resolves IDs to objects:
function getSourceX(edge: EdgeDatum): number {
  return (edge.source as NodeDatum).x ?? 0;
}
```

---

## Minor Pitfalls

### Pitfall 15: `window.addEventListener` Leaking on Hot Reload

**What goes wrong:**
In development with Next.js Fast Refresh, component effects re-run but old `window` event listeners are not removed (if cleanup was forgotten). Over multiple saves, `resize` fires 3-4 times per event.

**Prevention:** Always return cleanup from `useEffect` for any `window` or `document` listener. Use `ResizeObserver` on the canvas element rather than `window` resize — the observer is automatically GC'd when its target is removed from the DOM.

---

### Pitfall 16: D3 v7 Module Imports with Tree Shaking

**What goes wrong:**
`import * as d3 from 'd3'` imports the entire library (~500KB minified). Next.js bundle analyzer shows D3 as a dominant chunk even for pages that don't use graphs.

**Prevention:**
Import only used modules:
```typescript
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { select, selectAll } from 'd3-selection';
import { drag } from 'd3-drag';
import { zoom } from 'd3-zoom';
```
Since the graph components are already wrapped in `dynamic({ ssr: false })`, they are code-split automatically — this is a secondary optimization.

---

### Pitfall 17: Canvas `globalAlpha` Not Reset Between Draw Calls

**What goes wrong:**
The 3D renderer sets `ctx.globalAlpha` for depth-based opacity. If any draw path returns early or throws without resetting `globalAlpha`, subsequent draws are rendered at the wrong opacity — typically all nodes rendered nearly transparent.

The reference file has this pattern at line 194:
```javascript
ctx.globalAlpha = isDim ? 0.08 : isSel||isConn ? 1 : Math.max(0.35, ...);
ctx.fill();
ctx.globalAlpha = 1; // reset
```
If the `return` at line 177 fires (for dimmed nodes), `globalAlpha` is left at `0.08` for all subsequent nodes.

**Prevention:**
Wrap the entire `draw()` function in a `ctx.save()` / `ctx.restore()` pair. Do not manually reset context state — let `restore()` handle it atomically.

```typescript
function drawNode(ctx: CanvasRenderingContext2D, node: ProjectedNode) {
  ctx.save(); // snapshot all state
  // ... all draw calls including globalAlpha changes
  ctx.restore(); // always restored, even on early return
}
```

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| D3 graph initial setup | Pitfall 1 (DOM ownership) | Establish ref escape hatch pattern before writing any D3 code |
| Next.js page integration | Pitfall 2 (SSR crash) | Use `dynamic({ ssr: false })` as the first thing before any Canvas/D3 code |
| Canvas 3D renderer port | Pitfall 3 (DPR blurriness) | Port `resize()` as a `ResizeObserver` in `useEffect` on day one |
| Canvas 3D renderer port | Pitfall 4 (animation leak) | Add `cancelAnimationFrame` cleanup immediately when porting `animate()` |
| Canvas 3D renderer port | Pitfall 17 (globalAlpha leak) | Wrap per-node draws in `ctx.save()/restore()` |
| 2D/3D toggle | Pitfall 6 (position loss) | Design the `display: none` toggle and shared node ref before implementing either renderer |
| 2D/3D toggle | Pitfall 13 (stale closure) | Use `useRef` for all animation loop inputs from the start |
| Node interaction | Pitfall 7 (hit test DPR) | Write a single `getCanvasPoint()` utility function and use it everywhere |
| Performance | Pitfall 9 (simulation thrash) | Pre-tick and `theta` tuning before user testing; defer until real data volume is known |
| Export feature | Pitfall 8 (blank snapshot) | Use `html2canvas` + pause/draw/resume pattern; test on HiDPI screen |

---

## Sources

- Direct analysis of `3d_mindmap_fixed.html` (project source, 2026-04-09)
- D3.js v7 source and API reference (d3js.org) — HIGH confidence
- React 18 `useEffect` / `useRef` patterns — HIGH confidence (training data + React docs)
- Next.js App Router `dynamic` import API — HIGH confidence (Next.js docs, verified against Next.js 14/15)
- Canvas 2D API (`setTransform`, `globalAlpha`, `toDataURL`) — HIGH confidence (MDN Web Docs)
- `html2canvas` v1.x + `jspdf` v2.x export pattern — MEDIUM confidence (community-verified pattern, library docs)
- D3 force performance tuning (`.theta()`, pre-ticking) — HIGH confidence (D3 force documentation)
