# Investigation Workspace Revamp Model

## Source References

- `.planning/references/mac-ui-reference/2026-04-09.mp4`
- `.planning/references/mac-ui-reference/graph-view-selected-filters.png`

## Workspace Model

- Left rail handles evidence navigation and filters
- Center graph is the hero analysis surface
- Right panel handles selected-node and AI-result analysis
- Bottom timeline remains a first-class investigation surface
- Bottom command bar acts as an integrated command center

## Filter Model

- Left rail uses tabs:
  - `Raw Evidence`
  - `Filters & Layers`
- Filters & Layers groups:
  - entity types
  - connection layers
  - time range

## Graph Visual Model

- Entity types should be recognizable through both shape and color
- Approved shape direction:
  - person: rounded avatar-like node
  - location: pin / marker-style node
  - organization: square / structured block node
  - evidence or transaction: document/card-like node
  - event: diamond / signal-style node

## AI Surface

- AI command surface should look polished and integrated
- It should provide quick commands/chips and typed input
- First release should use known intents only
- Known intents should route into predefined graph/workspace actions
- AI-triggered outcomes can populate the right-side analysis panel

## Execution Guardrail

- Treat Phase 8 as shell groundwork only
- Do not claim the revamp is complete until workspace structure, graph semantics, 2D/3D parity, and AI routing are implemented in later phases

---
*Restored during planning repair on 2026-04-10*
