import { WeekSchedule } from '../../types'
import { Button } from '../ui/button'

interface ScheduleHeaderProps {
  currentWeek: number
  totalWeeks: number
  displayedWeek: WeekSchedule
  onWeekChange: (week: number) => void
  onViewChange: (view: 'week' | 'month') => void
  view: 'week' | 'month'
}

export function ScheduleHeader({
  currentWeek,
  totalWeeks,
  displayedWeek,
  onWeekChange,
  onViewChange,
  view
}: ScheduleHeaderProps) {
  const dateFormat = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const startDate = displayedWeek.startDate
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 4) // Show Monday-Friday

  return (
    <div className="flex items-center justify-between bg-card p-4 rounded-lg">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => onWeekChange(Math.max(0, currentWeek - 1))}
          disabled={currentWeek === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onWeekChange(Math.min(totalWeeks - 1, currentWeek + 1))}
          disabled={currentWeek === totalWeeks - 1}
        >
          Next
        </Button>
      </div>
      
      <div className="text-lg font-semibold">
        {view === 'week' ? (
          `${dateFormat.format(startDate)} - ${dateFormat.format(endDate)}`
        ) : (
          dateFormat.format(startDate)
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => onViewChange('week')}
          className={view === 'week' ? 'bg-primary text-primary-foreground' : ''}
        >
          Week
        </Button>
        <Button
          variant="outline"
          onClick={() => onViewChange('month')}
          className={view === 'month' ? 'bg-primary text-primary-foreground' : ''}
        >
          Month
        </Button>
      </div>
    </div>
  )
}
