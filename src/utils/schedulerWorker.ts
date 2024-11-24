import { SimulatedAnnealingScheduler } from './simulatedAnnealing'
import { Class, Schedule, ScheduleConstraints, SchedulePreferences, BlackoutPeriod } from '../types'

interface WorkerData {
  classes: Class[]
  startDate: Date
  constraints: ScheduleConstraints
  preferences: SchedulePreferences
  blackoutPeriods: BlackoutPeriod[]
  params: {
    initialTemp: number
    coolingRate: number
    minTemp: number
    iterationsPerTemp: number
  }
}

// Web Worker entry point
self.onmessage = (e: MessageEvent<WorkerData>) => {
  const { 
    classes,
    startDate,
    constraints,
    preferences,
    blackoutPeriods,
    params
  } = e.data

  // Create scheduler with worker-specific parameters
  const scheduler = new SimulatedAnnealingScheduler(
    classes,
    new Date(startDate), // Convert date from serialized form
    constraints,
    preferences,
    blackoutPeriods,
    params
  )

  // Generate schedule
  const schedule = scheduler.generateSchedule()

  // Send result back to main thread
  self.postMessage({
    type: 'result',
    schedule,
    workerId: params.initialTemp // Use temp as unique ID
  })
}
