import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { User, BankAccount } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request)
    const db = await getDb()

    const user = await db.collection<User>('users').findOne({
      _id: new ObjectId(payload.userId),
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      bankAccount: user.bankAccount,
    })
  } catch (err) {
    if (err instanceof Error && (err.message === 'Unauthorized' || err.message === 'Forbidden')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request)
    const body = await request.json()
    const { name, bankAccount } = body as { name: string; bankAccount: BankAccount }

    if (!name || !bankAccount) {
      return Response.json({ error: 'Name and bank account are required' }, { status: 400 })
    }

    if (!bankAccount.accountHolder || !bankAccount.iban) {
      return Response.json({ error: 'Invalid bank account information' }, { status: 400 })
    }

    const db = await getDb()

    const user = await db.collection<User>('users').findOneAndUpdate(
      { _id: new ObjectId(payload.userId) },
      { $set: { name, bankAccount, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json({
      message: 'Profile updated',
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        bankAccount: user.bankAccount,
      },
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
