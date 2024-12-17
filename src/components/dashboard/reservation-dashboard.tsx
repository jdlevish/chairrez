"use client"

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Reservation {
  id: string
  date: Date
  chairId: number
  createdAt: Date
}

interface ReservationDashboardProps {
  reservations: Reservation[]
  onCancelReservation: (reservationId: string) => Promise<void>
}

export function ReservationDashboard({ 
  reservations, 
  onCancelReservation 
}: ReservationDashboardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Sort reservations by date (most recent first)
  const sortedReservations = [...reservations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const handleCancelReservation = async (reservationId: string) => {
    try {
      setIsLoading(reservationId)
      await onCancelReservation(reservationId)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reservations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Chair</TableHead>
              <TableHead>Reserved On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No reservations found
                </TableCell>
              </TableRow>
            ) : (
              sortedReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    {format(new Date(reservation.date), 'MMMM d, yyyy')}
                  </TableCell>
                  <TableCell>Chair #{reservation.chairId}</TableCell>
                  <TableCell>
                    {format(new Date(reservation.createdAt), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelReservation(reservation.id)}
                      disabled={isLoading === reservation.id}
                    >
                      {isLoading === reservation.id ? 'Canceling...' : 'Cancel'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
