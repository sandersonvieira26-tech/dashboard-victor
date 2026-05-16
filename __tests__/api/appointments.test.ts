/**
 * @jest-environment node
 */
// __tests__/api/appointments.test.ts
import { GET, POST } from '@/app/api/appointments/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    client: {
      upsert: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

beforeEach(() => jest.clearAllMocks())

describe('POST /api/appointments', () => {
  it('retorna 400 quando campos obrigatórios estão ausentes', async () => {
    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ana' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando data é inválida', async () => {
    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ana Lima', phone: '11999990001', date: 'nao-e-data' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('inválida')
  })

  it('cria agendamento usando upsert no cliente', async () => {
    const mockClient = {
      id: 'c1', name: 'Ana Lima', phone: '11999990001',
      isNew: true, createdAt: new Date().toISOString(),
    }
    const mockAppointment = {
      id: 'a1', date: new Date('2026-05-16'), status: 'scheduled',
      clientId: 'c1', client: mockClient, createdAt: new Date().toISOString(),
    }
    ;(prisma.client.upsert as jest.Mock).mockResolvedValue(mockClient)
    ;(prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment)

    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ana Lima', phone: '11999990001', date: '2026-05-16' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(prisma.client.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { phone: '11999990001' } })
    )
  })
})

describe('GET /api/appointments', () => {
  it('retorna lista de agendamentos do dia', async () => {
    ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([])
    const req = new Request('http://localhost/api/appointments')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })
})
