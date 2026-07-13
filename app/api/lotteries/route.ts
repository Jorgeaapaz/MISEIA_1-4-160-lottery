import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { Lottery, Ticket } from '@/lib/types'

export async function GET() {
  try {
    const db = await getDb()
    const lotteries = await db
      .collection<Lottery>('lotteries')
      .find({ status: { $in: ['pending', 'active'] } })
      .sort({ endDate: 1 })
      .toArray()

    const soldCounts = await db
      .collection<Ticket>('tickets')
      .aggregate<{ _id: ObjectId; count: number }>([
        { $match: { lotteryId: { $in: lotteries.map((l) => l._id!) } } },
        { $group: { _id: '$lotteryId', count: { $sum: 1 } } },
      ])
      .toArray()

    const soldByLottery = new Map(soldCounts.map((s) => [s._id.toString(), s.count]))

    return Response.json(
      lotteries.map((l) => ({
        id: l._id!.toString(),
        name: l.name,
        endDate: l.endDate,
        prizeAmount: l.prizeAmount,
        ticketPrice: l.ticketPrice,
        numberOfNumbers: l.numberOfNumbers,
        status: l.status,
        totalTicketsSold: soldByLottery.get(l._id!.toString()) ?? 0,
      }))
    )
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = requireAdmin(request)
    const body = await request.json()
    const { name, endDate, prizeAmount, ticketPrice, numberOfNumbers } = body

    if (!name || !endDate || !prizeAmount || !ticketPrice || !numberOfNumbers) {
      return Response.json({ error: 'All fields are required' }, { status: 400 })
    }

    const parsedEndDate = new Date(endDate)
    const minEndDate = new Date(Date.now() + 60 * 60 * 1000)
    if (parsedEndDate <= minEndDate) {
      return Response.json(
        { error: 'End date must be at least 1 hour from now' },
        { status: 400 }
      )
    }

    if (numberOfNumbers <= 0 || numberOfNumbers > 1000) {
      return Response.json({ error: 'numberOfNumbers must be between 1 and 1000' }, { status: 400 })
    }

    const db = await getDb()
    const now = new Date()

    const lottery: Lottery = {
      name,
      endDate: parsedEndDate,
      prizeAmount: Math.round(prizeAmount),
      ticketPrice: Math.round(ticketPrice),
      numberOfNumbers,
      winningNumber: null,
      status: 'active',
      totalTicketsSold: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: new ObjectId(payload.userId),
    }

    const result = await db.collection<Lottery>('lotteries').insertOne(lottery)

    return Response.json({
      id: result.insertedId.toString(),
      ...lottery,
      createdBy: lottery.createdBy.toString(),
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }
    if (err instanceof Error && err.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
