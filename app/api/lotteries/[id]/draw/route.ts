import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { Lottery, Ticket, Transfer, User } from '@/lib/types'
import { sendWinnerNotification } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
    const { id } = await params
    const db = await getDb()

    const lottery = await db
      .collection<Lottery>('lotteries')
      .findOne({ _id: new ObjectId(id) })

    if (!lottery) {
      return Response.json({ error: 'Lottery not found' }, { status: 404 })
    }

    if (lottery.status !== 'active') {
      return Response.json({ error: 'Lottery not ready for drawing' }, { status: 400 })
    }

    // Generate winning number
    const winningNumber = Math.floor(Math.random() * lottery.numberOfNumbers)

    // Find winning tickets
    const winningTickets = await db
      .collection<Ticket>('tickets')
      .find({ lotteryId: new ObjectId(id), numbers: winningNumber })
      .toArray()

    const now = new Date()

    // Update lottery status
    await db.collection<Lottery>('lotteries').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'completed', winningNumber, updatedAt: now } }
    )

    // Update all tickets
    await db.collection<Ticket>('tickets').updateMany(
      { lotteryId: new ObjectId(id) },
      { $set: { status: 'lost' } }
    )

    if (winningTickets.length > 0) {
      await db.collection<Ticket>('tickets').updateMany(
        { _id: { $in: winningTickets.map((t) => t._id!) } },
        { $set: { status: 'won' } }
      )
    }

    // Collect unique winner user IDs
    const winnerUserIds = [...new Set(winningTickets.map((t) => t.userId.toString()))]

    const winners = []
    for (const userId of winnerUserIds) {
      const user = await db
        .collection<User>('users')
        .findOne({ _id: new ObjectId(userId) })

      if (!user) continue

      // Create transfer record
      const transfer: Transfer = {
        userId: new ObjectId(userId),
        lotteryId: new ObjectId(id),
        amount: lottery.prizeAmount,
        status: 'pending',
        bankTransferId: '',
        transactionDate: null,
        createdAt: now,
        updatedAt: now,
      }

      await db.collection<Transfer>('transfers').insertOne(transfer)

      // Send winner notification email
      await sendWinnerNotification(user.email, lottery.name, lottery.prizeAmount)

      winners.push({
        userId,
        email: user.email,
        prizeAmount: lottery.prizeAmount,
      })
    }

    return Response.json({
      lotteryId: id,
      winningNumber,
      status: 'completed',
      winners,
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
