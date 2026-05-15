/** @jest-environment node */
import { GET } from '@/app/api/n8n/no-shows/route'

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

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockValidateApiKey = validateApiKey as jest.MockedFunction<typeof validateApiKey>

beforeEach(() => jest.clearAllMocks())

describe('GET /api/n8n/no-shows', () => {
  it('returns 401 when API key is invalid', async () => {
    mockValidateApiKey.mockReturnValue(false)
    const req = new Request('http://localhost/api/n8n/no-shows')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns no-show list when API key is valid (default last 7 days)', async () => {
    mockValidateApiKey.mockReturnValue(true)
    ;(mockPrisma.appointment.findMany as jest.Mock).mockResolvedValue([
      {
        date: new Date('2026-05-10T00:00:00.000Z'),
        client: { name: 'Carlos Melo', phone: '(11) 99999-0002' },
      },
    ])
    const req = new Request('http://localhost/api/n8n/no-shows')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual([
      { clientName: 'Carlos Melo', phone: '(11) 99999-0002', missedDate: '2026-05-10' },
    ])
  })

  it('filters by ?since param when provided', async () => {
    mockValidateApiKey.mockReturnValue(true)
    ;(mockPrisma.appointment.findMany as jest.Mock).mockResolvedValue([])
    const req = new Request('http://localhost/api/n8n/no-shows?since=2026-05-01')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const call = (mockPrisma.appointment.findMany as jest.Mock).mock.calls[0][0]
    expect(call.where.date.gte).toEqual(new Date('2026-05-01T00:00:00.000Z'))
  })

  it('returns 400 when since param is not a valid date', async () => {
    mockValidateApiKey.mockReturnValue(true)
    const req = new Request('http://localhost/api/n8n/no-shows?since=not-a-date')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Invalid since date')
  })

  it('returns 500 when database query fails', async () => {
    mockValidateApiKey.mockReturnValue(true)
    ;(mockPrisma.appointment.findMany as jest.Mock).mockRejectedValue(new Error('DB error'))
    const req = new Request('http://localhost/api/n8n/no-shows')
    const res = await GET(req)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Internal server error')
  })
})
