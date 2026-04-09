# Phase 1: Foundation - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Initialize the Next.js project (with pnpm) and establish all shared TypeScript types, Zod schemas, mock case data, and the `caseRepository` interface. This phase delivers the type contract that every downstream phase imports. No UI. No rendering. Pure TypeScript foundation + Jest tests to verify correctness.

</domain>

<decisions>
## Implementation Decisions

### Project scaffold
- **D-01:** Phase 1 owns the full project scaffold: `create-next-app` with App Router, TypeScript, Tailwind CSS, `pnpm` as package manager
- **D-02:** Dependencies installed in Phase 1: `zod`, `jest`, `ts-jest`, `@types/jest`, `zustand` (scaffolded but used in Phase 2)
- **D-03:** `tsconfig.json` must have strict mode enabled (`"strict": true`) — no `any` on graph structures
- **D-04:** Jest configured with `ts-jest` for TypeScript support; `testEnvironment: 'node'` (lib/graph/ has no DOM dependency)

### EntityType taxonomy
- **D-05:** `EntityType` enum has exactly 7 values: `person | location | event | evidence | organization | vehicle | digital`
  - `person` — suspects, witnesses, associates
  - `location` — warehouses, drop points, addresses, meeting spots
  - `event` — incidents, transactions, meetings, arrests
  - `evidence` — physical items, documents, files
  - `organization` — criminal networks, companies, fronts
  - `vehicle` — cars, boats, aircraft used in the operation
  - `digital` — devices (phones, laptops), accounts, data sources
- **D-06:** Each `EntityType` maps to a color slot — the `C` palette from `3d_mindmap_fixed.html` (7 colors, one per type). Define the mapping in `lib/graph/graphTypes.ts` as `ENTITY_TYPE_COLOR` const so all renderers import from the single source of truth.

### Entity status
- **D-07:** `EntityStatus` enum: `suspect | confirmed | unknown`
- **D-08:** `EntityStatus` is a required field on `GraphNode` — no optional. Default in mock data is `unknown`.

### GraphNode schema
- **D-09:** `GraphNode` fields: `id: string` (UUID), `label: string`, `type: EntityType`, `status: EntityStatus`, `tier: number` (0=root, 1=branch, 2=leaf — same tier system as 3d_mindmap_fixed.html), `parent: string | null` (parent node ID or null for roots), `properties: Record<string, string>` (arbitrary key-value metadata for NodeDetailPanel)
- **D-10:** No z-coordinate or 3D position in `GraphNode` — 3D renderer assigns spatial positions at render time from tier/parent structure. This is the shared data contract for both 2D and 3D.

### GraphEdge schema
- **D-11:** `GraphEdge` fields: `id: string` (UUID), `source: string` (node ID), `target: string` (node ID), `label: string` (relationship description, e.g. "witnessed", "supplies to", "located at"), `strength: number` (0–1 float, default 1.0 — reserved for future edge weight visualization)

### GraphData container
- **D-12:** `GraphData = { nodes: GraphNode[]; edges: GraphEdge[] }` — the single type passed to both the 2D and 3D renderers

### Case and Evidence schemas
- **D-13:** `Case` fields: `id: string`, `name: string`, `description: string`, `status: 'active' | 'closed' | 'archived'`, `createdAt: string` (ISO date), `updatedAt: string` (ISO date), `graph: GraphData`
- **D-14:** `EvidenceFile` fields: `id: string`, `name: string`, `categoryId: string`, `type: 'device_data' | 'surveillance' | 'financial' | 'witness' | 'physical'`, `size: string` (human-readable, e.g. "2.3 MB"), `addedAt: string` (ISO date)
- **D-15:** `EvidenceCategory` fields: `id: string`, `name: string`, `files: EvidenceFile[]`
- **D-16:** All schemas defined with Zod first; TypeScript types inferred via `z.infer<typeof Schema>` — no manual type duplication

### Mock case data
- **D-17:** Mock case depicts a **drug trafficking network** investigation named "Operation Nightfall"
- **D-18:** Evidence categories use domain-specific names: "Device Data", "Surveillance", "Financial Records", "Witness Statements", "Physical Evidence" — 5 categories matching user selection
- **D-19:** Mock case must contain: 15+ entities across all 7 entity types, 20+ edges with varied relationship labels, at least 2-3 entities with `status: 'suspect'`, and `properties` bags with 2-3 realistic key-value pairs per node (e.g., `{ "phone": "+1-555-...", "alias": "El Jefe" }`)
- **D-20:** Mock data validated at import time with Zod `parse()` (throws on invalid data, not `safeParse`) — catches type regressions immediately during development

### caseRepository interface
- **D-21:** `CaseRepository` interface has exactly two methods: `fetchCase(id: string): Promise<Case>` and `listCases(): Promise<Case[]>`
- **D-22:** `mockCaseRepository` is the only implementation in Phase 1 — returns mock data wrapped in `Promise.resolve()`. Real API implementation deferred to v2.
- **D-23:** All data access in the app goes through `caseRepository` — components never import `mockCases.ts` directly

### Pure graph utilities (lib/graph/)
- **D-24:** `buildGraphFromCase(c: Case): GraphData` — pure function, extracts `c.graph` — exists to ensure the conversion layer is testable even when it's trivial
- **D-25:** `getConnectedIds(edges: GraphEdge[], nodeId: string): Set<string>` — returns IDs of all nodes connected to `nodeId` (direct neighbors only, not transitive). Used by both renderers for node highlighting.
- **D-26:** Zero DOM imports in `lib/graph/` — Jest tests run with `testEnvironment: 'node'`

### Claude's Discretion
- Exact file structure within `src/` vs `app/` directories (follow Next.js App Router conventions)
- UUID generation strategy for mock data (can use simple string literals like `"node-001"` in mock — no need for actual UUID lib in Phase 1)
- Exact jest.config.ts structure
- tsconfig path aliases (e.g., `@/lib` → `./src/lib`) — add if useful, skip if not

</decisions>

<specifics>
## Specific Ideas

- The 3D reference file (`3d_mindmap_fixed.html`) uses a `tier` system (0, 1, 2, 3) and `parent` field for node hierarchy. The `GraphNode` schema preserves this exactly so the 3D renderer port in Phase 3 can reuse the same data structure without transformation.
- The `C` color palette from `3d_mindmap_fixed.html` (4 color slots for tiers 0-3) needs to expand to 7 slots for entity types. This mapping should live in `graphTypes.ts` as a const — both Phase 3 (3D renderer) and Phase 4 (D3 2D) import from the same source.
- Mock case name: "Operation Nightfall" — realistic investigation feel for demos.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Reference implementation (3D renderer data model)
- `3d_mindmap_fixed.html` — Existing working 3D mindmap. Read this to understand the `tier`, `parent`, `id` conventions that `GraphNode` must preserve for the Phase 3 port. The NODES array and EDGES array at lines 73-106 define the exact shape the 3D renderer expects.

### Project requirements and constraints
- `.planning/REQUIREMENTS.md` — Phase 1 requirement IDs: DATA-01, DATA-02, DATA-03, ARCH-01, ARCH-04
- `.planning/PROJECT.md` — Core constraints: TypeScript strict mode, mock data swappable for API, no DOM in lib/graph/
- `.planning/ROADMAP.md` — Phase 1 success criteria (lines ~29-34): tsc passes, 15+ entities, caseRepository callable, Jest tests pass with no DOM

### Research context
- `.planning/research/STACK.md` — Zod schema-first pattern, D3 sub-module imports, Zustand setup
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, why 3D positions must NOT be in GraphNode

No external specs beyond project planning files — requirements are fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — this is Phase 1, greenfield project

### Established Patterns
- None yet — patterns are being established in this phase

### Integration Points
- `lib/graph/graphTypes.ts` → imported by every downstream phase (Phase 3 3D renderer, Phase 4 D3 graph, Phase 5 NodeDetailPanel, Phase 6 FilterPanel)
- `lib/data/caseRepository.ts` → imported by Phase 2 Zustand store (`useCaseData` hook)
- `lib/data/mockCases.ts` → imported ONLY by `mockCaseRepository` — never by components directly

</code_context>

<deferred>
## Deferred Ideas

- UUID library (e.g., `nanoid`) — Phase 2 if entity creation forms need client-side ID generation
- Additional EntityType values beyond the 7 defined — add to backlog if domain expands in v2
- `GraphEdge` direction flag (was considered, deferred to v2 per discussion) — add when directional arrow rendering is needed

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-09*
