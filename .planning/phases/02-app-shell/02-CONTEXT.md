# Phase 2: App Shell - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the first navigable application shell: case list, case workspace route, header, evidence sidebar, Zustand-backed app state, and working CRUD flows for cases, entities, and connections.

</domain>

<decisions>
## Implementation Decisions

### Routing and Entry Flow
- **D-01:** `/` should redirect directly to `/cases`
- **D-02:** The case list route is the primary entry point for the application in v1

### Case List Presentation
- **D-03:** `/cases` should use a simple dashboard-style list with more visual hierarchy than a plain table
- **D-04:** The case list should feel like the beginning of the investigation workspace, not an admin CRUD screen

### Workspace Shell Fidelity
- **D-05:** Phase 2 should be functional first rather than visually matching the reference exactly
- **D-06:** Visual polish can be deferred as long as the shell structure is correct and the dark investigative direction is preserved enough for later phases

### CRUD Interaction Style
- **D-07:** Creation and deletion flows for cases, entities, and connections should be modal/dialog driven in Phase 2
- **D-08:** CRUD UI should prioritize clarity and control over speed-heavy inline editing in this phase

### Prior Decisions Carried Forward
- **D-09:** Graph area components must establish the `dynamic({ ssr: false })` pattern before any D3 or Canvas implementation
- **D-10:** All case data access continues through `caseRepository`; UI code should not import fixtures directly

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope
- `.planning/ROADMAP.md` - Phase 2 goal, success criteria, and plan inventory
- `.planning/REQUIREMENTS.md` - Phase 2 requirements: `SHELL-01` through `SHELL-04`, `CASE-01` through `CASE-06`, `ARCH-02`, `ARCH-03`
- `.planning/PROJECT.md` - Product direction, desktop-first constraints, and active requirements

### Existing Decisions
- `.planning/STATE.md` - Current phase focus and accumulated decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` - Shared graph/data constraints established in Phase 1
- `.planning/phases/01-foundation/01-VERIFICATION.md` - What Phase 1 already proved and what Phase 2 can assume

### UI and Architecture Guidance
- `.planning/research/ARCHITECTURE.md` - Recommended shell/component boundaries and state flow
- `.planning/research/STACK.md` - Stack guidance for Next.js, Zustand, and routing patterns
- `image.png` - Investigation-board visual reference for overall shell direction

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/data/caseRepository.ts` - Async repository boundary for case loading and listing
- `src/lib/data/mockCases.ts` - Seed data for the initial case list and workspace shell
- `src/lib/graph/graphTypes.ts` - Shared graph contracts that Phase 2 state and CRUD flows must preserve

### Established Patterns
- App Router structure already exists under `src/app/`
- Tailwind is configured and working after the Tailwind 4 PostCSS fix
- Jest is configured with a node-first pattern for pure utility testing

### Integration Points
- `src/app/page.tsx` should become the redirect entry into `/cases`
- New route files under `src/app/cases/` should own the list and workspace shell
- Zustand store should become the shared owner for case data, selected node, filters, and view mode

</code_context>

<specifics>
## Specific Ideas

- The case list should feel like a lightweight dashboard rather than a raw grid
- The workspace shell can stay structurally simple in Phase 2, but it should already suggest the darker investigation-board direction
- Modal-driven CRUD is preferred over inline mutation controls for this phase

</specifics>

<deferred>
## Deferred Ideas

- Exact visual fidelity to the `image.png` reference can be tightened in later graph/workspace phases
- Inline power-user editing flows are deferred until the shell and renderer foundation are in place

</deferred>

---

*Phase: 02-app-shell*
*Context gathered: 2026-04-09*
