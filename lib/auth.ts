import jwt from 'jsonwebtoken'
import { AuthUser } from './types'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export interface MagicLinkPayload {
  email: string
  type: 'magic-link'
}

export function signMagicLinkToken(email: string): string {
  return jwt.sign({ email, type: 'magic-link' }, JWT_SECRET, { expiresIn: '15m' })
}

export function verifyMagicLinkToken(token: string): MagicLinkPayload {
  const payload = jwt.verify(token, JWT_SECRET) as MagicLinkPayload
  if (payload.type !== 'magic-link') {
    throw new Error('Invalid token type')
  }
  return payload
}

export function signAuthToken(user: AuthUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyAuthToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function getAuthHeader(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null
  return auth.slice(7)
}

export function requireAuth(request: Request): JwtPayload {
  const token = getAuthHeader(request)
  if (!token) throw new Error('Unauthorized')
  return verifyAuthToken(token)
}

export function requireAdmin(request: Request): JwtPayload {
  const payload = requireAuth(request)
  if (payload.role !== 'admin') throw new Error('Forbidden')
  return payload
}
