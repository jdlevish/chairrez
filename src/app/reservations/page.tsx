import { ReservationDashboard } from "@/components/dashboard/reservation-dashboard"

// This is a temporary mock data - replace with actual data fetching
const mockReservations = [
  {
    id: "1",
    date: new Date(),
    chairId: 1,
    createdAt: new Date(),
  },
]

export default function ReservationsPage() {
  const handleCancelReservation = async (reservationId: string) => {
    // Implement your cancellation logic here
    console.log("Cancelling reservation:", reservationId)
  }

  return (
    <div className="container mx-auto py-10">
      <ReservationDashboard 
        reservations={mockReservations}
        onCancelReservation={handleCancelReservation}
      />
    </div>
  )
}
