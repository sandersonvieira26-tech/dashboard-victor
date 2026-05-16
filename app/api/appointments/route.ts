import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateAppointmentBody } from '@/app/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') // 'day' | 'week' | 'no-shows'
  const dateParam = searchParams.get('date')

  try {
    if (mode === 'no-shows') {
      const noShows = await prisma.appointment.findMany({
        where: { status: 'no-show' },
        include: { client: true },
        orderBy: { date: 'desc' },
      })
      return NextResponse.json(noShows)
    }

    if (mode === 'week') {
      const start = dateParam ? new Date(dateParam) : new Date()
      start.setUTCHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setUTCDate(end.getUTCDate() + 7)

      const appointments = await prisma.appointment.findMany({
        where: { date: { gte: start, lt: end } },
        include: { client: true },
        orderBy: { date: 'asc' },
      })
      return NextResponse.json(appointments)
    }

    // default: day
    const date = dateParam ? new Date(dateParam) : new Date()
    date.setUTCHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)

    const appointments = await prisma.appointment.findMany({
      where: { date: { gte: date, lt: nextDay } },
      include: { client: true },
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(appointments)
  } catch (err) {
    console.error('[appointments GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body: CreateAppointmentBody = await request.json()
  const { name, phone, date } = body

  if (!name || !phone || !date) {
    return NextResponse.json(
      { error: 'name, phone e date são obrigatórios' },
      { status: 400 }
    )
  }

  const appointmentDate = new Date(date)
  if (isNaN(appointmentDate.getTime())) {
    return NextResponse.json({ error: 'Data inválida' }, { status: 400 })
  }
  appointmentDate.setUTCHours(0, 0, 0, 0)

  try {
    const client = await prisma.client.upsert({
      where: { phone },
      update: {},
      create: { name, phone },
    })

    const appointment = await prisma.appointment.create({
      data: { clientId: client.id, date: appointmentDate, status: 'scheduled' },
      include: { client: true },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (err) {
    console.error('[appointments POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
