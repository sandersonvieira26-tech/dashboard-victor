import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)

  const dayAfter = new Date(tomorrow)
  dayAfter.setUTCDate(dayAfter.getUTCDate() + 1)

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: tomorrow, lt: dayAfter },
        status: 'scheduled',
      },
      include: { client: true },
      orderBy: { date: 'asc' },
    })

    const result = appointments.map((a) => ({
      clientName: a.client.name,
      phone: a.client.phone,
      appointmentDate: a.date.toISOString().split('T')[0],
    }))

    return NextResponse.json(result)
  } catch (err) {
    console.error('[tomorrow]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
