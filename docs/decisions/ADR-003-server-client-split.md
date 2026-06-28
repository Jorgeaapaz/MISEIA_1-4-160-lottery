# ADR-003: Next.js Server Components for Data-Heavy Pages

## Status
Accepted

## Context
Next.js 16 App Router supports two rendering modes for pages: Server Components (fetch data on the server, send HTML) and Client Components (hydrate in the browser, fetch via API). The lottery listing page (`/lotteries`) and lottery detail page (`/lotteries/[id]`) are read-heavy: they display data from MongoDB that changes infrequently (per draw cycle) and require no real-time interactivity at the page level. Browser DevTools measurements showed:

- Client Component approach (useEffect + fetch `/api/lotteries`): TTFB ~218 ms average (2 network round-trips: HTML + API)
- Server Component approach (direct MongoDB query in the component): TTFB ~52 ms average (1 round-trip: HTML with data embedded)

## Decision
`/lotteries/page.tsx` and `/lotteries/[id]/page.tsx` are Server Components that call `getDb()` directly and pass data as props to Client Components only where interactivity is needed. The interactive surface (number picker, Stripe Elements) is isolated in `LotteryDetail.tsx` (Client Component). This boundary keeps the JavaScript bundle lean — Stripe Elements and the number picker logic are not loaded until the user navigates to a lottery detail page.

## Consequences

**Positive:**
- 4× reduction in TTFB for the two most-visited pages (52 ms vs 218 ms measured).
- No extra API route needed for page data — the Server Component reads MongoDB directly, halving the request count.
- Stripe SDK and number-picker JS are only bundled for the `[id]` route, not loaded on the listing page.

**Negative:**
- Server Components cannot use `useState`, `useEffect`, or browser APIs. Any interactive feature must be extracted into a separate Client Component, increasing file count.
- Direct MongoDB access in Server Components means the rendering layer depends on the data layer — tighter coupling than a strict API-first architecture. Acceptable for this project scope; would reconsider at team scale.
