import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { Lottery, User, Ticket, Payment } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = requireAuth(request)
    const { id } = await params
    const body = await request.json()
    const { numbers } = body as { numbers: number[] }

    const db = await getDb()

    // Get lottery
    const lottery = await db
      .collection<Lottery>('lotteries')
      .findOne({ _id: new ObjectId(id) })

    if (!lottery) {
      return Response.json({ error: 'Lottery not found' }, { status: 404 })
    }

    // Check status and timing (must be > 10 min before endDate)
    const tenMinBefore = new Date(lottery.endDate.getTime() - 10 * 60 * 1000)
    if (lottery.status !== 'active' || new Date() >= tenMinBefore) {
      return Response.json({ error: 'Lottery already closed' }, { status: 400 })
    }

    // Validate numbers
    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return Response.json({ error: 'Invalid numbers' }, { status: 400 })
    }

    for (const n of numbers) {
      if (!Number.isInteger(n) || n < 0 || n >= lottery.numberOfNumbers) {
        return Response.json({ error: 'Invalid numbers' }, { status: 400 })
      }
    }

    // Check user has bank account
    const user = await db
      .collection<User>('users')
      .findOne({ _id: new ObjectId(payload.userId) })

    if (!user?.bankAccount) {
      return Response.json(
        { error: 'Complete your profile with bank account before purchasing' },
        { status: 400 }
      )
    }

    // Create Stripe PaymentIntent
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: lottery.ticketPrice,
      currency: 'eur',
      metadata: {
        lotteryId: id,
        userId: payload.userId,
        numbers: JSON.stringify(numbers),
      },
    })

    // Save pending payment
    const now = new Date()
    const ticketDoc: Ticket = {
      lotteryId: new ObjectId(id),
      userId: new ObjectId(payload.userId),
      numbers,
      purchaseDate: now,
      transactionId: paymentIntent.id,
      status: 'purchased',
      createdAt: now,
    }

    const ticketResult = await db.collection<Ticket>('tickets').insertOne(ticketDoc)

    const payment: Payment = {
      userId: new ObjectId(payload.userId),
      lotteryId: new ObjectId(id),
      ticketId: ticketResult.insertedId,
      stripePaymentIntentId: paymentIntent.id,
      amount: lottery.ticketPrice,
      status: 'pending',
      paymentMethod: 'card',
      createdAt: now,
      updatedAt: now,
    }

    await db.collection<Payment>('payments').insertOne(payment)

    return Response.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: lottery.ticketPrice,
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
