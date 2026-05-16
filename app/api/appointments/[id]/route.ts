import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { UpdateStatusBody, AppointmentStatus } from '@/app/types'

const VALID_STATUSES: AppointmentStatus[] = ['scheduled', 'attended', 'no-show']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateStatusBody = await request.json()
    const { status } = body

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.update({
        where: { id },
        data: { status },
        include: { client: true },
      })

      if (status === 'attended' && appt.client.isNew) {
        await tx.client.update({
          where: { id: appt.clientId },
          data: { isNew: false },
        })
      }

      return appt
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }
    console.error('[appointments PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
