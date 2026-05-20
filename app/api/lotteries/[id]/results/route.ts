import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { Lottery, Ticket } from '@/lib/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()

    const lottery = await db
      .collection<Lottery>('lotteries')
      .findOne({ _id: new ObjectId(id) })

    if (!lottery) {
      return Response.json({ error: 'Lottery not found' }, { status: 404 })
    }

    if (lottery.status !== 'completed' || lottery.winningNumber === null) {
      return Response.json({ error: 'Lottery drawing not completed' }, { status: 400 })
    }

    const winners = await db
      .collection<Ticket>('tickets')
      .countDocuments({ lotteryId: new ObjectId(id), status: 'won' })

    return Response.json({
      lotteryId: id,
      lotteryName: lottery.name,
      winningNumber: lottery.winningNumber,
      winnerCount: winners,
      prizeAmount: lottery.prizeAmount,
    })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
