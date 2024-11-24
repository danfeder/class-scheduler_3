import { 
  Class,
  Schedule,
  ScheduledClass,
  ScheduleConstraints,
  SchedulePreferences,
  BlackoutPeriod,
  DaySchedule,
  WeekSchedule
} from '../types'
import { SimulatedAnnealingScheduler } from './simulatedAnnealing'

const PERIODS_PER_DAY = 8
const DAYS_PER_WEEK = 5 // Monday to Friday

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isBlackoutPeriod(period: number, date: Date, blackoutPeriods: BlackoutPeriod[]): boolean {
  return blackoutPeriods.some(
    blackout => 
      blackout.period === period && 
      isSameDay(blackout.date, date)
  )
}

function getWeekNumber(date: Date, startDate: Date): number {
  const diffTime = Math.abs(date.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
}

function getDaySchedule(
  date: Date,
  scheduledClasses: ScheduledClass[],
  blackoutPeriods: BlackoutPeriod[]
): DaySchedule {
  const dayClasses = scheduledClasses.filter(
    cls => isSameDay(cls.date, date)
  )

  const periods = Array.from({ length: PERIODS_PER_DAY }, (_, i) => ({
    number: i + 1,
    time: `Period ${i + 1}`,
    isBlackout: isBlackoutPeriod(i + 1, date, blackoutPeriods)
  }))

  return {
    date,
    periods,
    classes: dayClasses
  }
}

function getWeekSchedule(
  weekStartDate: Date,
  scheduledClasses: ScheduledClass[],
  blackoutPeriods: BlackoutPeriod[],
  startDate: Date
): WeekSchedule {
  const days: DaySchedule[] = []
  
  // Ensure weekStartDate is a Monday
  const monday = new Date(weekStartDate)
  while (monday.getDay() !== 1) { // 1 is Monday
    monday.setDate(monday.getDate() + 1)
  }

  // Set end date to Friday (Monday + 4 days)
  const weekEndDate = new Date(monday)
  weekEndDate.setDate(weekEndDate.getDate() + 4)

  // Generate schedule for Monday through Friday
  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(monday)
    currentDate.setDate(currentDate.getDate() + i)
    
    // Only include days on or after the start date
    if (currentDate >= startDate) {
      days.push(getDaySchedule(currentDate, scheduledClasses, blackoutPeriods))
    }
  }

  return {
    weekNumber: getWeekNumber(monday, startDate),
    startDate: monday,
    endDate: weekEndDate,
    days
  }
}

function countConsecutivePeriods(
  period: number,
  date: Date,
  scheduledClasses: ScheduledClass[]
): number {
  const dayClasses = scheduledClasses.filter(
    cls =>
      isSameDay(cls.date, date)
  )

  let consecutiveCount = 1
  let currentPeriod = period

  // Check periods before
  while (dayClasses.some(cls => cls.period === currentPeriod - 1)) {
    consecutiveCount++
    currentPeriod--
  }

  currentPeriod = period
  // Check periods after
  while (dayClasses.some(cls => cls.period === currentPeriod + 1)) {
    consecutiveCount++
    currentPeriod++
  }

  return consecutiveCount
}

function hasConflict(period: number, dayOfWeek: number, conflicts: { dayOfWeek: number; periods: number[] }[]): boolean {
  const dayConflicts = conflicts.find(d => d.dayOfWeek === dayOfWeek)
  return dayConflicts ? dayConflicts.periods.includes(period) : false
}

async function generateSchedule(
  classes: Class[],
  startDate: Date,
  constraints: ScheduleConstraints,
  preferences: SchedulePreferences,
  blackoutPeriods: BlackoutPeriod[]
): Promise<Schedule> {
  // Create and configure the scheduling engine with simulated annealing
  const engine = new SimulatedAnnealingScheduler(
    classes,
    startDate,
    constraints,
    preferences,
    blackoutPeriods,
    {
      initialTemperature: 3000,
      coolingRate: 0.99,
      minTemperature: 0.1,
      iterationsPerTemp: 400,
      maxRestarts: 10
    }
  )

  // Generate the schedule in a non-blocking way
  return new Promise((resolve, reject) => {
    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
      try {
        console.info('Starting schedule generation with simulated annealing...')
        const schedule = engine.generateSchedule()
        
        // Log scheduling results for analysis
        console.info(`Schedule generation completed:
          - Classes scheduled: ${schedule.classes.length}/${classes.length}
          - Start date: ${schedule.startDate.toISOString()}
          - End date: ${schedule.endDate.toISOString()}
          - Total days: ${Math.ceil((schedule.endDate.getTime() - schedule.startDate.getTime()) / (1000 * 60 * 60 * 24))}
          - Score: ${JSON.stringify(schedule.score)}
        `)

        resolve(schedule)
      } catch (error) {
        console.error('Schedule generation failed:', error)
        reject(error)
      }
    }, 0)
  })
}

export const scheduleUtils = {
  isSameDay,
  getWeekSchedule,
  generateSchedule,
  isBlackoutPeriod,
  getDaySchedule,
  getWeekNumber,
  countConsecutivePeriods,
}