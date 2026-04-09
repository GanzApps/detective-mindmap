# AGENTS.md

This repository uses the GSD workflow for Codex.

## What This Project Is

`3d graph mindmap` is a Next.js application for detective-style case investigation. The current product direction is a desktop-first visual workspace with:

- a 2D D3.js relationship graph
- a toggleable 3D mindmap / canvas view
- evidence navigation, filters, timeline, and case actions
- mock data in v1, with clean separation for future API wiring

## Source of Truth

Before changing behavior, read these files:

- `.planning/PROJECT.md`
- `.planning/STATE.md`
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`

If the work changes scope or phase, update the planning docs as part of the change.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Jest for tests

## Working Rules

- Prefer the GSD flow for meaningful changes instead of ad-hoc edits.
- For small fixes and docs updates, use the quick path.
- For bug investigation, use the debug path.
- For phase work, follow the execute-phase path and keep planning artifacts current.
- Keep 2D and 3D graph code separated from UI concerns so the graph logic stays testable.
- Preserve the desktop-first interaction model unless the planning docs change.

## Current Context

- The project is in Phase 1: Foundation.
- The repo already contains a Claude-oriented GSD install under `.claude/`.
- For Codex, this file is the local instruction entry point.

## When In Doubt

If a change affects the product definition, update `.planning/PROJECT.md` first.
If a change affects execution state, update `.planning/STATE.md` after the code change.
