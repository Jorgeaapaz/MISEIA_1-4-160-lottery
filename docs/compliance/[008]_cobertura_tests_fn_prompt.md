@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Test Coverage Reporting (>60% domain code)

## Role
Act as a Software Developer expert in TypeScript, Jest coverage, and Next.js testing strategies.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issue fixed by this task:
- `cq_cobertura_alta` — No coverage report; no badge; coverage unknown

Prerequisite: Task 002 (`tests_minimos`) must be completed — Jest must be installed and `npm test` must pass.

Target: `>60%` line coverage on domain code in `lib/`; `>40%` global coverage.

## Task
1. Configure Jest coverage in `jest.config.ts`:
   - Add `collectCoverageFrom` targeting `lib/**/*.ts` and `app/api/**/*.ts`
   - Add `coverageThresholds`: lines `60%` for `lib/`
   - Set `coverageReporters: ['text', 'lcov', 'html']`
2. Run `npm run test:coverage` and verify thresholds pass
3. Add coverage badge to `README.md` (use jest-badges or shields.io with local lcov)
4. Add `coverage/` to `.gitignore` (generated directory)
5. Add a `## Tests` section to README documenting how to run tests and view coverage

### cobertura_tests Guidelines
- Focus coverage on `lib/auth.ts`, `lib/db.ts` (mocked), business logic in API routes
- Do NOT require coverage of generated Next.js internals or UI components
- The `text` reporter shows the summary table in CI output — sufficient for badge
- Add `--coverage` flag documentation to README

## Output format
- Updated `jest.config.ts` with coverage settings
- Updated `README.md` with `## Tests` section and coverage badge
- Updated `.gitignore` with `coverage/`

## Steps to follow
1. Read current `jest.config.ts`
2. Add `collectCoverage`, `collectCoverageFrom`, `coverageThreshold`, `coverageReporters`
3. Run `npm run test:coverage` to see current coverage
4. Add more test cases if coverage is below 60% on `lib/`
5. Update README with badge and test commands

## Output checklist and Guardrails
- [ ] `jest.config.ts` has `coverageThreshold: { './lib/': { lines: 60 } }`
- [ ] `npm run test:coverage` exits with code 0
- [ ] Coverage report generated in `coverage/` directory
- [ ] `coverage/` in `.gitignore`
- [ ] README has `## Tests` section with `npm test` and `npm run test:coverage` commands
- [ ] Coverage of `lib/auth.ts` > 60% lines
