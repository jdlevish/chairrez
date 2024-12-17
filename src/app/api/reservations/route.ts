import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const reservations = await db.reservation.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('[RESERVATIONS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { date, chairId } = await req.json()

    // Validate the request
    if (!date || !chairId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if the chair is already reserved for this date
    const existingReservation = await db.reservation.findFirst({
      where: {
        date: new Date(date),
        chairId: chairId,
      },
    })

    if (existingReservation) {
      return new NextResponse('Chair already reserved for this date', { status: 400 })
    }

    const reservation = await db.reservation.create({
      data: {
        date: new Date(date),
        chairId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('[RESERVATIONS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
