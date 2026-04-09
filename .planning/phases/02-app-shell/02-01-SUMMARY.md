# Plan 02-01 Summary

Phase 2 routing is established.

- Replaced the root placeholder with a redirect from `/` to `/cases`
- Added `/cases` and `/cases/[caseId]` route shells plus loading states
- Established the client-only `dynamic({ ssr: false })` pattern for the workspace route

Key files:
- `src/app/page.tsx`
- `src/app/cases/page.tsx`
- `src/app/cases/[caseId]/page.tsx`
- `src/app/cases/loading.tsx`
- `src/app/cases/[caseId]/loading.tsx`
