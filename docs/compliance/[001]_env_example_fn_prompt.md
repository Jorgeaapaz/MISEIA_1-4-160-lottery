@~/.claude/prompts/new_functionality_prompt_spec.md

# Create .env.example Template File

## Role
Act as a Software Developer and Security Engineer expert in Next.js and environment configuration best practices.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issues fixed by this task:
- `cq_sin_secretos_en_repo` — No `.env.example` file exists; secrets must be declared via env vars with a safe template
- `dc_env_example` — README references `cp .env.local.example .env.local` but the source file does not exist in the repo

Current `.env.local` (NOT committed) contains real values. The README already lists these variables:
```
MONGODB_URI, MONGODB_DB, JWT_SECRET,
STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
MAILHOG_HOST, MAIL_PORT, NEXT_PUBLIC_API_URL
```

## Task
1. Create `.env.example` in the project root with ALL required environment variables set to safe placeholder values (no real secrets).
2. Add a comment above each variable explaining what it is and where to obtain it.
3. Update `README.md` to change the instruction from `cp .env.local.example .env.local` to `cp .env.example .env.local`.
4. Verify `.gitignore` already excludes `.env.local` (it should — do NOT add `.env.example` to .gitignore; it must be committed).

### env_example Guidelines
- Use placeholder values like `your-jwt-secret-here`, `pk_test_replace_me`, `mongodb://localhost:27017`
- Do NOT include real keys, tokens, or passwords
- Group variables by service (MongoDB, JWT, Stripe, Email)
- Keep format compatible with `dotenv` / Next.js env loading

## Output format
File: `.env.example` at project root  
File: `README.md` updated (only the `cp` command reference)

## Examples and Steps to follow
1. Read current `.env.local` to get the complete list of variables
2. Read `.gitignore` to confirm `.env.local` is excluded
3. Create `.env.example` with placeholder values and comments
4. Edit `README.md` cp command reference
5. Run `npm run lint` to verify no regressions

## Output checklist and Guardrails
- [ ] `.env.example` exists at project root
- [ ] All variables from README are present in `.env.example`
- [ ] No real secrets in `.env.example`
- [ ] `.env.example` is NOT in `.gitignore`
- [ ] README `cp` command references the correct filename
- [ ] `npm run lint` passes
