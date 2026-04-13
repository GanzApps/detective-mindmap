---
phase: 10
slug: graph-visual-language-search-focus
status: draft
created: 2026-04-13
---

# Phase 10 - UI Design Contract

> Visual and interaction contract for graph semantics, search commit flow, and focused-network readability.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | existing codebase + shell tokens + graph semantic colors |
| Theme base | shell tokens from Phase 8, semantic graph colors separate |
| Graph emphasis | shape + color together, not color alone |
| Search surface | typeahead dropdown embedded in the existing graph toolbar area |

---

## Search Contract

| Element | Contract |
|---------|----------|
| Search input | typing updates suggestions only |
| Suggestions | explicit dropdown or list surfaced near the input |
| Selection | selecting a result commits graph focus |
| While typing | no automatic camera jump or network refocus |
| After selection | selected node and connected network become primary |

---

## Focus Contract

| Element | Contract |
|---------|----------|
| Selected node | strongest emphasis state |
| Connected network | clearly readable secondary emphasis |
| Unrelated nodes | remain visible but dimmed |
| Unrelated edges | dimmed more aggressively than nodes |
| Right panel | continues to own the primary details surface |

---

## Label Density Contract

| Element | Contract |
|---------|----------|
| Node labels | visible by default |
| Edge labels | selective only |
| Focused network | edge labels may appear when useful |
| Resting graph | labels should feel informative, not crowded |

---

## Semantic Shape Contract

| Entity Type | Shape Direction |
|-------------|-----------------|
| person | rounded avatar-like node |
| location | pin / marker-style node |
| organization | square / structured block node |
| evidence / transaction | document-card node |
| event | diamond / signal node |
| vehicle | keep distinct from evidence and person; circular badge is no longer enough |
| digital | distinct from vehicle and person; should read as technical artifact |

### Rule

Outer silhouette must carry the primary type signal. Internal icon/glyph can reinforce it but must not be the only differentiator.

---

## Semantic Color Contract

| Entity Type | Color Family |
|-------------|--------------|
| person | purple |
| location | green |
| organization | indigo / neutral-accent |
| evidence / transaction | orange |
| vehicle | cyan / sky |
| digital | blue |
| event | rose / coral |

### Rule

Graph semantic colors must remain visually distinct from shell accent purple used for product controls and tabs.

---

## Checker Sign-Off

- [ ] Search is typeahead-first, not immediate-focus
- [ ] Selected node and connected network read clearly
- [ ] Default graph remains readable with labels on
- [ ] Semantic shapes are recognizable without relying on color alone
- [ ] 3D receives only the semantic carryover appropriate for Phase 10

**Approval:** pending
