# AGENTS.md

This repository uses the GSD workflow for Codex, plus 20 agent skills for structured development workflows.

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

## Agent Skills

This repo includes 20 agent skills from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) organized by lifecycle stage:

### Define
- **idea-refine** — Refine and validate project ideas before implementation
- **spec-driven-development** — Write specs before code

### Plan
- **planning-and-task-breakdown** — Break work into small, atomic tasks

### Build
- **incremental-implementation** — Build one slice at a time
- **context-engineering** — Manage agent context for complex projects
- **source-driven-development** — Write tests and source together
- **frontend-ui-engineering** — UI-specific workflows for React/Tailwind
- **test-driven-development** — Test-first development
- **api-and-interface-design** — Design APIs and interfaces before implementation

### Verify
- **browser-testing-with-devtools** — Browser-based testing with DevTools
- **debugging-and-error-recovery** — Systematic debugging workflows

### Review
- **code-review-and-quality** — Pre-merge quality checks
- **code-simplification** — Refactor for clarity over cleverness
- **security-and-hardening** — Security review and hardening
- **performance-optimization** — Performance review and optimization

### Ship
- **git-workflow-and-versioning** — Git branching, tagging, and versioning
- **ci-cd-and-automation** — CI/CD pipeline setup and automation
- **deprecation-and-migration** — Safe migration and deprecation
- **documentation-and-adrs** — Documentation and architectural decisions
- **shipping-and-launch** — Deploy to production safely

### Slash Commands
7 commands map to skill lifecycle stages:
- `/spec` — Define scope and requirements
- `/plan` — Break down implementation
- `/build` — Write code incrementally
- `/test` — Validate functionality
- `/review` — Pre-merge quality check
- `/code-simplify` — Refactor existing code
- `/ship` — Deploy to production

### Specialist Agents
3 specialist personas available for targeted reviews:
- **code-reviewer** — Senior Staff Engineer perspective (5-axis review)
- **test-engineer** — QA Specialist (coverage strategy, Prove-It pattern)
- **security-auditor** — Security Engineer (threat modeling, OWASP)

Skills are plain Markdown files in `.claude/skills/`. They auto-trigger based on context (e.g., UI work → `frontend-ui-engineering`) or via slash commands.

See `.claude/docs/` for tool-specific setup guides.

## Current Context

- **v2.0 Investigation Workspace Revamp** is complete and shipped (2026-04-14)
- 5 phases (8–12), 18 plans, 70 commits, 64/64 tests green
- Archive: `.planning/milestones/v2.0-ROADMAP.md`
- Next milestone to be defined via `/gsd-new-milestone`

## When In Doubt

If a change affects the product definition, update `.planning/PROJECT.md` first.
If a change affects execution state, update `.planning/STATE.md` after the code change.
