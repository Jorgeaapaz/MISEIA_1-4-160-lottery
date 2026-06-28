@~/.claude/prompts/new_functionality_prompt_spec.md

# Implement Minimum Automated Tests

## Role
Act as a Software Developer expert in TypeScript, Jest, and Next.js API testing.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issue fixed by this task:
- `cq_tests_minimos` — `index.test.js` and `index.spec.js` exist but are empty/unexecutable. `package.json` has NO `test` script.

Current test stubs at root level (empty):
- `index.test.js`
- `index.spec.js`

Critical business flows to cover:
1. Auth helpers (`lib/auth.ts`) — sign token, verify token, expired token
2. Magic link API (`/api/auth/request-magiclink`) — valid email, invalid email
3. Lottery listing API (`/api/lotteries`) — returns active lotteries
4. Ticket checkout validation — numbers out of range, purchase within 10 min cutoff

## Task
1. Install Jest + testing dependencies: `jest`, `@types/jest`, `ts-jest`, `jest-environment-node`
2. Add `jest.config.ts` at project root with `ts-jest` preset and `testEnvironment: 'node'`
3. Add `"test": "jest"` and `"test:coverage": "jest --coverage"` scripts to `package.json`
4. Create `__tests__/` directory with test files:
   - `__tests__/lib/auth.test.ts` — unit tests for JWT sign/verify helpers
   - `__tests__/api/lotteries.test.ts` — integration-style tests mocking MongoDB
   - `__tests__/api/auth.test.ts` — tests for magic link request validation
5. Delete or replace the empty root-level `index.test.js` and `index.spec.js`
6. All tests must pass: `npm test`

### tests_minimos Guidelines
- Use `jest.mock()` to mock `lib/db.ts` MongoDB connection — do NOT require a live database for unit tests
- For auth tests, use real JWT sign/verify from `lib/auth.ts` with a test secret
- Test both happy path and error cases (invalid input → 400, expired token → 400)
- Minimum: 8 passing tests covering the 3 critical flows

## Output format
- `jest.config.ts` at project root
- `__tests__/lib/auth.test.ts`
- `__tests__/api/lotteries.test.ts`
- `__tests__/api/auth.test.ts`
- Updated `package.json` with `test` and `test:coverage` scripts

## Examples and Steps to follow
1. Read `lib/auth.ts` to understand JWT helpers signature
2. Read `app/api/lotteries/route.ts` to understand handler structure
3. Read `app/api/auth/request-magiclink/route.ts`
4. Install jest + ts-jest: `npm install --save-dev jest @types/jest ts-jest jest-environment-node`
5. Create `jest.config.ts`
6. Write tests targeting the functions identified in step 1-3
7. Run `npm test` — all tests must pass

## Output checklist and Guardrails
- [ ] `package.json` has `"test"` script
- [ ] `npm test` exits with code 0
- [ ] At least 8 test cases across 3 files
- [ ] No live database required (MongoDB mocked)
- [ ] Empty `index.test.js` and `index.spec.js` removed or replaced
- [ ] `npm run lint` still passes after changes
