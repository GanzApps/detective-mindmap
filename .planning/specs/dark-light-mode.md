# Spec: Dark / Light Mode Toggle

## Objective

The app is hardcoded to dark theme (`data-theme="dark"` on `<html>`). Detectives should be able to switch to light mode and have that preference persist across sessions.

**User story:** As a detective, I can click a toggle in the toolbar to switch between dark and light themes. My preference is remembered when I close and reopen the app.

**Success looks like:**
- Toolbar has a sun/moon icon button that toggles between dark and light
- Theme switches instantly — no full page reload
- Preference survives page refresh (stored in `localStorage`)
- No flash of wrong theme on load (inline script in `<head>` applies theme before first paint)
- OS `prefers-color-scheme` is ignored — default is always dark, user manually picks
- All existing CSS token colors look correct in both themes (tokens already defined)

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · No new dependencies

## Commands

```bash
pnpm dev
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

## Project Structure

Affected files only:
```
src/app/
  layout.tsx            — add no-flash inline script; remove hardcoded data-theme="dark"

src/hooks/
  useTheme.ts           — new hook: read/write theme to localStorage + apply to <html>

src/components/layout/
  CaseWorkspaceShell.tsx — add theme toggle button to toolbar

src/hooks/__tests__/
  useTheme.test.ts      — tests for hook behavior
```

## Behavior Specification

### No-flash inline script

Add a `<script>` tag in `layout.tsx` `<head>` that runs synchronously before React hydrates:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        var t = localStorage.getItem('shell-theme');
        document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
      })();
    `,
  }}
/>
```

- `suppressHydrationWarning` stays on `<html>` (already present)
- Remove the hardcoded `data-theme="dark"` from the JSX — the script sets it

### `useTheme` hook

```typescript
// src/hooks/useTheme.ts
'use client';

import { useCallback, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
const STORAGE_KEY = 'shell-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Sync from DOM on mount (the no-flash script may have already set it)
  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') setThemeState('light');
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
```

### Toolbar toggle button

In `CaseWorkspaceShell`, call `useTheme()` and add an icon button to the toolbar (right group, same row as 2D/3D + Minimap + Export):

```tsx
// Sun icon when dark (click → go light), Moon icon when light (click → go dark)
<button
  type="button"
  onClick={toggleTheme}
  className="rounded p-1 text-shell-text-muted transition hover:bg-shell-surface-raised hover:text-shell-text-secondary"
  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {theme === 'dark' ? <SunIcon /> : <MoonIcon /> }
</button>
```

Use inline SVG paths (no icon library). Sun icon: circle + 8 rays. Moon icon: crescent.

### Position in toolbar

Insert the theme toggle at the **far right** of the right-side button group in `CaseWorkspaceShell`, after the Minimap toggle:

```
[ 2D | 3D ]  [ Export ]  [ + Entity ]  [ Minimap ]  [☀/☾]
```

## Code Style

Follow existing shell patterns:
- Hook in `src/hooks/` (alongside any future hooks)
- `'use client'` directive on the hook
- Inline SVG, no icon library import
- Button style matches existing toolbar icon buttons (sidebar hamburger, same `rounded p-1 text-shell-text-muted` pattern)

## Testing Strategy

Framework: Jest + React Testing Library (jsdom), same as existing tests.

New test file: `src/hooks/__tests__/useTheme.test.ts`

Test cases:
- Defaults to `'dark'` when `localStorage` is empty
- Reads `'light'` from DOM on mount if no-flash script set it
- `toggleTheme()` switches dark → light, sets `data-theme` attribute, writes `localStorage`
- `toggleTheme()` switches light → dark, sets `data-theme` attribute, writes `localStorage`
- `setTheme('light')` writes both DOM and `localStorage`

Do NOT test the inline script (it runs outside React). Do NOT test CSS rendering.

## Boundaries

- **Always:** `pnpm exec tsc --noEmit` + `pnpm test` + `pnpm build` before marking done
- **Ask first:** Any change to the CSS token values in `globals.css`; adding a new icon library
- **Never:** Add a CSS-in-JS library or animation library for the theme switch. Never modify `ENTITY_TYPE_COLOR` graph constants — those are not themed.

## Success Criteria

- [ ] Theme toggle button visible in toolbar (sun = dark mode active, moon = light mode active)
- [ ] Clicking toggle switches theme instantly
- [ ] Refreshing the page preserves the chosen theme (no flash)
- [ ] Dark theme: looks identical to current app
- [ ] Light theme: all shell tokens render correctly (light values already defined in CSS)
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm test` passes (all existing + new hook tests)
- [ ] `pnpm build` passes

## Open Questions

None — all requirements confirmed.

---
*Created: 2026-04-17 · Feature: dark-light-mode*
