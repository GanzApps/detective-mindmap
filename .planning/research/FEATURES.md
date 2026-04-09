# Feature Landscape: Detective Case Investigation Platform

**Domain:** Link analysis / investigation board / OSINT visualization
**Researched:** 2026-04-09
**Confidence:** MEDIUM — based on training data from Maltego, i2 Analyst's Notebook, Palantir Gotham, CaseMap, Gephi, and OSINT community documentation. WebSearch unavailable; specific version details may have shifted.

---

## Reference Products Surveyed

| Product | Category | Relevance |
|---------|----------|-----------|
| Maltego (Paterva) | OSINT / link analysis | Direct competitor, entity-graph-first |
| i2 Analyst's Notebook (IBM) | Intelligence analysis | Gold standard for LE and intelligence community |
| Palantir Gotham | Enterprise intelligence | Feature ceiling reference, not the target |
| CaseMap (LexisNexis) | Litigation analysis | Timeline and facts board patterns |
| Gephi | Open-source network analysis | Graph interaction patterns |
| Hunch.ly / SpiderFoot | OSINT collectors | Evidence ingestion patterns |
| Kumu.io | Relationship mapping (lightweight) | Web-based graph UX patterns |

---

## Table Stakes

Features users expect from any investigation board. Missing = product feels unfinished or unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Entity nodes with type labels | Every investigation tool shows typed entities (person, org, location, phone, etc.) | Low | Types drive icon/color coding; Maltego uses this as its core model |
| Edge connections with relationship labels | Connections must be labeled ("owns", "called", "associates with") — unlabeled graphs lose meaning fast | Low | Direction matters; bidirectional vs one-way is a common source of confusion |
| Node selection + detail panel | Click a node, see all its properties in a side panel | Low | The "inspect entity" pattern is universal across all tools |
| Multi-select and bulk operations | Investigators select groups of nodes to delete, group, or annotate | Medium | Keyboard modifier (Shift+click, lasso select) expected; missing = frustrating daily use |
| Evidence file sidebar / case library | Investigators need to see what raw evidence has been loaded and navigate to it | Low | Maltego calls these "entities"; Analyst's Notebook has an "item list" |
| Case metadata header | Case name, status, date, assigned investigator visible at a glance | Low | Standard in every LE-facing tool; sets investigation context |
| Pan + zoom on the graph canvas | Expected by anyone who has used any graph tool or mapping app | Low | D3.js zoom + pan is baseline; must be smooth at 100+ nodes |
| Node search / filter | "Find entity by name or attribute" — essential when graphs grow beyond 30 nodes | Low-Med | Instant filter highlighting vs. filter-to-show-only are two patterns; both expected |
| Save / restore investigation state | Work must persist between sessions | Low-Med | v1 uses localStorage; users will expect this even without accounts |
| Export / share | Report generation, screenshot, PDF, or data export to hand off findings | Medium | Analyst's Notebook exports to PDF + Excel; Maltego exports to graph formats |
| Entity / connection count stats | "How many nodes are in this graph?" — investigators track scope | Low | Toolbar badge; present in all tools |
| Zoom to fit / reset view | After navigation the user needs a "home" button | Low | Standard graph UX; missing = navigation dead ends |
| Timeline view | Chronological placement of events; critical for establishing sequence of crime | Medium | i2 Analyst's Notebook's timeline is a signature feature; CaseMap is timeline-first |
| Node color / icon coding by type | Visual distinction between people, phones, locations, organizations | Low-Med | Without this, graphs of 20+ nodes become unreadable |
| Undo / redo | Investigators make mistakes adding connections; must be recoverable | Medium | Often missed in v1 builds; causes loss of trust when missing |
| Keyboard shortcuts for common actions | Power users doing 4+ hours of investigation work daily expect shortcuts | Low | Delete key, Escape to deselect, Ctrl+Z undo |

---

## Differentiators

Features that set a product apart. Not expected by default, but valued when present — and often the reason a team chooses one tool over another.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 2D / 3D view toggle (same data) | Spatial 3D view surfaces clusters and hierarchies invisible in flat 2D layout — no other lightweight web tool does this | Medium | This project's core differentiator; the 3D mindmap reference already exists as HTML |
| AI command bar for natural language queries | "Show me everyone who called John in the last 30 days" — dramatically lowers the skill floor | High | Placeholder in v1; the differentiator value is the UX pattern, not the AI |
| Automatic layout algorithms (force, hierarchical, radial) | Investigators choose layout per investigation type — hierarchy for org structures, force for networks | Medium | D3.js supports multiple layout modes; most lightweight tools only offer force |
| Entity clustering / grouping | Visually group related entities (e.g., "this cluster is the drug distribution network") | Medium | Maltego has "grouping"; valuable for presenting findings to non-technical stakeholders |
| Path finding between nodes | "Show me the shortest path between Person A and Organization B" — core OSINT analytical question | High | Breadth-first search on graph; visually highlights the path; signature Maltego feature |
| Timeline ↔ graph sync | Clicking an event on the timeline highlights the involved nodes in the graph | High | Strong analytical value; i2 Analyst's Notebook does this; rare in lightweight tools |
| Evidence file preview in sidebar | Click an evidence file and see a preview (image, PDF page, text snippet) without leaving the app | Medium | Reduces context switching; most lightweight tools force you to open external apps |
| Edge weight / strength visualization | Thicker edges = more interactions; communicates relationship intensity without needing to read labels | Medium | Useful for communication analysis (call records); not common in lighter tools |
| Annotation / notes on nodes and edges | Investigators need to attach notes like "verified alias confirmed by informant" | Low-Med | Persistent notes on graph elements; distinct from the evidence sidebar |
| Version / snapshot history | Save named snapshots of investigation state at key moments ("Day 1 graph", "After search warrant") | Medium | CaseMap does this for litigation timelines; rare in graph tools |
| Case comparison / merge | Import two cases and merge their graphs to find cross-case connections | High | Powerful for organized crime investigations; Palantir Gotham's signature capability at scale |
| Custom entity types | Investigators define their own entity types ("Vessel", "Container", "Bitcoin Wallet") beyond the defaults | Medium | Maltego allows custom entities; makes the tool domain-agnostic |
| Relationship strength scoring | Assign confidence levels to connections ("confirmed", "suspected", "rumored") | Low-Med | Standard in intelligence tradecraft (ACH - Analysis of Competing Hypotheses); rare in tools |
| Dark theme by default | Investigation professionals work in low-light environments; dark theme is not aesthetic preference, it is a requirement | Low | The UI reference is already dark-themed; must be maintained |
| Minimap / overview panel | Small overview of the full graph when zoomed in deep | Medium | Standard in large diagram tools (draw.io, Visio); absent in most lightweight graph tools |

---

## Anti-Features

Things to deliberately NOT build — either because they increase complexity without proportional value, or because they pull the product away from its core use case.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time collaboration (v1) | WebSocket sync + conflict resolution is a multi-week feature that adds infrastructure complexity; small teams share asynchronously via export | Ship export-first; add collaboration in v2 when team workflows are validated |
| Authentication / user accounts (v1) | Auth adds a full identity management surface; small teams sharing one instance don't need per-user accounts yet | Single shared instance; defer auth to v2 when multi-team or SaaS model is needed |
| Automatic data ingestion connectors | Maltego-style transforms (auto-pull from public APIs) are an entire platform; building them in v1 splits focus | Accept structured data import (CSV/JSON); let users prepare their own data files |
| AI-generated connections | Automatically suggesting edges based on data analysis sounds powerful but creates false positives that contaminate evidence graphs — legally dangerous | AI can suggest but investigator must explicitly confirm every connection |
| Full-featured timeline editor | A timeline that can be edited, annotated, and exported as a standalone deliverable is a separate product (CaseMap is built around this) | Timeline in v1 is display-only: shows events on a bar, highlights nodes; no creation UI yet |
| Mobile-responsive layout | Force graph with drag-to-connect and multi-select does not translate to touch; attempting it results in a broken desktop AND broken mobile | Declare desktop-only; invest in canvas interaction quality instead |
| PDF report templating | A polished report template engine with logo, headers, narrative sections is a professional services feature | Export graph snapshot + raw data; let investigators write their own narrative around it |
| Plugin / extension marketplace | Maltego's transform marketplace works because Maltego has 10+ years of ecosystem; a v1 extension system will have zero extensions and adds architectural complexity | Build the core well; plugin architecture can emerge from real usage patterns in v2/v3 |
| Geospatial map view | Location entities on a real map (like Google Maps) is a different visualization paradigm requiring map tile infrastructure | Show location as a node type in the graph; add map view only if investigators specifically request it |

---

## Feature Dependencies

```
Entity node rendering
  └─> Node type system (icons, colors)
        └─> Entity detail panel (shows typed properties)
        └─> Node filter / search (filters by type or attribute)
        └─> Custom entity types (extends the type system)

Edge rendering
  └─> Edge label system
        └─> Relationship type vocabulary
        └─> Edge strength / weight visualization
        └─> Relationship confidence scoring

Graph canvas (2D)
  └─> Pan + zoom
        └─> Zoom to fit
        └─> Minimap
  └─> Node selection
        └─> Multi-select
        └─> Bulk operations
  └─> Force layout
        └─> Alternative layout algorithms

2D graph data model
  └─> 3D graph view toggle (same data, different renderer)

Timeline bar
  └─> Timeline ↔ graph sync (clicking timeline highlights nodes)

Evidence sidebar
  └─> Evidence file preview (extends sidebar)

Save state (localStorage)
  └─> Snapshot / version history (extends save state)
  └─> Undo / redo (extends state management)

Export
  └─> PDF report (extends export)
  └─> Case share link (extends export)
```

---

## MVP Recommendation

Given the v1 scope (mock data, no backend, small team, single instance), prioritize this feature set:

**Must ship in v1:**
1. Entity nodes with type coding (icon + color by type)
2. Edge connections with labels and direction
3. Node click detail panel
4. Graph canvas: pan, zoom, zoom-to-fit
5. Multi-select + lasso select
6. Node search / highlight by name
7. Evidence file sidebar (categories + file list)
8. Case metadata header (name, status)
9. Entity / connection count in toolbar
10. Filters and layers panel (show/hide by entity type)
11. Timeline display bar (read-only, event markers)
12. 2D / 3D view toggle (core differentiator — must be in v1)
13. Export: graph snapshot (PNG/PDF)
14. Save to localStorage

**Defer to v2 (after validating workflow):**
- Undo / redo — important but complex; ship after core graph CRUD is stable
- Annotation / notes on nodes — valuable but secondary to graph structure
- Evidence file preview — nice to have; sidebar file list is sufficient for v1
- Path finding — high analytical value but medium-high complexity; v2 when real data arrives
- Timeline ↔ graph sync — high value, high complexity; needs real timeline data to test
- Snapshot / version history — depends on real usage patterns
- Edge weight visualization — needs real data density to validate the need

**Explicitly out of scope (not just deferred — deliberate product boundary):**
- Real-time collaboration
- Authentication
- AI-generated connections
- Geospatial map view
- Plugin marketplace
- Data ingestion connectors (transforms)

---

## Competitive Positioning

This product sits between two tiers:

| Tier | Products | Gaps This Product Fills |
|------|----------|------------------------|
| Heavy enterprise | i2 Analyst's Notebook, Palantir Gotham | Too expensive ($1,000+/seat/year), thick client or enterprise infra, overkill for small teams |
| Lightweight web | Kumu.io, Coggle, simple mind map tools | Not investigation-specific; no timeline, no evidence sidebar, no dark LE-facing UX |

The 3D toggle is the one feature that neither tier offers cleanly in a web-based package. It is the primary differentiator to protect.

---

## Confidence Notes

| Area | Confidence | Reason |
|------|------------|--------|
| Table stakes feature list | MEDIUM-HIGH | Maltego, i2, and Analyst's Notebook are well-documented; features consistent across training data sources |
| Differentiators | MEDIUM | Based on gap analysis of known tools; competitive landscape may have new entrants not in training data |
| Anti-features | HIGH | These are deliberate product boundary decisions grounded in complexity/value analysis, not market data |
| Complexity estimates | MEDIUM | Relative estimates based on D3.js + Next.js context; actual sprint sizing needed |
| Competitive positioning | LOW-MEDIUM | Market may have shifted; no live competitor research possible (WebSearch unavailable) |

---

## Sources

- Training data: Maltego documentation and feature changelog (knowledge cutoff August 2025)
- Training data: IBM i2 Analyst's Notebook product documentation
- Training data: Palantir Gotham public feature descriptions
- Training data: CaseMap / NuLaw litigation analysis tool documentation
- Training data: Gephi network analysis community documentation
- Training data: Kumu.io feature set and blog posts
- Training data: OSINT Community (OSINT Framework, Bellingcat methodology documentation)
- Project context: C:/workspace/ai-learn/3d graph mindmap/.planning/PROJECT.md
- Note: WebSearch was unavailable; all findings are from training data. Mark competitive positioning claims as LOW confidence and verify before using in marketing materials.
