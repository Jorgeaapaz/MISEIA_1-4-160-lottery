<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# ESPECIFICACIÓN TÉCNICA: SISTEMA DE LOTERÍA

## 1. Descripción General

Sistema de lotería digital que permite a los administradores crear y gestionar múltiples sorteos simultáneamente. Los usuarios pueden autenticarse sin contraseña mediante magic links, crear un perfil con información bancaria, comprar boletos a través de Stripe y participar en sorteos. El ganador recibe el premio mediante una transferencia bancaria.

### Características Principales
- Múltiples sorteos simultáneos
- Autenticación sin contraseña (magic links)
- Integración con Stripe para pagos
- Transferencia bancaria automática del premio
- Base de datos MongoDB
- Rol diferenciado de administrador

---

## 2. Estructura de Datos (MongoDB)

### 2.1 Collection: `lotteries`
```javascript
{
  _id: ObjectId,
  name: string,              // Nombre del sorteo
  endDate: Date,            // Fecha y hora del sorteo
  prizeAmount: number,      // Monto del premio en centavos
  ticketPrice: number,      // Precio del boleto en centavos
  numberOfNumbers: number,  // Cantidad de números en el boleto
  winningNumber: number | null, // Número ganador (null hasta después del sorteo)
  status: enum("pending", "active", "drawing", "completed", "cancelled"),
  totalTicketsSold: number, // Total de boletos vendidos
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId       // ID del admin que creó la lotería
}
```

### 2.2 Collection: `tickets`
```javascript
{
  _id: ObjectId,
  lotteryId: ObjectId,      // Referencia a la lotería
  userId: ObjectId,         // Usuario propietario
  numbers: [number],        // Array de números elegidos
  purchaseDate: Date,
  transactionId: string,    // ID de transacción Stripe
  status: enum("purchased", "won", "lost"),
  createdAt: Date
}
```

### 2.3 Collection: `users`
```javascript
{
  _id: ObjectId,
  email: string,            // Email único
  name: string,
  role: enum("user", "admin"), // Rol del usuario
  bankAccount: {
    accountHolder: string,
    accountNumber: string,
    bankCode: string,
    iban: string            // O alternativa según país
  } | null,                 // null si no completó perfil
  isAuthenticated: boolean,
  lastLogin: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 Collection: `magicLinks`
```javascript
{
  _id: ObjectId,
  email: string,
  token: string,            // JWT con expiración
  expiresAt: Date,          // 15 minutos desde creación
  used: boolean,
  createdAt: Date
}
```

### 2.5 Collection: `payments`
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  lotteryId: ObjectId,
  ticketId: ObjectId,
  stripePaymentIntentId: string,
  amount: number,           // En centavos
  status: enum("pending", "completed", "failed", "refunded"),
  paymentMethod: string,    // Método de pago utilizado
  createdAt: Date,
  updatedAt: Date
}
```

### 2.6 Collection: `transfers`
```javascript
{
  _id: ObjectId,
  userId: ObjectId,         // Usuario ganador
  lotteryId: ObjectId,
  amount: number,           // Monto en centavos
  status: enum("pending", "completed", "failed"),
  bankTransferId: string,   // ID externo de la transferencia
  transactionDate: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 3. Endpoints API

### 3.1 Autenticación

#### POST `/api/auth/request-magiclink`
Solicita un magic link al correo del usuario
```
Request:
{
  email: string
}

Response (200):
{
  message: "Magic link sent to email"
}

Response (400):
{
  error: "Invalid email"
}
```

#### POST `/api/auth/verify-magiclink`
Verifica el token del magic link y autentica al usuario
```
Request:
{
  token: string
}

Response (200):
{
  jwt: string,
  user: {
    id: string,
    email: string,
    name: string,
    role: string
  }
}

Response (400):
{
  error: "Token expired or invalid"
}
```

#### POST `/api/auth/logout`
Invalida la sesión del usuario
```
Response (200):
{
  message: "Logged out successfully"
}
```

---

### 3.2 Perfil de Usuario

#### GET `/api/users/profile`
Obtiene el perfil del usuario autenticado (requiere JWT)
```
Response (200):
{
  id: string,
  email: string,
  name: string,
  bankAccount: { ... } | null
}

Response (401):
{
  error: "Unauthorized"
}
```

#### PUT `/api/users/profile`
Actualiza el perfil del usuario
```
Request:
{
  name: string,
  bankAccount: {
    accountHolder: string,
    accountNumber: string,
    bankCode: string,
    iban: string
  }
}

Response (200):
{
  message: "Profile updated",
  user: { ... }
}

Response (400):
{
  error: "Invalid bank account information"
}
```

---

### 3.3 Loterias

#### GET `/api/lotteries`
Lista todas las loterias activas (sin autenticación requerida)
```
Response (200):
[
  {
    id: string,
    name: string,
    endDate: Date,
    prizeAmount: number,
    ticketPrice: number,
    numberOfNumbers: number,
    status: string,
    totalTicketsSold: number
  }
]
```

#### GET `/api/lotteries/:id`
Obtiene detalles de una lotería específica
```
Response (200):
{
  id: string,
  name: string,
  endDate: Date,
  prizeAmount: number,
  ticketPrice: number,
  numberOfNumbers: number,
  status: string,
  totalTicketsSold: number,
  winningNumber: number | null
}
```

#### POST `/api/lotteries` (Admin only)
Crea una nueva lotería
```
Request (requiere JWT con role=admin):
{
  name: string,
  endDate: Date,
  prizeAmount: number,      // En centavos
  ticketPrice: number,      // En centavos
  numberOfNumbers: number
}

Response (200):
{
  id: string,
  name: string,
  ... (campos de lotería)
}

Response (403):
{
  error: "Admin access required"
}
```

#### PATCH `/api/lotteries/:id` (Admin only)
Actualiza una lotería (solo si está en estado "pending")
```
Request:
{
  name: string,
  endDate: Date,
  prizeAmount: number,
  ticketPrice: number,
  numberOfNumbers: number
}

Response (200):
{ ... lotería actualizada }

Response (400):
{
  error: "Lottery cannot be modified in current status"
}
```

---

### 3.4 Boletos

#### POST `/api/lotteries/:id/tickets/checkout`
Inicia el proceso de compra de un boleto
```
Request (requiere JWT):
{
  numbers: [number],        // Array de números elegidos
  ticketQuantity: number    // Número de boletos a comprar (opcional, default 1)
}

Response (200):
{
  paymentIntentId: string,  // Para Stripe
  clientSecret: string,
  amount: number
}

Response (400):
{
  error: "Lottery already closed" | "Invalid numbers" | "Invalid ticket quantity"
}

Response (401):
{
  error: "Unauthorized"
}
```

#### GET `/api/users/tickets`
Lista todos los boletos del usuario autenticado
```
Response (200):
[
  {
    id: string,
    lotteryId: string,
    lotteryName: string,
    numbers: [number],
    purchaseDate: Date,
    status: enum("purchased", "won", "lost")
  }
]
```

#### GET `/api/lotteries/:id/results`
Obtiene los resultados de un sorteo completado
```
Response (200):
{
  lotteryId: string,
  lotteryName: string,
  winningNumber: number,
  winnerCount: number,
  prizeAmount: number
}

Response (400):
{
  error: "Lottery drawing not completed"
}
```

---

### 3.5 Pagos Stripe

#### POST `/api/payments/webhook`
Webhook de Stripe para confirmar pagos
```
Request (webhook de Stripe):
{
  type: "payment_intent.succeeded" | "payment_intent.payment_failed",
  data: { ... }
}

Response (200):
{
  received: true
}
```

#### GET `/api/payments/status/:paymentIntentId`
Consulta el estado de un pago
```
Response (200):
{
  status: enum("pending", "completed", "failed"),
  amount: number
}
```

---

### 3.6 Administración (Admin only)

#### POST `/api/lotteries/:id/draw`
Ejecuta el sorteo y selecciona el número ganador
```
Request (requiere JWT con role=admin):
{}

Response (200):
{
  lotteryId: string,
  winningNumber: number,
  status: "completed",
  winners: [
    {
      userId: string,
      email: string,
      prizeAmount: number
    }
  ]
}

Response (400):
{
  error: "Lottery not ready for drawing"
}
```

#### POST `/api/payments/transfer`
Procesa la transferencia bancaria del premio
```
Request (requiere JWT con role=admin):
{
  transferId: string
}

Response (200):
{
  status: "completed",
  bankTransferId: string
}

Response (400):
{
  error: "Transfer already completed" | "Invalid bank account"
}
```

---

## 4. Flujo de Autenticación (Magic Links)

```
1. Usuario accede a /login
   ↓
2. Ingresa email y envía formulario
   ↓
3. Backend genera JWT (exp: 15 min) y envía email con magic link
   ↓
4. Usuario hace clic en el link (incluye token como query param)
   ↓
5. Frontend valida token en /api/auth/verify-magiclink
   ↓
6. Si es válido:
   - Backend marca magic link como "used"
   - Retorna JWT para almacenar en localStorage
   - Frontend redirige a /dashboard
   ↓
7. Todas las requests posteriores incluyen JWT en header:
   Authorization: Bearer <jwt_token>
```

---

## 5. Flujos de Usuario

### 5.1 Flujo de Registro/Autenticación
```
1. Usuario llega a /
2. Hace clic en "Comprar Boleto"
3. Se redirige a /login
4. Ingresa email y solicita magic link
5. Verifica email y hace clic en el link
6. Se redirige a /profile para completar datos bancarios
7. Guarda información bancaria
8. Se redirige a /lotteries
```

### 5.2 Flujo de Compra de Boleto
```
1. Usuario en /lotteries selecciona una lotería
2. Ve detalles en /lotteries/[id]
3. Selecciona números (validar que falten < 10 min para sorteo)
4. Hace clic en "Comprar"
5. Se abre formulario de pago de Stripe
6. Completa pago
7. Stripe webhook confirma pago
8. Boleto se guarda como "purchased"
9. Se redirige a /dashboard con confirmación
```

### 5.3 Flujo de Sorteo
```
1. Admin accede a /admin/lotteries
2. Selecciona lotería con estado "active"
3. Hace clic en "Ejecutar Sorteo"
4. Sistema genera número ganador (0 a numberOfNumbers-1)
5. Identifica todos los boletos ganadores
6. Actualiza status de boletos a "won" o "lost"
7. Crea registros en collection "transfers" para ganadores
8. Lotería pasa a estado "completed"
9. Admin ve resumen de resultados
```

### 5.4 Flujo de Pago del Premio
```
1. Después del sorteo, admin va a /admin/payments
2. Ve lista de transferencias pendientes
3. Valida información bancaria de ganadores
4. Ejecuta transferencias bancarias (integración con API de banco)
5. Sistema marca transferencias como "completed"
6. Email de confirmación se envía al ganador
```

---

## 6. Validaciones

### Validaciones de Negocio
- **Compra de boletos**: Solo permitida hasta 10 minutos antes del sorteo
- **Números válidos**: Deben estar en rango [0, numberOfNumbers-1]
- **Perfil bancario**: Requerido antes de comprar boletos
- **Admin**: Solo usuarios con role "admin" pueden crear sorteos
- **Cantidad de boletos**: Máximo 10 boletos por transacción (o por lotería)
- **Duplicados**: Un usuario solo puede tener un boleto por lotería (opcional según negocio)

### Validaciones de Datos
- **Email**: Formato válido, único en la base de datos
- **Números bancarios**: Validar IBAN o según formato local
- **Montos**: Números positivos, almacenados en centavos
- **Fechas**: Fecha de sorteo debe ser > fecha actual + 1 hora

### Validaciones de Seguridad
- **JWT**: Verificar en cada request protegido
- **Magic link**: Token con expiración de 15 minutos, usar una sola vez
- **CORS**: Configurar solo para dominio permitido
- **Rate limiting**: Limitar requests a /api/auth/request-magiclink (ej: 3 por hora)

---

## 7. Configuración de Stripe

### Variables de Entorno
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Configuración del Webhook
- URL: `https://yourdomain.com/api/payments/webhook`
- Eventos a escuchar:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

### Implementación
- Usar `@stripe/react-stripe-js` en frontend
- Usar `stripe` npm package en backend
- Manejar confirmación de pago mediante webhook
- Guardar Stripe Payment Intent ID en collection `payments`

---

## 8. Seed de Datos

### Script: `lib/seed.ts`
```javascript
// Crear admin por defecto
db.collection('users').insertOne({
  email: 'admin@lottery.local',
  name: 'Admin',
  role: 'admin',
  isAuthenticated: true,
  createdAt: new Date()
})

// Crear lotería de ejemplo
db.collection('lotteries').insertOne({
  name: 'Lotería Primera Edición',
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 días
  prizeAmount: 50000000, // 500,000 en centavos
  ticketPrice: 500000,   // 5,000 en centavos
  numberOfNumbers: 50,
  status: 'active',
  totalTicketsSold: 0,
  createdAt: new Date(),
  createdBy: adminId
})

// Crear usuario de prueba
db.collection('users').insertOne({
  email: 'user@example.com',
  name: 'Test User',
  role: 'user',
  bankAccount: {
    accountHolder: 'Test User',
    accountNumber: '1234567890',
    bankCode: '001',
    iban: 'ES9121000418450200051332'
  },
  isAuthenticated: true,
  createdAt: new Date()
})
```

---

## 9. Consideraciones de Seguridad

- **Nunca** guardar información bancaria en logs
- **Nunca** exponer `JWT_SECRET` en frontend
- Validar `numberOfNumbers` > 0 y razonable (< 1000)
- Verificar que el usuario tenga perfil bancario antes de permitir compra
- Rate limiting en endpoints de autenticación
- HTTPS obligatorio en producción
- Usar variables de entorno para todas las credenciales

---

## 10. Próximos Pasos de Implementación

1. Crear estructura de carpetas base
2. Configurar MongoDB y variables de entorno
3. Implementar autenticación (magic links)
4. Crear endpoints de loterias
5. Integrar Stripe
6. Desarrollar frontend con Next.js
7. Implementar pruebas (Jest + Playwright)
8. Configurar CI/CD
9. Seed de datos
10. Despliegue
