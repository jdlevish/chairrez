// Import necessary dependencies
import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, isWeekend, startOfDay } from 'date-fns'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import 'react-day-picker/dist/style.css'

// Define types for reservations data structure
interface Reservation {
  date: Date
  chairId: number
}

// Define props interface for the ChairCalendar component
interface ChairCalendarProps {
  reservations: Reservation[]  // Array of existing reservations
  onReserve: (date: Date, chairId: number) => Promise<void>  // Callback function for making reservations
}

export function ChairCalendar({ reservations, onReserve }: ChairCalendarProps) {
  // State management for selected date, modal visibility, and selected chair
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChairId, setSelectedChairId] = useState<number>()

  // Calculate number of available chairs for a given date
  const getAvailableChairs = (date: Date) => {
    const normalizedDate = startOfDay(date)
    // Maximum chairs available: 2 for weekends, 1 for weekdays
    const maxChairs = isWeekend(normalizedDate) ? 2 : 1
    // Count existing reservations for the date
    const reservedChairs = reservations.filter(
      r => format(new Date(r.date), 'yyyy-MM-dd') === format(normalizedDate, 'yyyy-MM-dd')
    ).length
    return maxChairs - reservedChairs
  }

  // Handle day selection in the calendar
  const handleDayClick = (date: Date) => {
    const normalizedDate = startOfDay(date)
    setSelectedDate(normalizedDate)
    const availableChairs = getAvailableChairs(normalizedDate)
    
    if (availableChairs > 0) {
      // Find first available chair ID from chairs 1 or 2
      const reservedChairIds = reservations
        .filter(r => format(new Date(r.date), 'yyyy-MM-dd') === format(normalizedDate, 'yyyy-MM-dd'))
        .map(r => r.chairId)
      
      const chairId = [1, 2].find(id => !reservedChairIds.includes(id)) || 1
      setSelectedChairId(chairId)
      setIsModalOpen(true)
    }
  }

  // Handle reservation confirmation
  const handleReserve = async () => {
    if (selectedDate && selectedChairId) {
      await onReserve(selectedDate, selectedChairId)
      // Reset state after successful reservation
      setIsModalOpen(false)
      setSelectedDate(undefined)
      setSelectedChairId(undefined)
    }
  }

  // Prevent selection of past dates
  const disabledDays = { before: new Date() }

  return (
    <>
      {/* Calendar container with styling */}
      <div className="p-4 bg-white rounded-lg shadow">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && handleDayClick(date)}
          disabled={disabledDays}
          modifiers={{
            available: (date) => getAvailableChairs(date) > 0,  // Highlight days with available chairs
            weekend: (date) => isWeekend(date),  // Highlight weekend days
          }}
          modifiersStyles={{
            available: { color: 'green' },
            weekend: { color: 'blue' },
          }}
        />
        {/* Legend explaining calendar markings */}
        <div className="mt-4 space-y-2 text-sm">
          <p>🟢 Available chairs for selected date</p>
          <p>🔵 Weekend (2 chairs available)</p>
          <p>⚪ Weekday (1 chair available)</p>
        </div>
      </div>

      {/* Confirmation modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Reservation"
      >
        <div className="space-y-4">
          <p>
            Would you like to reserve Chair #{selectedChairId} for{' '}
            {selectedDate && format(selectedDate, 'MMMM do, yyyy')}?
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReserve}>
              Confirm Reservation
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
