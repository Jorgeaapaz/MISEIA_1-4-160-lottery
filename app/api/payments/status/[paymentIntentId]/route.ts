import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { Payment } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentIntentId: string }> }
) {
  try {
    requireAuth(request)
    const { paymentIntentId } = await params
    const db = await getDb()

    const payment = await db
      .collection<Payment>('payments')
      .findOne({ stripePaymentIntentId: paymentIntentId })

    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 })
    }

    return Response.json({ status: payment.status, amount: payment.amount })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
