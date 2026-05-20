import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey)
  }
  return stripeClient
}
