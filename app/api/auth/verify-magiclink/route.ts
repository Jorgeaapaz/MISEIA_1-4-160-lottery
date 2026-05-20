import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyMagicLinkToken, signAuthToken } from '@/lib/auth'
import { MagicLink, User } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return Response.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify JWT structure
    let payload: { email: string }
    try {
      payload = verifyMagicLinkToken(token)
    } catch {
      return Response.json({ error: 'Token expired or invalid' }, { status: 400 })
    }

    const db = await getDb()

    // Check magic link in DB (must exist and not be used)
    const magicLink = await db.collection<MagicLink>('magicLinks').findOne({
      token,
      email: payload.email,
      used: false,
    })

    if (!magicLink || magicLink.expiresAt < new Date()) {
      return Response.json({ error: 'Token expired or invalid' }, { status: 400 })
    }

    // Mark as used
    await db.collection<MagicLink>('magicLinks').updateOne(
      { _id: magicLink._id },
      { $set: { used: true } }
    )

    // Get user
    const user = await db.collection<User>('users').findOneAndUpdate(
      { email: payload.email },
      { $set: { isAuthenticated: true, lastLogin: new Date(), updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const authUser = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      bankAccount: user.bankAccount,
    }

    const jwt = signAuthToken(authUser)

    return Response.json({ jwt, user: authUser })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
