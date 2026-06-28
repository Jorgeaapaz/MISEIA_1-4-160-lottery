# ADR-004: Webhook-Driven Payment State Machine

## Status
Accepted

## Context
After initiating a Stripe payment, there are two approaches to confirming it: (1) trust the client-side `confirmPayment()` result and redirect the user on success, or (2) wait for the `payment_intent.succeeded` webhook from Stripe and update the database there. Option 1 is simpler to implement but creates a race condition: if the browser closes after payment but before the API call to mark the ticket as purchased, the user has paid but owns no ticket. This is financially and legally unacceptable for a lottery system.

Additionally, Stripe's own documentation warns against relying solely on client-side confirmation for fulfillment: webhooks are the authoritative source of payment status.

## Decision
Ticket and payment statuses are updated exclusively in the Stripe webhook handler (`/api/payments/webhook`). The client-side `confirmPayment()` resolves the UX (shows success/failure UI) but does not write to the database. The strict state machine is:

```
ticket.status:   pending → purchased (webhook: succeeded) | (no record if failed)
payment.status:  pending → completed (webhook: succeeded) | failed (webhook: failed)
lottery.totalTicketsSold: incremented only in webhook handler
```

The `payment_intent.created` at checkout time creates the `ticket` document with `status: "pending"` and the `payment` document with `status: "pending"`. The webhook transitions both.

## Consequences

**Positive:**
- No race condition: a ticket is only marked `purchased` when Stripe confirms money movement. Users cannot own tickets they haven't paid for, and cannot lose tickets they have paid for.
- `totalTicketsSold` is always accurate because it's incremented atomically in the webhook, not in the checkout route.
- The system is idempotent: if the webhook fires twice (Stripe retries on 5xx), the second update is a no-op because the ticket is already `purchased`.

**Negative:**
- The user's browser must poll or the frontend must optimistically show "payment processing" until the webhook fires (typically < 1 second in test mode, < 5 seconds in production). This adds UI complexity: the `/dashboard` page may show the ticket as `pending` briefly before the webhook updates it.
- Webhook endpoint must be publicly reachable — in local development this requires `stripe listen --forward-to localhost:3000/api/payments/webhook`, adding a dependency on the Stripe CLI.
