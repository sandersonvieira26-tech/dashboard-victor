/**
 * @jest-environment node
 */
// __tests__/api/appointments-id.test.ts
import { PATCH } from '@/app/api/appointments/[id]/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: { update: jest.fn() },
    client: { update: jest.fn() },
  },
}))

import { prisma } from '@/lib/prisma'

describe('PATCH /api/appointments/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 400 para status inválido', async () => {
    const req = new Request('http://localhost/api/appointments/a1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalido' }),
    })
    const res = await PATCH(req, { params: { id: 'a1' } })
    expect(res.status).toBe(400)
  })

  it('atualiza status e marca cliente como não-novo ao marcar attended', async () => {
    const mockAppointment = {
      id: 'a1', status: 'attended', clientId: 'c1',
      client: { id: 'c1', isNew: true },
    }
    ;(prisma.appointment.update as jest.Mock).mockResolvedValue(mockAppointment)
    ;(prisma.client.update as jest.Mock).mockResolvedValue({})

    const req = new Request('http://localhost/api/appointments/a1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'attended' }),
    })
    const res = await PATCH(req, { params: { id: 'a1' } })
    expect(res.status).toBe(200)
    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { isNew: false },
    })
  })

  it('não atualiza isNew ao marcar no-show', async () => {
    const mockAppointment = {
      id: 'a1', status: 'no-show', clientId: 'c1',
      client: { id: 'c1', isNew: true },
    }
    ;(prisma.appointment.update as jest.Mock).mockResolvedValue(mockAppointment)

    const req = new Request('http://localhost/api/appointments/a1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'no-show' }),
    })
    await PATCH(req, { params: { id: 'a1' } })
    expect(prisma.client.update).not.toHaveBeenCalled()
  })
})
