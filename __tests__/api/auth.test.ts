/**
 * Tests for /api/auth/request-magiclink input validation.
 * MongoDB and email are mocked — no infrastructure required.
 */

const mockUpdateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 })
const mockInsertOne = jest.fn().mockResolvedValue({ insertedId: 'mock-id' })
const mockCollection = jest.fn().mockReturnValue({
  updateOne: mockUpdateOne,
  insertOne: mockInsertOne,
})

jest.mock('../../lib/db', () => ({
  getDb: jest.fn().mockResolvedValue({ collection: mockCollection }),
}))

jest.mock('../../lib/email', () => ({
  sendMagicLink: jest.fn().mockResolvedValue(undefined),
}))

import { POST as requestMagicLink } from '../../app/api/auth/request-magiclink/route'

describe('POST /api/auth/request-magiclink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCollection.mockReturnValue({ updateOne: mockUpdateOne, insertOne: mockInsertOne })
    mockUpdateOne.mockResolvedValue({ upsertedCount: 1 })
    mockInsertOne.mockResolvedValue({ insertedId: 'mock-id' })
  })

  it('returns 200 for valid email', async () => {
    const req = new Request('http://localhost/api/auth/request-magiclink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    }) as unknown as import('next/server').NextRequest
    const res = await requestMagicLink(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toMatch(/magic link sent/i)
  })

  it('returns 400 for missing email', async () => {
    const req = new Request('http://localhost/api/auth/request-magiclink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }) as unknown as import('next/server').NextRequest
    const res = await requestMagicLink(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid email format', async () => {
    const req = new Request('http://localhost/api/auth/request-magiclink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    }) as unknown as import('next/server').NextRequest
    const res = await requestMagicLink(req)
    expect(res.status).toBe(400)
  })
})
