# Phase 8 Research

## Objective

Research what is needed to plan the shell/token foundation for the investigation workspace revamp.

## Key Findings

1. The current app has no real theme infrastructure yet. `src/app/globals.css` only imports Tailwind, so Phase 8 can introduce a proper token layer without unwinding existing CSS variables.
2. The current shell is heavily component-local and dark-mode-specific. `CaseListPage.tsx` and `CaseWorkspacePage.tsx` / `CaseWorkspaceShell.tsx` hardcode visual decisions, which makes a shared shell/token pass necessary before deeper UI rebuilds.
3. Shell tokens and graph semantics should be separated. The shell should use calm neutral surface/background/elevation tokens plus a purple accent, while graph/entity colors remain a later dedicated system so selection and entity meaning are not diluted.
4. The least risky route is CSS custom properties in `globals.css` with a theme attribute/class at the root, then Tailwind utility usage layered on top. That preserves the current codebase pattern while centralizing theme values.
5. Phase 8 should avoid redesigning graph internals. It should refactor only shell containers, top actions, and persistent bands so later phases can rebuild tabs, analysis panel, minimap, and graph styling on a stable foundation.

## Recommended Planning Implications

- Create a shared token map first: background, surface, elevated surface, text hierarchy, borders, accent, destructive, and spacing/radius/elevation scales.
- Touch the two entry surfaces in this phase:
  - `CaseListPage`
  - `CaseWorkspaceShell` / `CaseWorkspacePage`
- Keep existing graph logic intact while updating shell framing around it.
- Add or enable a theme toggle mechanism now so later phases do not build on a single hardcoded visual mode.

## Reusable Codebase Assets

- `src/components/pages/CaseListPage.tsx` - dashboard shell entry point
- `src/components/pages/CaseWorkspacePage.tsx` - workspace page wrapper
- `src/components/layout/CaseWorkspaceShell.tsx` - central shell composition layer
- `src/components/layout/CaseHeader.tsx` - header/action surface already exists and should be restyled, not replaced blindly
- `src/components/layout/TimelineBar.tsx` and `src/components/layout/AICommandBar.tsx` - persistent bands to align visually during this phase

## Validation Architecture

- Theme/tokens need both visual and structural verification.
- Quick feedback should come from targeted tests plus type/build checks.
- The phase should validate:
  - shared tokens exist centrally
  - dashboard and workspace use the same shell framing language
  - light and dark theme switching does not break layout or basic readability

## Risks

- Over-tokenizing too early could slow later graph-specific styling work
- Letting graph entity colors leak into shell token decisions will make the shell noisy
- Reworking shell layout and graph structure in the same plan would create unnecessary churn; this phase should stay shell-first
