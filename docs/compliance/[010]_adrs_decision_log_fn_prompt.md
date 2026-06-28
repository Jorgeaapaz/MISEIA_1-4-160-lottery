@~/.claude/prompts/new_functionality_prompt_spec.md

# Create Architecture Decision Records (ADRs)

## Role
Act as a Software Architect expert in architecture documentation and ADR (Architecture Decision Records) methodology.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issue fixed by this task:
- `dc_adrs_o_decision_log` — No ADRs or decision log with context/decision/consequences

The README already documents 4 patterns (Singleton DB, Guard Pattern, Server/Client split, Webhook state machine). These need to be formalized as proper ADRs.

## Task
1. Create `docs/decisions/` directory
2. Create 4 ADR files in Markdown following the standard ADR template
3. Add a `## Architecture Decision Records` section to `README.md` linking to each ADR
4. ADRs to create:
   - `ADR-001-mongodb-singleton.md` — Why MongoDB Singleton over connection pooling per request
   - `ADR-002-magic-link-auth.md` — Why passwordless magic links over password/OAuth
   - `ADR-003-server-client-split.md` — Why Next.js Server Components for data pages
   - `ADR-004-stripe-webhook-state-machine.md` — Why webhook-driven state vs client-side confirmation

### adrs_decision_log Guidelines
Each ADR must follow this structure:
```markdown
# ADR-NNN: Title

## Status
Accepted

## Context
What situation or problem led to this decision?

## Decision
What was decided and why?

## Consequences
What are the positive and negative consequences of this decision?
```
- Each ADR must be specific to THIS project — no generic statements
- Context must mention a real constraint encountered (e.g., "serverless environments exhaust connections")
- Consequences must list at least 2 positive and 1 negative outcome

## Output format
- `docs/decisions/ADR-001-mongodb-singleton.md`
- `docs/decisions/ADR-002-magic-link-auth.md`
- `docs/decisions/ADR-003-server-client-split.md`
- `docs/decisions/ADR-004-stripe-webhook-state-machine.md`
- Updated `README.md` with links to ADRs

## Steps to follow
1. Read `README.md` section "Design Patterns / Architecture" to extract existing rationale
2. Read `lib/db.ts`, `lib/auth.ts`, `app/api/payments/webhook/route.ts` for technical details
3. Write each ADR expanding on the existing rationale with real context and consequences
4. Link all ADRs from `README.md`

## Output checklist and Guardrails
- [ ] 4 ADR files created in `docs/decisions/`
- [ ] Each ADR has Status, Context, Decision, Consequences sections
- [ ] Context references a specific technical constraint (not generic)
- [ ] Consequences have at least 2 positive + 1 negative per ADR
- [ ] README links to all 4 ADRs
- [ ] `npm run lint` passes
