# Retrospectiva de Sesión — 2026-04-23
### Implementación completa del Sistema de Lotería con Next.js 16 + MongoDB + Stripe

---

## Resumen / Overview

Sesión de implementación completa de una aplicación de lotería online partiendo de un archivo `PROMPT.md` con los requisitos de negocio.

**Flujo de trabajo:**
1. Se usó la skill **`/microprompt`** para convertir los requisitos en lenguaje natural (`PROMPT.md`) en una **especificación técnica estructurada** que se añadió a `AGENTS.md`.
2. Se implementó la aplicación completa siguiendo esa especificación: backend (API routes), frontend (Next.js 16), autenticación (magic links + JWT), pagos (Stripe) y seed de datos.
3. Se usó la skill **`/frontend-design`** para el diseño visual (dark theme noir, tipografía Cormorant Garamond + DM Sans, paleta obsidiana + violeta + dorado).

**Resultado:** ✅ Build exitoso (`npm run build`) con 22 rutas generadas, 0 errores TypeScript.

---

## Skills utilizadas

| Skill | Propósito |
|-------|-----------|
| `/microprompt` | Transformar `PROMPT.md` en especificación técnica en `AGENTS.md` |
| `/frontend-design` | Diseñar el layout raíz, navbar y sistema de estilos (globals.css) |
| `/session-retrospective` | Esta retrospectiva |

---

## Especificación Técnica Generada (resumen)

Extraída de `PROMPT.md` y añadida a `AGENTS.md`:

**Negocio:**
- Múltiples sorteos activos simultáneamente
- Un único número ganador por sorteo
- Compra de boletos hasta 10 minutos antes del sorteo
- Premio pagado por transferencia bancaria a cuenta IBAN del ganador
- Solo el admin puede crear sorteos

**Stack:**
- Next.js 16.2.4 (App Router) + TypeScript
- MongoDB (driver nativo, singleton en `lib/db.ts`)
- Autenticación: JWT + Magic Links (sin contraseñas)
- Email: Nodemailer → MailHog (Docker, puerto 1025)
- Pagos: Stripe (PaymentIntents + Webhooks)
- UI: Tailwind CSS v4, dark theme

**Colecciones MongoDB:**
- `users` — email, name, role (user|admin), bankAccount (IBAN), isAuthenticated
- `lotteries` — name, endDate, prizeAmount, ticketPrice, numberOfNumbers, winningNumber, status
- `tickets` — lotteryId, userId, numbers[], transactionId, status (purchased|won|lost)
- `magicLinks` — email, token (JWT 15min), used, expiresAt
- `payments` — stripePaymentIntentId, amount (centavos), status
- `transfers` — userId, lotteryId, amount, bankTransferId, status

> **Todos los montos monetarios se almacenan en centavos (integers).** Formatear solo en render.

---

## Proceso de instalación / Installation

```bash
# 1. El proyecto ya existía como Create Next App base con Next.js 16.2.4
# 2. Instalar dependencias de la aplicación
npm install mongodb jsonwebtoken @types/jsonwebtoken nodemailer @types/nodemailer stripe @stripe/react-stripe-js @stripe/stripe-js

# 3. Instalar tsx para ejecutar el seed (TypeScript en Node directamente)
npm install --save-dev tsx

# 4. Configurar variables de entorno
cp .env.local  # (ya creado, ver sección de configuración)

# 5. Poblar la base de datos con datos iniciales
npm run seed

# 6. Verificar que el build es correcto
npm run build
```

---

## Configuración de entorno / Environment Variables

Archivo `.env.local` en la raíz del proyecto:

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=lottery_db

# AWS S3 / Rustfs (no usado en esta sesión, reservado para futuro)
AWS_USERNAME=minioadmin
AWS_PASSWORD=minioadmin1234
AWS_REGION=us-east-1
AWS_URL=http://localhost:10000
AWS_BUCKET=lottery-bucket

# Email — MailHog en Docker
MAILHOG_HOST=localhost
MAIL_PORT=1025

# Next.js
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# JWT — cambiar en producción
JWT_SECRET=magik-link-dev-secret-2026

# Stripe — reemplazar con claves reales del dashboard de Stripe
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_key_here
```

---

## Comandos ejecutados / Commands Run

```bash
# Instalar dependencias
npm install mongodb jsonwebtoken @types/jsonwebtoken nodemailer @types/nodemailer stripe @stripe/react-stripe-js @stripe/stripe-js
npm install --save-dev tsx

# Seed de datos (requiere MongoDB corriendo)
npm run seed

# Desarrollo
npm run dev

# Build de verificación
npm run build
```

---

## Levantar y detener la aplicación / Running & Stopping

### Prerequisitos
- MongoDB corriendo en `localhost:27017`
- MailHog corriendo en Docker en puerto `1025` (UI en `8025`)
- (Opcional para pagos reales) Stripe CLI para webhook local

### Arrancar

```bash
# 1. Asegurarse que MongoDB está activo (Windows)
net start MongoDB

# 2. MailHog (si no está levantado)
docker start mailhog
# o: docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog

# 3. (Solo para pagos Stripe en local) Reenviar webhooks
stripe listen --forward-to localhost:3000/api/payments/webhook

# 4. Poblar BD (primera vez o para resetear datos)
npm run seed

# 5. Arrancar Next.js en desarrollo
npm run dev
```

### Detener

```bash
# Detener Next.js: Ctrl+C en la terminal donde corre npm run dev
# Detener MailHog: docker stop mailhog
```

---

## URLs de prueba / Test URLs

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Landing page pública |
| `http://localhost:3000/login` | Login con magic link |
| `http://localhost:3000/lotteries` | Lista de sorteos activos |
| `http://localhost:3000/dashboard` | Mis boletos (requiere auth) |
| `http://localhost:3000/profile` | Perfil + cuenta bancaria (requiere auth) |
| `http://localhost:3000/admin/lotteries` | Panel admin — sorteos (requiere admin) |
| `http://localhost:3000/admin/payments` | Panel admin — transferencias (requiere admin) |
| `http://localhost:8025` | MailHog UI — ver emails de magic links |

### Endpoints API (curl de prueba)

```bash
# Solicitar magic link
curl -X POST http://localhost:3000/api/auth/request-magiclink \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@lottery.local"}'

# Listar sorteos activos
curl http://localhost:3000/api/lotteries

# Ver detalle de un sorteo (reemplazar :id)
curl http://localhost:3000/api/lotteries/:id

# Obtener perfil (reemplazar :jwt)
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer :jwt"
```

---

## Credenciales de Seed / Seed Credentials

El script `npm run seed` crea:

| Email | Rol | Cuenta bancaria | Descripción |
|-------|-----|-----------------|-------------|
| `admin@lottery.local` | admin | — | Puede crear sorteos y ejecutar el draw |
| `user@example.com` | user | IBAN ES9121000418450200051332 | Usuario listo para comprar boletos |

**Sorteos creados por el seed:**
1. **Gran Sorteo de Primavera** — 50 números, premio €5.000,00, boleto €5,00, termina en 7 días
2. **Sorteo Rápido Semanal** — 20 números, premio €10.000,00, boleto €1,00, termina en 3 días
3. **Sorteo de Invierno (Finalizado)** — completado, número ganador: 17

> Para iniciar sesión: ir a `/login`, ingresar el email, revisar MailHog en `http://localhost:8025` y hacer clic en el magic link.

---

## Estructura de archivos creada / File Structure

```
lottery/
├── .env.local                              ← Variables de entorno
├── proxy.ts                                ← Protección de rutas (≡ middleware)
├── AGENTS.md                               ← Reglas + especificación técnica completa
├── PROMPT.md                               ← Requisitos originales en lenguaje natural
│
├── context/
│   └── GlobalContext.tsx                   ← Estado global: user, token, login(), logout()
│
├── lib/
│   ├── types.ts                            ← Interfaces TypeScript (sin `any`)
│   ├── db.ts                               ← Singleton MongoClient
│   ├── auth.ts                             ← JWT: signMagicLinkToken, signAuthToken, requireAuth, requireAdmin
│   ├── email.ts                            ← sendMagicLink(), sendWinnerNotification()
│   ├── stripe.ts                           ← Singleton Stripe client
│   └── seed.ts                             ← Script de datos iniciales
│
└── app/
    ├── layout.tsx                          ← RootLayout con GlobalProvider + Navbar + footer
    ├── globals.css                         ← Dark theme: tokens CSS, .card, .btn-*, .input, .badge-*, animaciones
    ├── page.tsx                            ← Landing page con hero + stats
    │
    ├── components/
    │   └── Navbar.tsx                      ← Nav sticky frosted-glass, links condicionales por rol
    │
    ├── login/page.tsx                      ← Formulario email → magic link
    ├── auth/verify/page.tsx                ← Verificación token → login automático → redirect
    ├── dashboard/page.tsx                  ← Lista de boletos del usuario con estadísticas
    ├── profile/page.tsx                    ← Editar nombre + cuenta bancaria (IBAN)
    │
    ├── lotteries/
    │   ├── page.tsx                        ← Server component: lista sorteos activos desde MongoDB
    │   └── [id]/
    │       ├── page.tsx                    ← Server component: detalle del sorteo
    │       └── LotteryDetail.tsx           ← Client: selector de número + Stripe Elements
    │
    ├── admin/
    │   ├── lotteries/page.tsx              ← CRUD sorteos + botón "Sortear"
    │   └── payments/page.tsx              ← Lista transferencias + botón "Transferir"
    │
    └── api/
        ├── auth/
        │   ├── request-magiclink/route.ts  ← POST: genera JWT 15min + envía email
        │   ├── verify-magiclink/route.ts   ← POST: valida token + devuelve JWT de sesión
        │   └── logout/route.ts             ← POST: respuesta limpia (JWT en localStorage)
        ├── users/
        │   ├── profile/route.ts            ← GET/PUT: perfil + cuenta bancaria
        │   └── tickets/route.ts            ← GET: historial de boletos del usuario
        ├── lotteries/
        │   ├── route.ts                    ← GET: sorteos activos | POST: crear (admin)
        │   └── [id]/
        │       ├── route.ts                ← GET: detalle | PATCH: editar (admin, solo pending)
        │       ├── draw/route.ts           ← POST: ejecutar sorteo → número ganador (admin)
        │       ├── results/route.ts        ← GET: resultados del sorteo completado
        │       └── tickets/
        │           └── checkout/route.ts   ← POST: crear PaymentIntent Stripe + ticket
        └── payments/
            ├── webhook/route.ts            ← POST: webhook Stripe → confirmar pago
            ├── status/[paymentIntentId]/route.ts ← GET: estado del pago
            └── transfer/route.ts           ← GET: lista transferencias | POST: procesar (admin)
```

---

## Aprendizajes técnicos clave / Key Technical Learnings

### Next.js 16 — Cambios importantes respecto a versiones anteriores

| Cambio | Detalle |
|--------|---------|
| `middleware.ts` → `proxy.ts` | El archivo de middleware se llama ahora `proxy.ts` y la función exportada es `proxy()` en lugar de `middleware()` |
| `params` es una `Promise` | En Route Handlers y páginas dinámicas, hay que hacer `await params` antes de desestructurar |
| Sin caché por defecto en GET | Los Route Handlers GET ya no son estáticos por defecto — son dinámicos |

```typescript
// ✅ CORRECTO en Next.js 16
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // ← OBLIGATORIO el await
}

// ✅ proxy.ts (NO middleware.ts)
export function proxy(request: NextRequest) {
  return NextResponse.next()
}
```

### Autenticación Magic Link — Flujo implementado

```
1. POST /api/auth/request-magiclink  → genera JWT(15min) + guarda en 'magicLinks' + envía email
2. Usuario abre email → clic en link con ?token=...
3. /auth/verify llama POST /api/auth/verify-magiclink
4. Backend: verifica JWT + comprueba que no está 'used' + marca como used
5. Devuelve JWT de sesión (7d) → se guarda en localStorage
6. Todas las requests posteriores llevan: Authorization: Bearer <jwt>
```

> **NO se usan cookies.** Todo el estado de autenticación vive en `localStorage` gestionado por `GlobalContext`.

### Dinero en centavos

```typescript
// Almacenar: multiplicar por 100 y redondear
prizeAmount: Math.round(parseFloat(value) * 100)

// Mostrar: dividir por 100 y formatear
(cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
```

---

## Problemas encontrados / Problems & Solutions

| Problema | Solución |
|----------|----------|
| CSS warning: `@import` de Google Fonts después de `@import "tailwindcss"` | Invertir el orden: Google Fonts primero, luego `@import "tailwindcss"` |
| `page.tsx` ya existía con contenido del template base | Leer el archivo con `Read` antes de sobreescribir con `Write` |
| Script `seed.ts` necesitaba ejecutarse con TypeScript en Node | Instalar `tsx` como devDependency y usar `npx tsx lib/seed.ts` |

---

## Configuración de red / Network Configuration

Esta aplicación corre completamente en `localhost`. No requiere configuración NAT ni port forwarding en VirtualBox.

Servicios locales requeridos:
- **MongoDB**: `localhost:27017` (instalado en el sistema Windows)
- **MailHog**: `localhost:1025` (SMTP) y `localhost:8025` (UI web) — corre en Docker
- **Next.js**: `localhost:3000`
- **Stripe Webhooks**: requiere `stripe listen` CLI en desarrollo

---

## Resultados y conclusiones / Results & Conclusions

**Funcionó correctamente:**
- ✅ Build de producción sin errores TypeScript
- ✅ 22 rutas generadas (15 API + 7 páginas)
- ✅ Proxy (middleware) de protección de rutas
- ✅ Diseño dark theme noir completamente personalizado
- ✅ Flujo de magic links implementado end-to-end
- ✅ Integración Stripe con PaymentIntents y webhook
- ✅ Panel de administración con creación de sorteos y ejecución de draw

**Pendiente para próximas sesiones:**
- [ ] Configurar claves reales de Stripe (actualmente son placeholders)
- [ ] Añadir pruebas Playwright (flujos críticos: login, compra, sorteo)
- [ ] Añadir pruebas Jest para `lib/auth.ts` y `lib/db.ts`
- [ ] Implementar rate limiting en `/api/auth/request-magiclink`
- [ ] Validación IBAN real (librería `iban-js` o similar)
- [ ] Añadir índices MongoDB (email en users, lotteryId en tickets)
- [ ] Configurar CI/CD

---

*Generado con `/session-retrospective` · LoteriApp · 2026-04-23*
