import { Class, Schedule, SchedulePreferences } from '../types'

const STORAGE_KEYS = {
  CLASSES: 'cooking-scheduler-classes',
  SCHEDULE: 'cooking-scheduler-schedule',
  PREFERENCES: 'cooking-scheduler-preferences'
}

export const storage = {
  initializeSampleData(): void {
    const sampleClasses = [
      {
        id: '1',
        name: 'Basic Cooking',
        teacher: 'Chef John',
        gradeLevel: '3rd',
        classNumber: 1,
        maxStudents: 15
      },
      {
        id: '2',
        name: 'Advanced Cooking',
        teacher: 'Chef Maria',
        gradeLevel: '5th',
        classNumber: 2,
        maxStudents: 12
      },
      {
        id: '3',
        name: 'Baking Fundamentals',
        teacher: 'Chef Sarah',
        gradeLevel: '4th',
        classNumber: 3,
        maxStudents: 15
      },
      {
        id: '4',
        name: 'Kitchen Safety',
        teacher: 'Chef Mike',
        gradeLevel: '2nd',
        classNumber: 4,
        maxStudents: 10
      },
      {
        id: '5',
        name: 'Mixed Grade Cooking',
        teacher: 'Chef Lisa',
        gradeLevel: 'mixed',
        classNumber: 5,
        maxStudents: 15,
        allowedGrades: ['3rd', '4th', '5th']
      }
    ];

    this.saveClasses(sampleClasses);
  },

  getClasses(): Class[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLASSES)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading classes:', error)
      return []
    }
  },

  saveClasses(classes: Class[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes))
    } catch (error) {
      console.error('Error saving classes:', error)
    }
  },

  getSchedule(): Schedule | undefined {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULE)
      if (!stored) return undefined

      const schedule = JSON.parse(stored)
      // Convert date strings back to Date objects
      schedule.startDate = new Date(schedule.startDate)
      schedule.endDate = new Date(schedule.endDate)
      schedule.classes.forEach((cls: any) => {
        cls.date = new Date(cls.date)
      })
      schedule.constraints.blackoutDates = schedule.constraints.blackoutDates.map(
        (date: string) => new Date(date)
      )
      return schedule
    } catch (error) {
      console.error('Error loading schedule:', error)
      return undefined
    }
  },

  saveSchedule(schedule: Schedule | undefined): void {
    try {
      if (schedule === undefined) {
        localStorage.removeItem(STORAGE_KEYS.SCHEDULE)
      } else {
        localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule))
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
    }
  },

  getPreferences(): SchedulePreferences | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error loading preferences:', error)
      return null
    }
  },

  savePreferences(preferences: SchedulePreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CLASSES)
      localStorage.removeItem(STORAGE_KEYS.SCHEDULE)
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES)
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }
}