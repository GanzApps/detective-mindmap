---
phase: 10
slug: graph-visual-language-search-focus
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 10 - Validation Strategy

> Per-phase validation contract for graph semantic styling and committed search-focus behavior.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `pnpm exec tsc --noEmit && pnpm exec jest src/components/graph/__tests__/GraphWorkspace.test.tsx src/__tests__/forceGraph2d.test.tsx --runInBand` |
| **Full suite command** | `pnpm exec tsc --noEmit && pnpm test -- --runInBand && pnpm build` |
| **Estimated runtime** | ~150 seconds |

---

## Sampling Rate

- **After every task commit:** run the quick graph-focused test set
- **After every plan wave:** run the full suite and build
- **Before `/gsd-verify-work`:** full suite must be green
- **Max feedback latency:** 150 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|--------|
| 10-01-01 | 01 | 1 | SEARCH-01 / SEARCH-02 | Typing search input does not auto-focus graph; selecting a suggestion does | unit | `pnpm exec tsc --noEmit && pnpm exec jest src/components/graph/__tests__/GraphWorkspace.test.tsx src/__tests__/forceGraph2d.test.tsx --runInBand` | pending |
| 10-02-01 | 02 | 2 | GRAPH2D-11 / GRAPH-STYLE-01 / GRAPH-STYLE-02 | 2D renderer applies semantic colors and iconic node silhouettes without breaking selection/hit testing | unit | `pnpm exec tsc --noEmit && pnpm exec jest src/__tests__/forceGraph2d.test.tsx --runInBand` | pending |
| 10-03-01 | 03 | 3 | WS-10 | Labels stay readable by default and selective edge labels hold through full app validation | integration | `pnpm exec tsc --noEmit && pnpm test -- --runInBand && pnpm build` | pending |

---

## Wave 0 Requirements

- [ ] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Search feels calm while typing and decisive on selection | SEARCH-01 / SEARCH-02 | Requires UX judgment | Type partial entity names and confirm the graph stays still until choosing a result |
| Semantic shapes are recognizable at a glance | GRAPH-STYLE-01 / GRAPH-STYLE-02 | Requires visual judgment | Inspect each entity family in the default graph state and confirm silhouette differences are obvious |
| Edge label density remains readable | WS-10 | Requires visual judgment | Verify focused paths gain enough label context without flooding the resting graph |

---

## Validation Sign-Off

- [ ] All tasks have automated verification or explicit manual checks
- [ ] Sampling continuity maintained across all plan waves
- [ ] No watch-mode commands
- [ ] Feedback latency < 150s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
