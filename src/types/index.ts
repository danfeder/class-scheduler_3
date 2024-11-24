export interface Class {
  id: string
  classNumber: string
  teacher: string
  gradeLevel: string
  totalConflicts: DayConflicts[]
  partialConflicts: DayConflicts[]
}

export interface DayConflicts {
  dayOfWeek: number // 1-5 for Monday-Friday
  periods: number[]
}

export interface ScheduledClass extends Class {
  date: Date
  period: number
}

export interface Schedule {
  classes: ScheduledClass[]
  startDate: Date
  endDate: Date
  constraints: ScheduleConstraints
}

export interface ScheduleConstraints {
  maxPeriodsPerDay: number
  maxPeriodsPerWeek: number
  consecutivePeriods: {
    maximum: 1 | 2
    requireBreak: 1 | 2
  }
}

export interface BlackoutPeriod {
  dayOfWeek: number // 0-6, where 0 is Sunday
  period: number // 1-8
}

export interface SchedulePreferences {
  preferredGradeOrder: string[]
  gradeGroups: GradeGroup[]
  preferSameGradeInDay: boolean
}

export interface GradeGroup {
  id: string
  name: string
  classes: string[] // Class numbers
}

export type Period = {
  number: number
  time: string
  isBlackout: boolean
}

export type DaySchedule = {
  date: Date
  periods: Period[]
  classes: ScheduledClass[]
}

export type WeekSchedule = {
  weekNumber: number
  startDate: Date
  endDate: Date
  days: DaySchedule[]
}