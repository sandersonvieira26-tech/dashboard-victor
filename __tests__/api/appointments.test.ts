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
      findFirst: jest.fn(),
      create: jest.fn(),
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

  it('cria cliente novo e agendamento quando telefone não existe', async () => {
    const mockClient = {
      id: 'c1', name: 'Ana Lima', phone: '11999990001',
      isNew: true, createdAt: new Date().toISOString(),
    }
    const mockAppointment = {
      id: 'a1', date: new Date('2026-05-16'), status: 'scheduled',
      clientId: 'c1', client: mockClient, createdAt: new Date().toISOString(),
    }
    ;(prisma.client.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.client.create as jest.Mock).mockResolvedValue(mockClient)
    ;(prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment)

    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ana Lima', phone: '11999990001', date: '2026-05-16' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })

  it('reutiliza cliente existente pelo telefone', async () => {
    const existingClient = {
      id: 'c1', name: 'Ana Lima', phone: '11999990001',
      isNew: false, createdAt: new Date().toISOString(),
    }
    const mockAppointment = {
      id: 'a2', date: new Date('2026-05-20'), status: 'scheduled',
      clientId: 'c1', client: existingClient, createdAt: new Date().toISOString(),
    }
    ;(prisma.client.findFirst as jest.Mock).mockResolvedValue(existingClient)
    ;(prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment)

    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Ana Lima', phone: '11999990001', date: '2026-05-20' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(prisma.client.create).not.toHaveBeenCalled()
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
