import { useMemo } from 'react'
import { Schedule, ScheduledClass, WeekSchedule, BlackoutPeriod } from '../../types'
import { scheduleUtils } from '../../utils/schedule'
import { ScheduleCell } from './ScheduleCell'

interface MonthViewProps {
  schedule?: Schedule
  weekSchedules: WeekSchedule[]
  blackoutPeriods: BlackoutPeriod[]
  startDate: Date
  onClassClick?: (scheduledClass: ScheduledClass) => void
  onClassDrop?: (classId: string, period: number, date: Date) => void
  onPeriodClick?: (period: number, date: Date) => void
}

export function MonthView({
  schedule,
  weekSchedules,
  blackoutPeriods,
  startDate,
  onClassClick,
  onClassDrop,
  onPeriodClick
}: MonthViewProps) {
  // Get the start of the month
  const monthStart = useMemo(() => {
    const date = new Date(startDate)
    date.setDate(1)
    return date
  }, [startDate])

  // Get the end of the month
  const monthEnd = useMemo(() => {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + 1)
    date.setDate(0)
    return date
  }, [startDate])

  // Get all days in the month
  const days = useMemo(() => {
    const result = []
    let currentDate = new Date(monthStart)

    // Start from the first Monday before the month start
    while (currentDate.getDay() !== 1) {
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // Generate weeks until we reach the first Monday after month end
    while (currentDate <= monthEnd || currentDate.getDay() !== 1) {
      const weekDays = []
      for (let i = 0; i < 7; i++) {
        weekDays.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }
      result.push(weekDays)
    }

    return result
  }, [monthStart, monthEnd])

  // Find classes for a specific date
  const getClassesForDate = (date: Date) => {
    const week = weekSchedules.find(w => 
      date >= w.startDate && date <= w.endDate
    )
    if (!week) return []

    const day = week.days.find(d => 
      scheduleUtils.isSameDay(d.date, date)
    )
    return day?.classes || []
  }

  return (
    <div className="bg-card rounded-lg p-4">
      {/* Month Header */}
      <div className="text-xl font-semibold mb-4 text-center">
        {monthStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-sm font-medium text-center py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((week, weekIndex) => 
          week.map((date, dayIndex) => {
            const isCurrentMonth = date.getMonth() === monthStart.getMonth()
            const isWeekend = date.getDay() === 0 || date.getDay() === 6
            const isBeforeStartDate = date < startDate
            const classes = getClassesForDate(date)

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  min-h-[120px] p-2 rounded-lg
                  ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                  ${isWeekend ? 'opacity-50' : ''}
                  ${isBeforeStartDate ? 'opacity-30' : ''}
                `}
              >
                {/* Date Header */}
                <div className="text-sm font-medium mb-2">
                  {date.getDate()}
                </div>

                {/* Classes */}
                <div className="space-y-1">
                  {classes.map(cls => (
                    <div
                      key={cls.id}
                      className="text-xs p-1 rounded bg-primary/20 text-primary-foreground"
                      onClick={() => onClassClick?.(cls)}
                    >
                      P{cls.period}: {cls.classNumber}
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
