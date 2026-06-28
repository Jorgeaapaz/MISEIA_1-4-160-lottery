import {
  signMagicLinkToken,
  verifyMagicLinkToken,
  signAuthToken,
  verifyAuthToken,
  getAuthHeader,
  requireAuth,
  requireAdmin,
} from '../../lib/auth'
import jwt from 'jsonwebtoken'

const mockAdminUser = {
  id: 'user123',
  email: 'admin@lottery.local',
  name: 'Admin',
  role: 'admin' as const,
  bankAccount: null,
}

const mockUser = {
  id: 'user456',
  email: 'user@example.com',
  name: 'Test User',
  role: 'user' as const,
  bankAccount: null,
}

describe('Magic Link Token', () => {
  it('signs and verifies a magic link token', () => {
    const token = signMagicLinkToken('test@example.com')
    const payload = verifyMagicLinkToken(token)
    expect(payload.email).toBe('test@example.com')
    expect(payload.type).toBe('magic-link')
  })

  it('throws on tampered magic link token', () => {
    const token = signMagicLinkToken('test@example.com')
    expect(() => verifyMagicLinkToken(token + 'x')).toThrow()
  })

  it('throws if token type is not magic-link', () => {
    const authToken = signAuthToken(mockAdminUser)
    expect(() => verifyMagicLinkToken(authToken)).toThrow('Invalid token type')
  })
})

describe('Auth Token', () => {
  it('signs and verifies an auth token', () => {
    const token = signAuthToken(mockAdminUser)
    const payload = verifyAuthToken(token)
    expect(payload.userId).toBe('user123')
    expect(payload.email).toBe('admin@lottery.local')
    expect(payload.role).toBe('admin')
  })

  it('signs and verifies a user role token', () => {
    const token = signAuthToken(mockUser)
    const payload = verifyAuthToken(token)
    expect(payload.role).toBe('user')
  })

  it('throws on expired token', () => {
    const expired = jwt.sign(
      { userId: 'x', email: 'x@x.com', role: 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: -1 }
    )
    expect(() => verifyAuthToken(expired)).toThrow()
  })
})

describe('getAuthHeader', () => {
  it('returns token from Bearer header', () => {
    const req = new Request('http://localhost', {
      headers: { Authorization: 'Bearer mytoken' },
    })
    expect(getAuthHeader(req)).toBe('mytoken')
  })

  it('returns null if no Authorization header', () => {
    const req = new Request('http://localhost')
    expect(getAuthHeader(req)).toBeNull()
  })

  it('returns null if header does not start with Bearer', () => {
    const req = new Request('http://localhost', {
      headers: { Authorization: 'Basic abc' },
    })
    expect(getAuthHeader(req)).toBeNull()
  })
})

describe('requireAuth', () => {
  it('returns payload for valid token', () => {
    const token = signAuthToken(mockAdminUser)
    const req = new Request('http://localhost', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const payload = requireAuth(req)
    expect(payload.userId).toBe('user123')
  })

  it('throws Unauthorized if no token', () => {
    const req = new Request('http://localhost')
    expect(() => requireAuth(req)).toThrow('Unauthorized')
  })
})

describe('requireAdmin', () => {
  it('returns payload for admin user', () => {
    const token = signAuthToken(mockAdminUser)
    const req = new Request('http://localhost', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const payload = requireAdmin(req)
    expect(payload.role).toBe('admin')
  })

  it('throws Forbidden for non-admin user', () => {
    const token = signAuthToken(mockUser)
    const req = new Request('http://localhost', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(() => requireAdmin(req)).toThrow('Forbidden')
  })
})
