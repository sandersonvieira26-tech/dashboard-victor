/**
 * @jest-environment node
 */
// __tests__/api/appointments-id.test.ts
import { PATCH } from '@/app/api/appointments/[id]/route'

const mockTxAppointmentUpdate = jest.fn()
const mockTxClientUpdate = jest.fn()
const mockTx = {
  appointment: { update: mockTxAppointmentUpdate },
  client: { update: mockTxClientUpdate },
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn((fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
  },
}))

import { prisma } from '@/lib/prisma'

describe('PATCH /api/appointments/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(prisma.$transaction as jest.Mock).mockImplementation(
      (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)
    )
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
    mockTxAppointmentUpdate.mockResolvedValue(mockAppointment)
    mockTxClientUpdate.mockResolvedValue({})

    const req = new Request('http://localhost/api/appointments/a1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'attended' }),
    })
    const res = await PATCH(req, { params: { id: 'a1' } })
    expect(res.status).toBe(200)
    expect(mockTxClientUpdate).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { isNew: false },
    })
  })

  it('não atualiza isNew ao marcar no-show', async () => {
    const mockAppointment = {
      id: 'a1', status: 'no-show', clientId: 'c1',
      client: { id: 'c1', isNew: true },
    }
    mockTxAppointmentUpdate.mockResolvedValue(mockAppointment)

    const req = new Request('http://localhost/api/appointments/a1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'no-show' }),
    })
    await PATCH(req, { params: { id: 'a1' } })
    expect(mockTxClientUpdate).not.toHaveBeenCalled()
  })
})
