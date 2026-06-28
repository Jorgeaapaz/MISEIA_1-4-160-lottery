@~/.claude/prompts/new_functionality_prompt_spec.md

# Create GitLab CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect and DevOps Engineer expert in GitLab CI/CD and Google Cloud Services.

## Task
Create a `.gitlab-ci.yml` pipeline that tests, builds, and deploys the LoteriApp to the GCI VM via SSH. Use /glab for all GitLab CLI operations including setting CI/CD variables.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
GitLab repo: `https://gitlab.codecrypto.academy/Jorgeaapaz/MISEIA_1-4-160-lottery`  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issue fixed by this task:
- `cq_ci_funcional` — No `.gitlab-ci.yml` exists

Infrastructure:
- GCI VM SSH: `gcvmuser@34.174.56.186` with key at `C:\ubuntuiso\.ssh\vboxuser`
- VM deploy directory: `~/MISEIA1-4-160-lottery`
- MongoDB: `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- Traefik running with `miseia-net` network; wildcard cert `*.deviaaps.com`
- App domain: `lottery.deviaaps.com`, container port: `3000`, host port: `30001`
- Production env file: `env.production` (created in task 004)

## cicd_gitlab Guidelines
- Pipeline file: `.gitlab-ci.yml`
- Stages: `test`, `build`, `deploy`
- `NODE_ENV=production` must ONLY be set in the `build` stage's `script` section (e.g., `NODE_ENV=production npm run build`), NOT as a job-level or global variable
- Use GitLab CI/CD Variables (masked) for all secrets
- `test` stage: `npm ci`, `npm test`, `npm run lint`
- `build` stage: build Docker image on the runner OR prepare for VM build
- `deploy` stage: SSH into VM, pull latest code, run `docker compose -f docker-compose.prod.yml up -d --build`
- Use `only: [master]` or `rules: - if: $CI_COMMIT_BRANCH == "master"` for deploy
- Runner: use `image: node:20-alpine` for test/build; `image: alpine` with SSH tools for deploy

## Steps to follow
1. Use `/glab` skill to set GitLab CI/CD variables: `SSH_PRIVATE_KEY`, `VM_HOST`, `VM_USER`, `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `MAIL_FROM`, `MAILHOG_HOST`, `MAIL_PORT`
2. Create `.gitlab-ci.yml` with 3 stages
3. Add `before_script` for SSH agent setup in deploy stage
4. Test by pushing to master

## Output format
- `.gitlab-ci.yml` at project root
- List of `glab` commands to set CI/CD variables

## Output checklist and Guardrails
- [ ] `.gitlab-ci.yml` exists with stages: test, build, deploy
- [ ] `NODE_ENV=production` set ONLY in build script, not as job-level variable
- [ ] `npm test` runs in test stage
- [ ] Deploy stage SSHes into VM and restarts Docker container
- [ ] All secrets via GitLab CI/CD Variables (masked)
- [ ] No hardcoded credentials in `.gitlab-ci.yml`
- [ ] Pipeline triggers only on `master` branch pushes
