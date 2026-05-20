import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { Ticket, Lottery } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request)
    const db = await getDb()

    const tickets = await db
      .collection<Ticket>('tickets')
      .find({ userId: new ObjectId(payload.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    const lotteryIds = [...new Set(tickets.map((t) => t.lotteryId.toString()))]
    const lotteries = await db
      .collection<Lottery>('lotteries')
      .find({ _id: { $in: lotteryIds.map((id) => new ObjectId(id)) } })
      .toArray()

    const lotteryMap = Object.fromEntries(lotteries.map((l) => [l._id!.toString(), l.name]))

    return Response.json(
      tickets.map((t) => ({
        id: t._id!.toString(),
        lotteryId: t.lotteryId.toString(),
        lotteryName: lotteryMap[t.lotteryId.toString()] || 'Lotería',
        numbers: t.numbers,
        purchaseDate: t.purchaseDate,
        status: t.status,
      }))
    )
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
