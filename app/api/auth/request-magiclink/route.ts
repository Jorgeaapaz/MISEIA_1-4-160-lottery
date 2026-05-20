import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { signMagicLinkToken } from '@/lib/auth'
import { sendMagicLink } from '@/lib/email'
import { MagicLink, User } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Invalid email' }, { status: 400 })
    }

    const db = await getDb()
    const normalizedEmail = email.toLowerCase().trim()

    // Upsert user
    await db.collection<User>('users').updateOne(
      { email: normalizedEmail },
      {
        $setOnInsert: {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          role: 'user',
          bankAccount: null,
          isAuthenticated: false,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Generate token and save magic link
    const token = signMagicLinkToken(normalizedEmail)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await db.collection<MagicLink>('magicLinks').insertOne({
      email: normalizedEmail,
      token,
      expiresAt,
      used: false,
      createdAt: new Date(),
    })

    await sendMagicLink(normalizedEmail, token)

    return Response.json({ message: 'Magic link sent to email' })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
