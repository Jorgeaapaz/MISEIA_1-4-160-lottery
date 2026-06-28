@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a Github CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in Github and Google Cloud Services

## Task
Create Github actions that allows to compile and deploy the app to `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186` in the directory ~/MISEIA1-4-160-lottery. Test and build must be done in a GitHub Actions. The service must be created in the remote ubuntu VM in Docker 

The app must be accessible through Traefik using the domain lottery.deviaaps.com, port 30001, use the traefik wildcard *.deviaaps.com.

Use /gh and gcloud for all secrets required.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
GitHub repo: `https://github.com/Jorgeaapaz/MISEIA_1-4-160-lottery`  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issue fixed by this task:
- `cq_ci_funcional` — No `.github/workflows/` directory exists

Infrastructure:
- GCI VM SSH: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- VM deploy directory: `~/MISEIA1-4-160-lottery`
- MongoDB: `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- Traefik running with `miseia-net` network; wildcard cert `*.deviaaps.com`
- App domain: `lottery.deviaaps.com`, container internal port: `3000`, host port: `30001`
- Production env file: `env.production` (created in task 004)

## cicd_github Guidelines
- Workflow file: `.github/workflows/ci-cd.yml`
- Triggers: `push` to `master` branch
- Jobs:
  1. `test` — install deps, run `npm test`, run `npm run lint`
  2. `build-and-deploy` — (depends on `test`) build Docker image, push to VM via SSH, restart container
- Use GitHub Actions secrets for: `SSH_PRIVATE_KEY`, `VM_HOST`, `VM_USER`, `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `STRIPE_PUBLIC_KEY`, `MAILHOG_HOST`, `MAIL_PORT`
- SSH into VM using `appleboy/ssh-action` or `webfactory/ssh-agent`
- Build Docker image on the VM (pull code, then `docker compose -f docker-compose.prod.yml up -d --build`)
- Do NOT build Docker image on GitHub runner (avoid large transfer)

## Steps to follow
1. Use `/gh` skill to create all required GitHub secrets
2. Create `.github/workflows/ci-cd.yml`
3. Create `.github/workflows/` directory structure
4. Add SSH private key secret: read from `C:\ubuntuiso\.ssh\vboxuser`
5. Test workflow by pushing to master

## Output format
- `.github/workflows/ci-cd.yml`
- List of GitHub secrets to set (via `gh secret set`)

## Output checklist and Guardrails
- [ ] `.github/workflows/ci-cd.yml` exists
- [ ] `test` job runs `npm test` and `npm run lint`
- [ ] `build-and-deploy` job depends on `test`
- [ ] SSH connection uses secret `SSH_PRIVATE_KEY`
- [ ] VM receives updated code and restarts container
- [ ] App accessible at `lottery.deviaaps.com` after deploy
- [ ] No secrets hardcoded in workflow file
