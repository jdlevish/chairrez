"use client"

import { useEffect, useState } from 'react'
import { ChairCalendar } from '@/components/calendar/chair-calendar'
import { ReservationDashboard } from '@/components/dashboard/reservation-dashboard'

interface Reservation {
  id: string
  date: Date
  chairId: number
  createdAt: Date
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user's reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('/api/reservations')
        if (!response.ok) throw new Error('Failed to fetch reservations')
        const data = await response.json()
        setReservations(data)
      } catch (error) {
        console.error('Error fetching reservations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const handleReserve = async (date: Date, chairId: number) => {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, chairId }),
      })

      if (!response.ok) throw new Error('Failed to create reservation')
      
      const newReservation = await response.json()
      setReservations(prev => [...prev, newReservation])
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to cancel reservation')
      
      setReservations(prev => 
        prev.filter(reservation => reservation.id !== reservationId)
      )
    } catch (error) {
      console.error('Error canceling reservation:', error)
      throw error
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Chair Reservations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ChairCalendar
          reservations={reservations}
          onReserve={handleReserve}
        />
        <ReservationDashboard
          reservations={reservations}
          onCancelReservation={handleCancelReservation}
        />
      </div>
    </div>
  )
}
