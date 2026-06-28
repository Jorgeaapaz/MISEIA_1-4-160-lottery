@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Quantitative Justification for Technical Decisions

## Role
Act as a Software Architect expert in performance analysis, cost estimation, and technical decision justification.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issue fixed by this task:
- `dc_justificacion_cuantitativa` — No technical decision is backed by numbers (benchmarks, latency measurements, cost comparisons)

## Task
Add a `## Technical Benchmarks & Decision Justification` section to `README.md` (or create `docs/benchmarks.md`) with at least 2 quantitative justifications:

### Required justifications:

**1. MongoDB Singleton Connection Pool**
- Measure: Run `npm run dev`, make 100 concurrent requests to `/api/lotteries`, measure response time WITH singleton vs hypothetical per-request connection
- Expected result: Singleton ~50-80ms p95 vs per-request ~200-400ms p95 (connection overhead)
- If live measurement not feasible: document the connection overhead from MongoDB driver docs (~50ms TCP handshake + auth round-trip) and justify the singleton decision

**2. Magic Link JWT Expiration (15 min)**
- Compare 3 options: 5 min (too short — UX friction), 15 min (chosen), 60 min (security risk)
- Quantify: Email delivery latency median = ~2-5 seconds; user action time = ~60-120 seconds; 15 min provides 10x safety margin
- Reference OWASP recommendation for magic link TTL

**3. Server Component vs Client Component (response time)**
- Server Component fetches from MongoDB directly: no client round-trip = ~0ms added latency
- Client Component would require: render → fetch → re-render cycle = +100-300ms on slow connections
- Justify using Next.js App Router performance model

### justificacion_cuantitativa Guidelines
- Use real measurements where possible (run `curl` timing, browser DevTools)
- Where live measurement is not feasible, use documented performance characteristics from official sources
- Include the measurement methodology (how you measured it)
- Format as a table when comparing options

## Output format
Updated `README.md` with `## Technical Benchmarks & Decision Justification` section containing:
- At least 2 quantitative comparisons
- Measurement methodology for each
- Conclusion linking measurement to the decision made

## Steps to follow
1. Run `npm run dev` and use `curl -o /dev/null -w "%{time_total}"` to measure API latency
2. Document the measurements in a table
3. Research MongoDB connection latency from official driver docs
4. Write the section in README

## Output checklist and Guardrails
- [ ] README has `## Technical Benchmarks & Decision Justification` section
- [ ] At least 2 quantitative comparisons with actual numbers
- [ ] Each comparison explains what was measured and how
- [ ] Numbers are linked to a specific technical decision
- [ ] No fabricated data — if measured, state the measurement; if from docs, cite the source
- [ ] `npm run lint` passes
