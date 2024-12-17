"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChairCalendar } from '@/components/calendar/chair-calendar'
import { Button } from '@/components/ui/button'

interface Reservation {
  date: Date
  chairId: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchReservations()
  }, [router])

  const fetchReservations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reservations')
      if (!response.ok) {
        throw new Error('Failed to fetch reservations')
      }
      const data = await response.json()
      setReservations(data.map((r: any) => ({
        ...r,
        date: new Date(r.date),
      })))
    } catch (error) {
      console.error('Error fetching reservations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReserve = async (date: Date, chairId: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      console.log('Making reservation request:', { date, chairId });

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          date: date.toISOString(),
          chairId: Number(chairId)
        }),
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reservation')
      }

      // Refresh reservations after successful booking
      await fetchReservations()
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert(error instanceof Error ? error.message : 'Failed to create reservation. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chair Reservations
          </h1>
          <Button
            variant="secondary"
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('userId')
              router.push('/login')
            }}
          >
            Sign Out
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <ChairCalendar
            reservations={reservations}
            onReserve={handleReserve}
          />
        </div>
      </div>
    </div>
  )
}
