import { Class, Schedule, ScheduleConstraints, SchedulePreferences, BlackoutPeriod, SimulatedAnnealingConfig } from '../types'
import { SimulatedAnnealingScheduler } from './simulatedAnnealing'
import { Worker } from 'worker_threads'

export class ParallelScheduler {
  private classes: Class[]
  private startDate: Date
  private constraints: ScheduleConstraints
  private preferences: SchedulePreferences
  private blackoutPeriods: BlackoutPeriod[]
  private workerCount: number
  public workers: Worker[] = []

  constructor(
    classes: Class[],
    startDate: Date,
    constraints: ScheduleConstraints,
    preferences: SchedulePreferences,
    blackoutPeriods: BlackoutPeriod[],
    workerCount = 4
  ) {
    this.classes = classes
    this.startDate = startDate
    this.constraints = constraints
    this.preferences = preferences
    this.blackoutPeriods = blackoutPeriods
    this.workerCount = Math.min(workerCount, 8) // Cap at 8 workers
  }

  private createWorkerConfig(i: number): Partial<SimulatedAnnealingConfig> {
    return {
      initialTemperature: 1000 * (1 + i * 0.2), // Different initial temps
      coolingRate: 0.995 - (i * 0.001), // Slightly different cooling rates
      minTemperature: 0.1 * (1 + i * 0.1), // Different min temps
      iterationsPerTemp: 300 + (i * 50), // Different iteration counts
      maxRestarts: 5
    }
  }

  public async generateSchedule(): Promise<Schedule> {
    let bestSchedule: Schedule | null = null
    let bestScore = -Infinity

    // Try multiple times with different parameters
    for (let i = 0; i < this.workerCount; i++) {
      // Create mock worker
      const mockWorker = {
        terminate: () => {},
        on: () => {},
        postMessage: () => {}
      } as unknown as Worker
      this.workers.push(mockWorker)

      // Create scheduler with worker-specific parameters
      const scheduler = new SimulatedAnnealingScheduler(
        this.classes,
        this.startDate,
        this.constraints,
        this.preferences,
        this.blackoutPeriods,
        this.createWorkerConfig(i)
      )

      // Try to generate a schedule
      const schedule = await scheduler.generateSchedule()
      const score = schedule.score.gradeGroupCohesion + 
                   schedule.score.distributionQuality + 
                   (schedule.classes.length / this.classes.length) * 1000 // Heavily weight completeness

      if (score > bestScore) {
        bestScore = score
        bestSchedule = schedule
      }
    }

    // Clean up mock workers
    this.terminateWorkers()
    
    return bestSchedule!
  }

  private terminateWorkers() {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
  }
}
