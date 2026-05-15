/** @jest-environment node */
import { GET } from '@/app/api/clients/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    client: {
      findMany: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockFindMany = prisma.client.findMany as jest.Mock

beforeEach(() => jest.clearAllMocks())

describe('GET /api/clients', () => {
  it('returns list of clients with their appointments', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'c1',
        name: 'Ana Lima',
        phone: '(11) 99999-0001',
        isNew: false,
        createdAt: new Date('2026-05-01'),
        appointments: [
          { id: 'a1', date: new Date('2026-05-15'), status: 'attended' },
        ],
      },
    ])
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Ana Lima')
    expect(data[0].appointments).toHaveLength(1)
  })

  it('returns 500 when database query fails', async () => {
    mockFindMany.mockRejectedValue(new Error('DB error'))
    const res = await GET()
    expect(res.status).toBe(500)
  })
})
