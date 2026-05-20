import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { Transfer } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request)
    const { transferId } = await request.json()

    if (!transferId) {
      return Response.json({ error: 'transferId is required' }, { status: 400 })
    }

    const db = await getDb()
    const transfer = await db
      .collection<Transfer>('transfers')
      .findOne({ _id: new ObjectId(transferId) })

    if (!transfer) {
      return Response.json({ error: 'Transfer not found' }, { status: 404 })
    }

    if (transfer.status === 'completed') {
      return Response.json({ error: 'Transfer already completed' }, { status: 400 })
    }

    // In a real scenario, call bank API here
    const bankTransferId = `BANK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    await db.collection<Transfer>('transfers').updateOne(
      { _id: new ObjectId(transferId) },
      {
        $set: {
          status: 'completed',
          bankTransferId,
          transactionDate: new Date(),
          updatedAt: new Date(),
        },
      }
    )

    return Response.json({ status: 'completed', bankTransferId })
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

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request)
    const db = await getDb()

    const transfers = await db
      .collection<Transfer>('transfers')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json(
      transfers.map((t) => ({
        id: t._id!.toString(),
        userId: t.userId.toString(),
        lotteryId: t.lotteryId.toString(),
        amount: t.amount,
        status: t.status,
        bankTransferId: t.bankTransferId,
        transactionDate: t.transactionDate,
        createdAt: t.createdAt,
      }))
    )
  } catch (err) {
    if (err instanceof Error && err.message === 'Forbidden') {
      return Response.json({ error: 'Admin access required' }, { status: 403 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
