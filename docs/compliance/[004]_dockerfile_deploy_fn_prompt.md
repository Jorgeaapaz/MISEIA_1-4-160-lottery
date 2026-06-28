@~/.claude/prompts/new_functionality_prompt_spec.md

# Create Dockerfile and Production Deploy Instructions

## Role
Act as a Software Architect and IT Infrastructure Engineer expert in Docker, Next.js production builds, and Google Cloud VM deployments.

## Context
Project: LoteriApp — Next.js 16 + TypeScript + MongoDB + Stripe  
Path: `D:\Master-IA-Dev\04-Bloque4\1-4-160-lottery\lottery`

Non-compliant issue fixed by this task:
- `dc_instrucciones_deploy` — No Dockerfile, no production env file, no deploy instructions

Infrastructure already available on GCI VM:
- SSH: `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- Traefik running with wildcard `*.deviaaps.com` (port 443)
- MongoDB: `mongodb://admin:MongoAdmin2024!@34.174.56.186:27020/?authSource=admin`
- Network: `miseia-net` (Docker bridge)
- App must be accessible at: `lottery.deviaaps.com`
- App port inside container: `3000`; host port: `30001`

## Task
1. Create `Dockerfile` at project root (multi-stage: build + production)
2. Create `env.production` at project root with production values (no real secrets — use placeholders for Stripe and JWT; use real MongoDB URI)
3. Create `docker-compose.prod.yml` that connects to `miseia-net` and adds Traefik labels
4. Update `README.md` to add a `## Deploy to Production` section with step-by-step instructions
5. Add `Dockerfile` and `docker-compose.prod.yml` patterns to `.gitignore` exclusions if needed (keep `env.production` out of git — add to .gitignore)

### dockerfile_deploy Guidelines
- Use Node.js 20 Alpine for minimal image size
- Multi-stage: `builder` stage runs `npm run build`; `runner` stage copies `.next/standalone`
- Set `output: 'standalone'` in `next.config.ts` if not already set
- The `runner` stage must set `NODE_ENV=production`
- Traefik labels: use `cloudflare` certresolver, `websecure` entrypoint, `miseia-net` network
- `env.production` must NOT be committed (add to `.gitignore`)

## Output format
- `Dockerfile` at project root
- `env.production` at project root (add to .gitignore)
- `docker-compose.prod.yml` at project root
- Updated `README.md` with `## Deploy to Production` section

## Examples and Steps to follow

### Dockerfile pattern
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.prod.yml Traefik labels
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.lottery.rule=Host(`lottery.deviaaps.com`)"
  - "traefik.http.routers.lottery.entrypoints=websecure"
  - "traefik.http.routers.lottery.tls=true"
  - "traefik.http.routers.lottery.tls.certresolver=cloudflare"
  - "traefik.http.services.lottery.loadbalancer.server.port=3000"
networks:
  - miseia-net
```

### Deploy steps to document in README
```bash
# On local machine
docker build -t lottery-app .
docker save lottery-app | ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186 "docker load"

# On VM
cd ~/MISEIA1-4-160-lottery
docker compose -f docker-compose.prod.yml up -d
```

1. Read `next.config.ts` — add `output: 'standalone'` if missing
2. Create `Dockerfile`
3. Create `env.production` with all variables from `.env.example` + real MongoDB URI
4. Create `docker-compose.prod.yml` with Traefik labels
5. Update `.gitignore` to exclude `env.production`
6. Update `README.md`
7. Run `npm run build` locally to verify build works before committing

## Output checklist and Guardrails
- [ ] `Dockerfile` uses multi-stage build
- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] `env.production` exists but is in `.gitignore`
- [ ] `docker-compose.prod.yml` connects to `miseia-net`
- [ ] Traefik labels point to `lottery.deviaaps.com`
- [ ] README has `## Deploy to Production` section
- [ ] `npm run build` completes without errors
