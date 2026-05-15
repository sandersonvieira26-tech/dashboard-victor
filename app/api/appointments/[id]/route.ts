import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { UpdateStatusBody, AppointmentStatus } from '@/app/types'

const VALID_STATUSES: AppointmentStatus[] = ['scheduled', 'attended', 'no-show']

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body: UpdateStatusBody = await request.json()
  const { status } = body

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status },
    include: { client: true },
  })

  if (status === 'attended' && updated.client.isNew) {
    await prisma.client.update({
      where: { id: updated.clientId },
      data: { isNew: false },
    })
  }

  return NextResponse.json(updated)
}
