import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        appointments: {
          select: { id: true, date: true, status: true },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(clients)
  } catch (err) {
    console.error('[clients]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
