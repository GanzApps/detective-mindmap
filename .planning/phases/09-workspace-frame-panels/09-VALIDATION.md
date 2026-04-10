---
phase: 09
slug: workspace-frame-panels
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 09 - Validation Strategy

> Per-phase validation contract for the workspace frame and persistent panel rebuild.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `pnpm test -- --runInBand src/__tests__/app-shell.test.tsx src/components/layout/__tests__/WorkspacePanels.test.tsx` |
| **Full suite command** | `pnpm exec tsc --noEmit && pnpm test -- --runInBand && pnpm build` |
| **Estimated runtime** | ~150 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --runInBand src/__tests__/app-shell.test.tsx src/components/layout/__tests__/WorkspacePanels.test.tsx`
- **After every plan wave:** Run `pnpm exec tsc --noEmit && pnpm test -- --runInBand && pnpm build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 150 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|--------|
| 09-01-01 | 01 | 1 | SHELL-08 / WS-07 / WS-08 | Left rail tabs and grouped filters render without breaking evidence selection flow | unit | `pnpm test -- --runInBand src/__tests__/app-shell.test.tsx src/components/layout/__tests__/WorkspacePanels.test.tsx` | pending |
| 09-02-01 | 02 | 2 | ANALYSIS-01 / ANALYSIS-02 / WS-09 | Right panel and minimap integrate without obscuring graph ownership boundaries | unit | `pnpm test -- --runInBand src/__tests__/app-shell.test.tsx src/components/layout/__tests__/WorkspacePanels.test.tsx` | pending |
| 09-03-01 | 03 | 3 | WS-11 / SHELL-08 | Timeline collapsed shell and persistent bands hold through type/build/test verification | integration | `pnpm exec tsc --noEmit && pnpm test -- --runInBand && pnpm build` | pending |

---

## Wave 0 Requirements

- [ ] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Right panel idle state feels calm rather than empty or distracting | ANALYSIS-01 | Requires visual judgment | Open workspace with no selection; confirm the right panel preserves structure without competing with the graph |
| Timeline collapsed state still reads as first-class | WS-11 | Requires visual judgment | Load workspace; confirm timeline is visibly present with clear affordance before expansion |
| Minimap is quiet but continuously useful | WS-09 | Requires visual judgment | Confirm bottom-right minimap is always visible and does not dominate the graph |

---

## Validation Sign-Off

- [ ] All tasks have automated verification or explicit manual checks
- [ ] Sampling continuity maintained across all plan waves
- [ ] No watch-mode commands
- [ ] Feedback latency < 150s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
