---
phase: 08
slug: design-tokens-shell-alignment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 08 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `pnpm test -- --runInBand src/__tests__/app-shell.test.tsx src/components/layout/__tests__/CaseHeader.test.tsx` |
| **Full suite command** | `pnpm exec tsc --noEmit && pnpm test -- --runInBand && pnpm build` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --runInBand src/__tests__/app-shell.test.tsx src/components/layout/__tests__/CaseHeader.test.tsx`
- **After every plan wave:** Run `pnpm exec tsc --noEmit && pnpm test -- --runInBand && pnpm build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | SHELL-06 / THEME-01 | - | Shared token layer is centralized and non-destructive | unit | `pnpm test -- --runInBand src/__tests__/app-shell.test.tsx` | ✅ | ⬜ pending |
| 08-02-01 | 02 | 2 | SHELL-06 | - | Shell refactor preserves route/page composition | unit | `pnpm test -- --runInBand src/__tests__/app-shell.test.tsx` | ✅ | ⬜ pending |
| 08-03-01 | 03 | 3 | THEME-01 | - | Theme-aware shell passes build and shell-level tests | integration | `pnpm exec tsc --noEmit && pnpm test -- --runInBand && pnpm build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Light/dark shell readability | THEME-01 | Visual hierarchy must be judged by eye | Toggle themes on dashboard and workspace, confirm spacing, surface separation, and accent usage stay coherent |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
