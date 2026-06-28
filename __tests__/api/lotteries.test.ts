/**
 * Tests for GET /api/lotteries — returns active lotteries.
 * MongoDB is mocked — no infrastructure required.
 */

const mockToArray = jest.fn()
const mockSort = jest.fn().mockReturnValue({ toArray: mockToArray })
const mockFind = jest.fn().mockReturnValue({ sort: mockSort })
const mockCollection = jest.fn().mockReturnValue({ find: mockFind })
const mockGetDb = jest.fn().mockResolvedValue({ collection: mockCollection })

jest.mock('../../lib/db', () => ({ getDb: mockGetDb }))

import { GET as getLotteries } from '../../app/api/lotteries/route'

const mockLotteries = [
  {
    _id: { toString: () => 'lottery1' },
    name: 'Gran Sorteo',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    prizeAmount: 500000,
    ticketPrice: 5000,
    numberOfNumbers: 50,
    status: 'active',
    totalTicketsSold: 3,
    winningNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: { toString: () => 'admin1' },
  },
]

describe('GET /api/lotteries', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetDb.mockResolvedValue({ collection: mockCollection })
    mockCollection.mockReturnValue({ find: mockFind })
    mockFind.mockReturnValue({ sort: mockSort })
    mockSort.mockReturnValue({ toArray: mockToArray })
    mockToArray.mockResolvedValue(mockLotteries)
  })

  it('returns 200 with list of lotteries', async () => {
    const res = await getLotteries()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(1)
    expect(body[0].name).toBe('Gran Sorteo')
  })

  it('returns lotteries with id field (not _id)', async () => {
    const res = await getLotteries()
    const body = await res.json()
    expect(body[0]).toHaveProperty('id')
    expect(body[0]).not.toHaveProperty('_id')
  })

  it('returns empty array when no lotteries', async () => {
    mockToArray.mockResolvedValueOnce([])
    const res = await getLotteries()
    const body = await res.json()
    expect(body).toEqual([])
  })

  it('returns 500 on database error', async () => {
    mockGetDb.mockRejectedValueOnce(new Error('DB connection failed'))
    const res = await getLotteries()
    expect(res.status).toBe(500)
  })
})
