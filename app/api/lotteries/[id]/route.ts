import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
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

    const totalTicketsSold = await db
      .collection<Ticket>('tickets')
      .countDocuments({ lotteryId: lottery._id })

    return Response.json({
      id: lottery._id!.toString(),
      name: lottery.name,
      endDate: lottery.endDate,
      prizeAmount: lottery.prizeAmount,
      ticketPrice: lottery.ticketPrice,
      numberOfNumbers: lottery.numberOfNumbers,
      status: lottery.status,
      totalTicketsSold,
      winningNumber: lottery.winningNumber,
    })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request)
    const { id } = await params
    const body = await request.json()
    const { name, endDate, prizeAmount, ticketPrice, numberOfNumbers } = body

    const db = await getDb()
    const lottery = await db
      .collection<Lottery>('lotteries')
      .findOne({ _id: new ObjectId(id) })

    if (!lottery) {
      return Response.json({ error: 'Lottery not found' }, { status: 404 })
    }

    if (lottery.status !== 'pending') {
      return Response.json(
        { error: 'Lottery cannot be modified in current status' },
        { status: 400 }
      )
    }

    const update: Partial<Lottery> = { updatedAt: new Date() }
    if (name) update.name = name
    if (endDate) update.endDate = new Date(endDate)
    if (prizeAmount !== undefined) update.prizeAmount = Math.round(prizeAmount)
    if (ticketPrice !== undefined) update.ticketPrice = Math.round(ticketPrice)
    if (numberOfNumbers !== undefined) update.numberOfNumbers = numberOfNumbers

    const updated = await db
      .collection<Lottery>('lotteries')
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: 'after' }
      )

    return Response.json({
      id: updated!._id!.toString(),
      name: updated!.name,
      endDate: updated!.endDate,
      prizeAmount: updated!.prizeAmount,
      ticketPrice: updated!.ticketPrice,
      numberOfNumbers: updated!.numberOfNumbers,
      status: updated!.status,
      totalTicketsSold: updated!.totalTicketsSold,
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
