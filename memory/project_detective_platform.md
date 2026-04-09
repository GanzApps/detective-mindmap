---
name: Detective Investigation Platform Project
description: GSD project initialized for detective case investigation platform with Next.js, D3 2D graph, custom Canvas 3D mindmap
type: project
---

Building a Next.js detective case investigation board with:
- 2D D3.js force graph (main workspace)
- Toggle to 3D mindmap (ported from 3d_mindmap_fixed.html)
- Evidence sidebar, case management, export reports
- Small team use (2-5 people), no auth in v1

**Why:** Portfolio/learning project; user shared UI reference (image.png) and 3D mindmap HTML reference.

**How to apply:** When helping with this codebase, follow the architecture in .planning/ARCHITECTURE.md — pure functions in lib/graph/ first, CSS display:none toggle (not unmount), D3 simulation in useRef, dynamic({ ssr: false }) on all graph components.

Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, D3.js v7 (sub-modules only), Zustand 5, Zod 3, Jest + RTL.

GSD status: Project initialized, research complete, roadmap has 7 phases ready. Start with `/gsd-plan-phase 1`.
