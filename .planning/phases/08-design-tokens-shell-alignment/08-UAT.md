---
status: complete
phase: 08-design-tokens-shell-alignment
source:
  - 08-01-SUMMARY.md
  - 08-02-SUMMARY.md
  - 08-03-SUMMARY.md
started: 2026-04-10T00:00:00Z
updated: 2026-04-10T01:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. App default theme
expected: Open the app. The page background should be a restrained dark color (very dark grey/slate, not white and not neon). Body text should be light-coloured on the dark background. No broken layout or invisible text.
result: pass
note: "based on theme" — appearance correctly driven by active theme

### 2. Case list page — restrained shell framing
expected: The case list (dashboard) page shows a calmer, centered card layout — no heavy dark hero gradient. The "New Case" (or equivalent primary CTA) button appears purple/violet, not cyan. Case cards have subtle borders and hover effects.
result: pass

### 3. Investigation workspace — structured product shell
expected: Opening a case workspace, the outer shell feels like a product UI rather than a raw dark tool. Entity and connection panels have consistent surface styling (subtle borders, consistent background depth). The graph area remains the hero surface.
result: pass

### 4. Case header — CTAs and view toggle
expected: In the workspace, the header shows "Export Report" (capitalized, purple button), an "Actions" button (secondary/border style), and a "2D view"/"3D view" toggle where the active mode is highlighted in purple. All controls function as before.
result: pass

### 5. Evidence sidebar — consistent shell styling
expected: The evidence sidebar panel (if visible) uses the same surface/border styling as the rest of the shell — no raw cyan highlights or stark slate tones that look out of place compared to other panels.
result: pass

### 6. Timeline and AI Command bars — bottom bands
expected: The Timeline bar and AI Command bar at the bottom of the workspace use consistent shell styling — same surface treatment as other shell panels. No fuchsia gradient or raw slate backgrounds standing out against the shell.
result: pass

### 7. Light theme — switch and verify
expected: When the html element's data-theme attribute is set to "light" (e.g. via browser devtools: `document.documentElement.setAttribute('data-theme','light')`), the app switches to a light background with dark text. All surfaces update. The layout doesn't break.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
