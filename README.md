# Payments Microservice

Microservicio de pagos construido con [NestJS](https://nestjs.com/) y [Stripe](https://stripe.com/). Se comunica vía [NATS](https://nats.io/).

## Inicio rápido

```bash
# 1. Levantar NATS
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Completar STRIPE_SECRET_KEY y STRIPE_WEBHOOK_SECRET

# 4. Ejecutar en desarrollo
pnpm run start:dev
```

## Variables de entorno

```env
PORT=3003
NATS_SERVERS="nats://localhost:4222"
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:3003/payments/success
STRIPE_CANCEL_URL=http://localhost:3003/payments/cancel
```

## Endpoints

| Método | Ruta                       | Descripción                |
| ------ | -------------------------- | -------------------------- |
| POST   | `/payments/create-payment` | Crear sesión de pago       |
| GET    | `/payments/success`        | Redirect tras pago exitoso |
| GET    | `/payments/cancel`         | Redirect tras cancelación  |
| POST   | `/stripe/webhook`          | Webhook de Stripe          |

## Webhooks en desarrollo

```bash
# Opción 1: Stripe CLI
stripe listen --forward-to localhost:3003/stripe/webhook

# Opción 2: Hookdeck
hookdeck listen 3003
```
