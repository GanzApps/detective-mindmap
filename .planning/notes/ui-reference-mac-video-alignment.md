---
title: "UI reference alignment from MAC video"
date: "2026-04-10"
context: "Video review of C:/Users/OeganZ/Downloads/2026-04-09.mp4 for dashboard layout, positioning, and interaction alignment."
source_type: "video"
source_path: "C:/Users/OeganZ/Downloads/2026-04-09.mp4"
---

# UI Reference Alignment Snapshot

## Purpose

Capture the key UI, UX, and layout signals from the MAC reference video so future planning and implementation can align to the same source without repeatedly re-watching the recording.

## Key Screens Observed

### Dashboard frame

- Centered content area inside a large, quiet page canvas
- Lightweight top navigation with breadcrumb/tab feel
- Primary page title and short supporting subtitle
- Summary KPI row before any list content
- Search and segmented filters in one horizontal control strip
- Investigation cards arranged in a clean multi-column grid
- Single strong CTA centered near the bottom of the content area

### Card interaction state

- Card hover increases elevation subtly
- Hover/focus state shifts border/shadow rather than changing overall layout
- Priority/status pill stays compact and lightweight
- Metadata remains secondary and quiet

## Layout Principles

- Use a restrained max-width container rather than a full-bleed app shell
- Preserve a clear top-to-bottom reading order:
  1. navigation
  2. title/subtitle
  3. KPI summary
  4. search and filters
  5. content grid
  6. primary CTA
- Keep generous whitespace between layout bands
- Favor stable card dimensions and consistent horizontal alignment
- Reduce simultaneous control density on screen

## Visual Language

- Calm, productized dashboard feel rather than a dense forensic tool aesthetic
- Quiet surfaces with soft borders and light elevation
- One bright accent color reserved for selection and primary actions
- Typography hierarchy is simple and explicit:
  - bold page title
  - muted subtitle
  - medium card titles
  - small secondary metadata
- Status is communicated with small pills rather than large alert treatments

## Interaction Guidance

- Search and filtering should feel immediate and low friction
- Hover states should clarify affordance without adding visual noise
- The primary action should be visually isolated and easy to find
- Secondary controls should be grouped and visually minimized
- If AI chat is introduced, it should feel like part of the shell and investigation workflow, not a detached generic chatbot

## Theme Direction

- The product should support both light and dark themes
- Light mode should preserve the calm, spacious hierarchy seen in the reference
- Dark mode should keep clear separation between:
  - page background
  - panel background
  - elevated card surfaces
- Theme support should be systematic, not per-component overrides

## Product Positioning Implication

The reference positions the product as an organized investigation dashboard first, with structured data views and approachable interactions. Our current app is more graph-first and tool-like. Alignment work should move the shell toward a calmer dashboard experience while keeping graph functionality available where it adds value.

## Translation For This App

### Should align closely

- Case list/dashboard page structure
- Overall spacing system
- KPI summary cards
- Search and filter bar styling
- Investigation card design and hover behavior
- Placement and emphasis of primary CTA
- Shared visual system for light and dark themes

### Should adapt, not copy literally

- Graph workspace shell
- AI assistant/chat surface
- Evidence and timeline controls
- Dense graph interactions that require desktop-oriented tooling

## Execution Guardrails

- Do not re-analyze the full video for every UI task
- Treat this note as the compact source of truth for layout alignment
- Revisit the video only when an interaction or placement detail is ambiguous
- Preserve the distinction between:
  - outer shell/dashboard alignment
  - inner graph workspace complexity

## Suggested Planning Impacts

- Add shell revamp requirements before implementation starts
- Define a shared design token layer that supports light/dark themes
- Plan AI chat placement as part of shell information architecture
- Review graph workspace density so it fits within the calmer visual system
