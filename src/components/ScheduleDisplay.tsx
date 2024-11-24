import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Schedule, ScheduledClass, WeekSchedule, BlackoutPeriod } from '../types'
import { scheduleUtils } from '../utils/schedule'
import { ScheduleCell } from './schedule/ScheduleCell'
import { ScheduleHeader } from './schedule/ScheduleHeader'
import { MonthView } from './schedule/MonthView'
import { ExportButton } from './schedule/ExportButton'
import { Button } from './ui/button'

interface ScheduleDisplayProps {
  schedule?: Schedule
  startDate: Date
  blackoutPeriods: BlackoutPeriod[]
  onBlackoutChange: (blackoutPeriods: BlackoutPeriod[]) => void
  onClassClick?: (scheduledClass: ScheduledClass) => void
  onClassMove?: (classId: string, newPeriod: number, newDate: Date) => void
}

const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1)

export function ScheduleDisplay({ 
  schedule,
  startDate,
  blackoutPeriods,
  onBlackoutChange,
  onClassClick,
  onClassMove
}: ScheduleDisplayProps) {
  const [weekSchedules, setWeekSchedules] = useState<WeekSchedule[]>([])
  const [currentWeek, setCurrentWeek] = useState(0)
  const [previewWeeks, setPreviewWeeks] = useState<WeekSchedule[]>([])
  const [view, setView] = useState<'week' | 'month'>('week')

  useEffect(() => {
    if (!schedule) {
      const weeks: WeekSchedule[] = []
      let currentDate = new Date(startDate)
      currentDate.setHours(0, 0, 0, 0)

      // Always start from Monday of the week containing the start date
      const monday = new Date(currentDate)
      const dayOfWeek = monday.getDay()
      if (dayOfWeek !== 1) { // If not Monday
        monday.setDate(monday.getDate() - (dayOfWeek - 1))
      }
      currentDate = monday

      // Generate 6 weeks of schedule
      for (let i = 0; i < 6; i++) {
        weeks.push(
          scheduleUtils.getWeekSchedule(
            currentDate,
            [],
            blackoutPeriods,
            startDate
          )
        )
        // Move to next Monday
        const nextDate = new Date(currentDate)
        nextDate.setDate(nextDate.getDate() + 7)
        currentDate = nextDate
      }

      setPreviewWeeks(weeks)
    }
  }, [startDate, blackoutPeriods, schedule])

  useEffect(() => {
    if (schedule) {
      const weeks: WeekSchedule[] = []
      let currentDate = new Date(schedule.startDate)
      currentDate.setHours(0, 0, 0, 0)

      // Always start from Monday of the week containing the start date
      const monday = new Date(currentDate)
      const dayOfWeek = monday.getDay()
      if (dayOfWeek !== 1) { // If not Monday
        monday.setDate(monday.getDate() - (dayOfWeek - 1))
      }
      currentDate = monday

      // Generate weeks until we reach the end date
      while (currentDate <= schedule.endDate) {
        weeks.push(
          scheduleUtils.getWeekSchedule(
            currentDate,
            schedule.classes,
            blackoutPeriods,
            schedule.startDate
          )
        )
        // Move to next Monday
        const nextDate = new Date(currentDate)
        nextDate.setDate(nextDate.getDate() + 7)
        currentDate = nextDate
      }

      setWeekSchedules(weeks)
    }
  }, [schedule, blackoutPeriods])

  useEffect(() => {
    setCurrentWeek(0)
  }, [startDate, schedule])

  const handlePeriodClick = (period: number, date: Date) => {
    if (!schedule) {
      const dayOfWeek = date.getDay()
      const isCurrentlyBlackout = blackoutPeriods.some(
        bp => bp.dayOfWeek === dayOfWeek && 
             bp.period === period &&
             scheduleUtils.isSameDay(bp.date, date)
      )

      if (isCurrentlyBlackout) {
        onBlackoutChange(
          blackoutPeriods.filter(
            bp => !(
              bp.dayOfWeek === dayOfWeek && 
              bp.period === period &&
              scheduleUtils.isSameDay(bp.date, date)
            )
          )
        )
      } else {
        onBlackoutChange([
          ...blackoutPeriods, 
          { dayOfWeek, period, date: new Date(date) }
        ])
      }
    }
  }

  const handleDayBlackout = (dayOfWeek: number, date: Date) => {
    if (!schedule) {
      const isFullDayBlackout = Array.from({ length: 8 }, (_, i) => i + 1).every(
        period =>
          blackoutPeriods.some(
            bp => bp.dayOfWeek === dayOfWeek && 
                 bp.period === period &&
                 scheduleUtils.isSameDay(bp.date, date)
          )
      )

      if (isFullDayBlackout) {
        onBlackoutChange(
          blackoutPeriods.filter(bp => !(
            bp.dayOfWeek === dayOfWeek &&
            scheduleUtils.isSameDay(bp.date, date)
          ))
        )
      } else {
        const newBlackouts = [...blackoutPeriods]
        Array.from({ length: 8 }, (_, i) => i + 1).forEach(period => {
          if (!blackoutPeriods.some(
            bp => bp.dayOfWeek === dayOfWeek && 
                 bp.period === period &&
                 scheduleUtils.isSameDay(bp.date, date)
          )) {
            newBlackouts.push({ dayOfWeek, period, date: new Date(date) })
          }
        })
        onBlackoutChange(newBlackouts)
      }
    }
  }

  const handlePeriodAllDaysClick = (period: number) => {
    if (!schedule) {
      // Check if all days in the current week have this period blacked out
      const allDaysHavePeriod = displayedWeek.days.every(day => 
        blackoutPeriods.some(bp => 
          bp.dayOfWeek === day.date.getDay() && 
          bp.period === period &&
          scheduleUtils.isSameDay(bp.date, day.date)
        )
      );

      if (allDaysHavePeriod) {
        // Remove this period from all days in the current week
        const newBlackoutPeriods = blackoutPeriods.filter(bp => 
          !(bp.period === period && displayedWeek.days.some(day => 
            scheduleUtils.isSameDay(bp.date, day.date)
          ))
        );
        onBlackoutChange(newBlackoutPeriods);
      } else {
        // Add this period to all days in the current week
        const newBlackoutPeriods = [...blackoutPeriods];
        displayedWeek.days.forEach(day => {
          if (!blackoutPeriods.some(bp => 
            bp.dayOfWeek === day.date.getDay() && 
            bp.period === period &&
            scheduleUtils.isSameDay(bp.date, day.date)
          )) {
            newBlackoutPeriods.push({ 
              dayOfWeek: day.date.getDay(), 
              period,
              date: new Date(day.date)
            });
          }
        });
        onBlackoutChange(newBlackoutPeriods);
      }
    }
  };

  const displayedWeeks = schedule ? weekSchedules : previewWeeks
  if (displayedWeeks.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        Loading schedule preview...
      </div>
    )
  }

  const displayedWeek = displayedWeeks[currentWeek]

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Navigation and Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setView(view === 'week' ? 'month' : 'week')}
            >
              {view === 'week' ? 'Switch to Month' : 'Switch to Week'}
            </Button>
            {schedule && (
              <ExportButton
                schedule={schedule}
                startDate={displayedWeek.startDate}
                endDate={displayedWeek.endDate}
              />
            )}
          </div>
          <ScheduleHeader
            currentWeek={currentWeek}
            totalWeeks={displayedWeeks.length}
            displayedWeek={displayedWeek}
            onWeekChange={setCurrentWeek}
            onViewChange={setView}
            view={view}
          />
        </div>

        {/* Block/Clear Controls */}
        {!schedule && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const allPeriods: BlackoutPeriod[] = []
                for (let day = 1; day <= 5; day++) {
                  for (let period = 1; period <= 8; period++) {
                    allPeriods.push({ dayOfWeek: day, period })
                  }
                }
                onBlackoutChange(allPeriods)
              }}
            >
              Block All Periods
            </Button>
            <Button
              variant="secondary"
              onClick={() => onBlackoutChange([])}
            >
              Clear All Blocks
            </Button>
          </div>
        )}

        {/* Schedule View */}
        {view === 'week' ? (
          <div className="bg-card rounded-lg p-4">
            <div className="grid grid-cols-6 gap-3">
              {/* Period Labels */}
              <div className="w-16">
                <div className="h-8"></div>
                <div className="space-y-2">
                  {PERIODS.map(period => {
                    const allDaysBlackedOut = displayedWeek.days.every(day => 
                      blackoutPeriods.some(bp => 
                        bp.dayOfWeek === day.date.getDay() && 
                        bp.period === period &&
                        scheduleUtils.isSameDay(bp.date, day.date)
                      )
                    );
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => handlePeriodAllDaysClick(period)}
                        className={`p-3 w-full text-sm rounded-md ${
                          allDaysBlackedOut
                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            : 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30'
                        }`}
                      >
                        P{period}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Days */}
              {displayedWeek.days.map((day, dayIndex) => {
                const isBeforeStartDate = day.date < startDate
                return (
                  <div 
                    key={day.date.toISOString()} 
                    className={`${isBeforeStartDate ? 'opacity-50' : ''}`}
                  >
                    {/* Day Header */}
                    <div className="flex flex-col h-8 justify-between">
                      <div className="font-medium text-sm whitespace-nowrap">
                        {day.date.toLocaleDateString(undefined, { weekday: 'long' })}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          {day.date.toLocaleDateString()}
                        </div>
                        {!schedule && !isBeforeStartDate && (
                          <button
                            onClick={() => handleDayBlackout(day.date.getDay(), day.date)}
                            className="text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground hover:bg-muted/60"
                          >
                            All Day
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Periods */}
                    {!isBeforeStartDate ? (
                      <div className="space-y-2">
                        {day.periods.map(period => {
                          const scheduledClass = day.classes.find(c => c.period === period.number)
                          return (
                            <ScheduleCell
                              key={period.number}
                              period={period.number}
                              date={day.date}
                              scheduledClass={scheduledClass}
                              blackoutPeriods={blackoutPeriods}
                              isBeforeStartDate={isBeforeStartDate}
                              onClassClick={onClassClick}
                              onClassDrop={onClassMove}
                              onPeriodClick={handlePeriodClick}
                              constraintSatisfaction={scheduledClass?.constraintSatisfaction}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-3 bg-secondary/20 text-secondary-foreground rounded-md text-sm text-center">
                        Not Available
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <MonthView
            schedule={schedule}
            weekSchedules={displayedWeeks}
            blackoutPeriods={blackoutPeriods}
            startDate={displayedWeek.startDate}
            onClassClick={onClassClick}
            onClassDrop={onClassMove}
            onPeriodClick={handlePeriodClick}
          />
        )}
      </div>
    </DndProvider>
  )
}
