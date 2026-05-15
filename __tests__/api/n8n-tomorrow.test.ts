/** @jest-environment node */
import { GET } from '@/app/api/n8n/tomorrow/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: jest.fn(),
    },
  },
}))

jest.mock('@/lib/auth', () => ({
  validateApiKey: jest.fn(),
}))

import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

const mockFindMany = prisma.appointment.findMany as jest.Mock
const mockValidateApiKey = validateApiKey as jest.MockedFunction<typeof validateApiKey>

beforeEach(() => jest.clearAllMocks())

describe('GET /api/n8n/tomorrow', () => {
  it('returns 401 when API key is invalid', async () => {
    mockValidateApiKey.mockReturnValue(false)
    const req = new Request('http://localhost/api/n8n/tomorrow')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns appointments scheduled for tomorrow', async () => {
    mockValidateApiKey.mockReturnValue(true)
    mockFindMany.mockResolvedValue([
      {
        date: new Date('2026-05-16T00:00:00.000Z'),
        client: { name: 'Maria Santos', phone: '(11) 99999-0003' },
        status: 'scheduled',
      },
    ])
    const req = new Request('http://localhost/api/n8n/tomorrow')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual([
      { clientName: 'Maria Santos', phone: '(11) 99999-0003', appointmentDate: '2026-05-16' },
    ])
  })

  it('returns 500 when database query fails', async () => {
    mockValidateApiKey.mockReturnValue(true)
    mockFindMany.mockRejectedValue(new Error('DB error'))
    const req = new Request('http://localhost/api/n8n/tomorrow')
    const res = await GET(req)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Internal server error')
  })

  it('queries for the correct date range (tomorrow UTC)', async () => {
    mockValidateApiKey.mockReturnValue(true)
    mockFindMany.mockResolvedValue([])
    const req = new Request('http://localhost/api/n8n/tomorrow')
    const before = new Date()
    await GET(req)
    const after = new Date()

    const call = mockFindMany.mock.calls[0][0]
    const gte: Date = call.where.date.gte
    const lt: Date = call.where.date.lt

    // gte should be tomorrow midnight UTC, lt should be day-after-tomorrow midnight UTC
    const tomorrowStart = new Date(before)
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1)
    tomorrowStart.setUTCHours(0, 0, 0, 0)

    const tomorrowEnd = new Date(tomorrowStart)
    tomorrowEnd.setUTCDate(tomorrowEnd.getUTCDate() + 1)

    expect(gte.getTime()).toBeGreaterThanOrEqual(tomorrowStart.getTime())
    expect(gte.getTime()).toBeLessThanOrEqual(tomorrowEnd.getTime())
    expect(lt.getTime()).toBeGreaterThan(gte.getTime())
  })
})
