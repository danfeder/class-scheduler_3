import { ParallelScheduler } from '../utils/parallelScheduler'
import { Class, ScheduleConstraints, SchedulePreferences, BlackoutPeriod } from '../types'
import { ClassBuilder } from './utils/builders'

describe('ParallelScheduler', () => {
  const startDate = new Date('2024-01-01')
  const constraints: ScheduleConstraints = {
    maxPeriodsPerDay: 4,
    maxPeriodsPerWeek: 16,
    consecutivePeriods: { maximum: 2, requireBreak: 1 }
  }
  const preferences: SchedulePreferences = {
    gradeProgression: 'none',
    gradeGroups: [
      { id: '1', name: '9th Grade', grades: ['9'] },
      { id: '2', name: '10th Grade', grades: ['10'] },
      { id: '3', name: '11th Grade', grades: ['11'] },
      { id: '4', name: '12th Grade', grades: ['12'] }
    ],
    preferSameGradeInDay: true
  }
  const blackoutPeriods: BlackoutPeriod[] = []

  // Helper to generate classes
  const generateClasses = (count: number, gradeDistribution: string[]): Class[] => {
    return Array(count).fill(null).map((_, i) => 
      new ClassBuilder()
        .withGradeLevel(gradeDistribution[i % gradeDistribution.length])
        .build()
    )
  }

  it('should generate valid schedule with parallel processing', async () => {
    const classes = generateClasses(10, ['9', '10'])
    const scheduler = new ParallelScheduler(
      classes,
      startDate,
      constraints,
      preferences,
      blackoutPeriods,
      2 // Use 2 workers for testing
    )

    const schedule = await scheduler.generateSchedule()

    expect(schedule.classes.length).toBe(classes.length)
    expect(schedule.startDate).toEqual(startDate)
    expect(schedule.constraints).toEqual(constraints)
  }, 10000) // Increase timeout for parallel processing

  it('should handle large number of classes efficiently', async () => {
    const classes = generateClasses(50, ['9', '10', '11', '12'])
    const scheduler = new ParallelScheduler(
      classes,
      startDate,
      constraints,
      preferences,
      blackoutPeriods,
      4 // Use 4 workers
    )

    const startTime = Date.now()
    const schedule = await scheduler.generateSchedule()
    const duration = Date.now() - startTime

    expect(schedule.classes.length).toBe(classes.length)
    // Should complete within reasonable time (adjust based on actual performance)
    expect(duration).toBeLessThan(30000)
  }, 30000)

  it('should maintain schedule quality with parallel processing', async () => {
    const classes = generateClasses(20, ['9', '10'])
    
    // Create schedules with different worker counts
    const singleWorkerScheduler = new ParallelScheduler(
      classes,
      startDate,
      constraints,
      preferences,
      blackoutPeriods,
      1
    )

    const multiWorkerScheduler = new ParallelScheduler(
      classes,
      startDate,
      constraints,
      preferences,
      blackoutPeriods,
      4
    )

    const [singleWorkerSchedule, multiWorkerSchedule] = await Promise.all([
      singleWorkerScheduler.generateSchedule(),
      multiWorkerScheduler.generateSchedule()
    ])

    // Multi-worker solution should be at least as good as single-worker
    expect(multiWorkerSchedule.score.gradeGroupCohesion)
      .toBeGreaterThanOrEqual(singleWorkerSchedule.score.gradeGroupCohesion * 0.9)
  }, 20000)

  it('should handle conflicts in parallel', async () => {
    const baseClass = new ClassBuilder().withGradeLevel('9').build()
    const classes: Class[] = [
      { ...baseClass, id: '1', totalConflicts: [
        { classId: '2', dayOfWeek: 1, period: 1 },
        { classId: '3', dayOfWeek: 2, period: 1 }
      ]},
      { ...baseClass, id: '2', totalConflicts: [{ classId: '1', dayOfWeek: 1, period: 1 }]},
      { ...baseClass, id: '3', totalConflicts: [{ classId: '1', dayOfWeek: 2, period: 1 }]}
    ]

    const scheduler = new ParallelScheduler(
      classes,
      startDate,
      constraints,
      preferences,
      blackoutPeriods,
      2
    )

    const schedule = await scheduler.generateSchedule()

    // Verify no conflicts in final schedule
    const class1 = schedule.classes.find(c => c.id === '1')!
    const class2 = schedule.classes.find(c => c.id === '2')!
    const class3 = schedule.classes.find(c => c.id === '3')!

    expect(
      class1.date.getDay() === class2.date.getDay() && 
      class1.period === class2.period
    ).toBeFalsy()

    expect(
      class1.date.getDay() === class3.date.getDay() && 
      class1.period === class3.period
    ).toBeFalsy()
  })

  it('should handle worker failures gracefully', async () => {
    const classes = generateClasses(15, ['9', '10', '11'])
    const scheduler = new ParallelScheduler(
      classes,
      startDate,
      constraints,
      preferences,
      blackoutPeriods,
      3
    )

    // Mock a worker failure by terminating one worker early
    setTimeout(() => {
      if (scheduler['workers'].length > 0) {
        scheduler['workers'][0].terminate()
      }
    }, 1000)

    const schedule = await scheduler.generateSchedule()

    // Should still produce valid schedule despite worker failure
    expect(schedule.classes.length).toBe(classes.length)
    expect(schedule.score).toBeDefined()
  }, 15000)

  it('should improve solution quality with more workers', async () => {
    const classes = generateClasses(30, ['9', '10', '11'])
    
    // Test with increasing worker counts
    const workerCounts = [1, 2, 4]
    const schedules = await Promise.all(
      workerCounts.map(count => 
        new ParallelScheduler(
          classes,
          startDate,
          constraints,
          preferences,
          blackoutPeriods,
          count
        ).generateSchedule()
      )
    )

    // Compare scores (should generally improve with more workers)
    const scores = schedules.map(s => 
      s.score.gradeGroupCohesion + 
      s.score.distributionQuality
    )

    // At least one multi-worker solution should be better than single worker
    expect(Math.max(scores[1], scores[2])).toBeGreaterThan(scores[0])
  }, 30000)
})
