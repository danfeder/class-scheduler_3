// Types for class scheduling system

export type GradeGroup = 'elementary' | 'middle' | 'high'
export type GradeProgression = 'none' | 'low-to-high' | 'high-to-low'

export interface Conflict {
  date: Date
  period: number
}

export interface Class {
  id: string
  name: string
  gradeLevel: string
  gradeGroup: GradeGroup
  teacher: string
  totalConflicts: Conflict[]
  partialConflicts: Conflict[]
}

export interface ScheduledClass extends Class {
  date: Date
  period: number
}

export interface Schedule {
  classes: ScheduledClass[]
  score: {
    totalLength: number
    gradeGroupCohesion: number
    distributionQuality: number
    constraintViolations: number
    gradeProgression: number
    partialConflictPenalty: number
  }
}

export interface ScheduleConstraints {
  maxPeriodsPerDay: number
  maxClassesPerDay: number
  maxConsecutivePeriods: number
  requiredBreakLength: number
}

export interface SchedulePreferences {
  gradeProgression: GradeProgression
  preferredStartTime?: Date
  preferredEndTime?: Date
  preferredDaysOfWeek?: number[]
  teacherPreferences?: {
    [teacherId: string]: {
      preferredPeriods?: number[]
      preferredDays?: number[]
    }
  }
}
