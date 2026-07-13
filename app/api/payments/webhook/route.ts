import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { Payment } from '@/lib/types'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  const stripe = getStripe()
  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const db = await getDb()

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object

    await db.collection<Payment>('payments').updateOne(
      { stripePaymentIntentId: paymentIntent.id },
      { $set: { status: 'completed', updatedAt: new Date() } }
    )
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object

    await db.collection<Payment>('payments').updateOne(
      { stripePaymentIntentId: paymentIntent.id },
      { $set: { status: 'failed', updatedAt: new Date() } }
    )
  }

  return Response.json({ received: true })
}
