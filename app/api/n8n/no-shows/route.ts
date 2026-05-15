import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateApiKey } from '@/lib/auth'

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const sinceParam = searchParams.get('since')

  let since: Date
  if (sinceParam) {
    since = new Date(`${sinceParam}T00:00:00.000Z`)
  } else {
    since = new Date()
    since.setDate(since.getDate() - 7)
    since.setHours(0, 0, 0, 0)
  }

  const noShows = await prisma.appointment.findMany({
    where: { status: 'no-show', date: { gte: since } },
    include: { client: true },
    orderBy: { date: 'desc' },
  })

  const result = noShows.map((a) => ({
    clientName: a.client.name,
    phone: a.client.phone,
    missedDate: a.date.toISOString().split('T')[0],
  }))

  return NextResponse.json(result)
}
