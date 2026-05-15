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
    await GET(req)

    const call = mockFindMany.mock.calls[0][0]
    const gte: Date = call.where.date.gte
    const lt: Date = call.where.date.lt

    // lt should be exactly 24 hours after gte (one full day)
    expect(lt.getTime() - gte.getTime()).toBe(24 * 60 * 60 * 1000)

    // gte should be at UTC midnight (hours, minutes, seconds, ms all zero)
    expect(gte.getUTCHours()).toBe(0)
    expect(gte.getUTCMinutes()).toBe(0)
    expect(gte.getUTCSeconds()).toBe(0)
    expect(gte.getUTCMilliseconds()).toBe(0)

    // gte should be tomorrow (getUTCDate of gte should equal today's UTC date + 1, modulo month boundaries)
    const today = new Date()
    const expectedTomorrow = new Date(today)
    expectedTomorrow.setUTCDate(expectedTomorrow.getUTCDate() + 1)
    expectedTomorrow.setUTCHours(0, 0, 0, 0)
    expect(gte.getTime()).toBe(expectedTomorrow.getTime())
  })
})
