import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: { reservationId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { reservationId } = params

    // Verify the reservation exists and belongs to the user
    const reservation = await db.reservation.findUnique({
      where: {
        id: reservationId,
        userId: session.user.id,
      },
    })

    if (!reservation) {
      return new NextResponse('Reservation not found', { status: 404 })
    }

    // Delete the reservation
    await db.reservation.delete({
      where: {
        id: reservationId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[RESERVATION_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
