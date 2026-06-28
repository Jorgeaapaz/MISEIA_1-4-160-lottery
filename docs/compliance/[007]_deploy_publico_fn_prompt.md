@~/.claude/prompts/new_functionality_prompt_spec.md

# Deploy LoteriApp Publicly Accessible on GCI VM

## Role
Act as a Software Architect and IT Infrastructure Engineer expert in Docker, Traefik, and Google Cloud VM deployments.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issue fixed by this task:
- `fn_deploy_publico_accesible` — No public URL documented; app only runs locally

Prerequisites (must be completed first):
- Task 004: `Dockerfile`, `docker-compose.prod.yml`, `env.production` created
- Task 005: GitHub CI/CD pipeline running

Infrastructure:
- GCI VM SSH: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- VM deploy directory: `~/MISEIA1-4-160-lottery`
- MongoDB: `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- Traefik already running on `miseia-net`; wildcard cert `*.deviaaps.com`
- Target URL: `https://lottery.deviaaps.com`
- App internal port: `3000`, host binding: `30001`

## Task
1. SSH into the GCI VM and create the deploy directory `~/MISEIA1-4-160-lottery`
2. Clone or push the repository to the VM
3. Copy `env.production` to the VM at `~/MISEIA1-4-160-lottery/.env`
4. Build and start the Docker container using `docker-compose.prod.yml`
5. Verify the app is accessible at `https://lottery.deviaaps.com`
6. Update `README.md` to add the public URL in the header and in a `## Live Demo` section
7. Verify the full user flow works on the deployed URL (magic link → profile → buy ticket)

### deploy_publico Guidelines
- Use `docker compose -f docker-compose.prod.yml up -d --build` to start
- Verify Traefik picked up the container: check `https://traefik.deviaaps.com` dashboard
- Use `docker logs lottery-app` to debug if container fails to start
- Make sure `NEXT_PUBLIC_API_URL` in `env.production` points to `https://lottery.deviaaps.com`
- After deploy, test the magic link flow using Mailhog at `https://mailhog.deviaaps.com`

## Steps to follow
1. SSH into VM: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
2. `mkdir -p ~/MISEIA1-4-160-lottery && cd ~/MISEIA1-4-160-lottery`
3. `git clone https://github.com/Jorgeaapaz/MISEIA_1-4-160-lottery.git .`
4. Create `.env` from `env.production` values (copy manually or via scp)
5. `docker compose -f docker-compose.prod.yml up -d --build`
6. Wait 60 seconds, then curl `https://lottery.deviaaps.com`
7. Update README with public URL

## Output format
- Running app at `https://lottery.deviaaps.com`
- Updated `README.md` with live URL

## Output checklist and Guardrails
- [ ] App responds at `https://lottery.deviaaps.com` (HTTP 200)
- [ ] Magic link flow works end-to-end via Mailhog
- [ ] README contains `https://lottery.deviaaps.com` as Live Demo URL
- [ ] Traefik dashboard shows `lottery` router as healthy
- [ ] `docker ps` shows container `lottery-app` running
- [ ] No secrets in git history
