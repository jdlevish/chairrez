import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

export async function GET(req: Request) {
  console.log('GET /api/reservations called');
  try {
    const reservations = await prisma.reservation.findMany({
      select: {
        date: true,
        chairId: true,
      },
    });
    console.log('Reservations fetched:', reservations);
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('POST /api/reservations called');
  try {
    // Log headers
    console.log('Headers:', Object.fromEntries(request.headers.entries()));

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log('Invalid token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);

    const { date, chairId } = body;
    if (!date || !chairId) {
      console.log('Missing required fields:', { date, chairId });
      return NextResponse.json(
        { error: 'Missing required fields: date and chairId' },
        { status: 400 }
      );
    }

    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime())) {
      console.log('Invalid date:', date);
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    try {
      // Check if reservation exists
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          date: reservationDate,
          chairId: Number(chairId),
        },
      });

      if (existingReservation) {
        console.log('Reservation already exists:', existingReservation);
        return NextResponse.json(
          { error: 'This chair is already reserved for the selected date' },
          { status: 409 }
        );
      }

      console.log('Creating reservation with:', {
        date: reservationDate,
        chairId: Number(chairId),
        userId: payload.userId,
      });

      const reservation = await prisma.reservation.create({
        data: {
          date: reservationDate,
          chairId: Number(chairId),
          userId: payload.userId,
        },
      });

      console.log('Reservation created:', reservation);
      return NextResponse.json(reservation, { status: 201 });
    } catch (prismaError) {
      console.error('Prisma error:', prismaError);
      return NextResponse.json(
        { error: 'Database operation failed', details: prismaError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/reservations:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
