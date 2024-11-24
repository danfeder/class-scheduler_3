import { ScheduleEngine } from '../src/utils/scheduleEngine';
import { SimulatedAnnealing } from '../src/utils/simulatedAnnealing';
import { Class, Schedule, ScheduleScore } from '../src/types';

describe('Conflict Handling Tests', () => {
  // Test utilities
  const createTestClass = (id: string, totalConflicts = [], partialConflicts = []): Class => ({
    id,
    name: `Test Class ${id}`,
    totalConflicts,
    partialConflicts,
    gradeGroup: 'test-group',
    teacher: 'test-teacher'
  });

  const createDate = (dayOffset: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date;
  };

  describe('Schedule Engine Conflict Handling', () => {
    let engine: ScheduleEngine;

    beforeEach(() => {
      engine = new ScheduleEngine({
        maxPeriodsPerDay: 8,
        maxPeriodsPerWeek: 30,
        blackoutPeriods: []
      });
    });

    test('should correctly identify and handle total conflicts', () => {
      const date = createDate();
      const conflictingClass = createTestClass('1', [
        { date, period: 1 }
      ]);

      const result = engine['checkClassConflicts'](date, 1, conflictingClass);
      expect(result.hasConflict).toBe(true);
      expect(result.partialConflictCount).toBe(0);
    });

    test('should count partial conflicts without blocking scheduling', () => {
      const date = createDate();
      const classWithPartialConflicts = createTestClass('1', [], [
        { date, period: 1 },
        { date, period: 1 }
      ]);

      const result = engine['checkClassConflicts'](date, 1, classWithPartialConflicts);
      expect(result.hasConflict).toBe(false);
      expect(result.partialConflictCount).toBe(2);
    });

    test('should apply appropriate penalties for partial conflicts in scoring', () => {
      const date = createDate();
      const classWithConflicts = createTestClass('1', [], [
        { date, period: 1 },
        { date, period: 1 }
      ]);

      const schedule = new Schedule([{
        class: classWithConflicts,
        date,
        period: 1
      }]);

      const score = engine.calculateScore(schedule);
      expect(score.partialConflictPenalty).toBeGreaterThan(0);
      expect(score.partialConflictPenalty).toBeLessThanOrEqual(1);
    });
  });

  describe('Simulated Annealing with Conflict Handling', () => {
    let annealing: SimulatedAnnealing;
    let engine: ScheduleEngine;

    beforeEach(() => {
      engine = new ScheduleEngine({
        maxPeriodsPerDay: 8,
        maxPeriodsPerWeek: 30,
        blackoutPeriods: []
      });
      annealing = new SimulatedAnnealing(engine);
    });

    test('should prefer periods with fewer conflicts during mutation', async () => {
      const date = createDate();
      const classWithConflicts = createTestClass('1', [], [
        { date, period: 1 },
        { date, period: 2 },
        { date, period: 3 }
      ]);

      const initialSchedule = new Schedule([{
        class: classWithConflicts,
        date,
        period: 1
      }]);

      // Run multiple iterations to account for randomness
      let betterPeriodCount = 0;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const mutated = annealing['mutateSchedule'](initialSchedule);
        const period = mutated.classes[0].period;
        if (period > 3) betterPeriodCount++;
      }

      // Should prefer conflict-free periods more than 60% of the time
      expect(betterPeriodCount / iterations).toBeGreaterThan(0.6);
    });

    test('should generate schedules with minimal conflicts', async () => {
      const classes = [
        createTestClass('1', [], [{ date: createDate(), period: 1 }]),
        createTestClass('2', [], [{ date: createDate(), period: 2 }]),
        createTestClass('3', [], [{ date: createDate(), period: 3 }])
      ];

      const result = await annealing.optimize(classes);
      const score = engine.calculateScore(result);

      // Expect relatively low conflict penalty due to conflict avoidance
      expect(score.partialConflictPenalty).toBeLessThan(0.3);
    });

    test('should maintain schedule quality with new scoring weights', async () => {
      const classes = Array.from({ length: 10 }, (_, i) => 
        createTestClass(String(i), [], [
          { date: createDate(), period: i % 4 }
        ])
      );

      const result = await annealing.optimize(classes);
      const score = engine.calculateScore(result);

      // Verify balanced scoring
      expect(score.totalLength).toBeGreaterThan(0.7); // Good completion rate
      expect(score.gradeGroupCohesion).toBeGreaterThan(0.5); // Reasonable cohesion
      expect(score.distributionQuality).toBeGreaterThan(0.5); // Good distribution
      expect(score.partialConflictPenalty).toBeLessThan(0.3); // Low conflicts
    });
  });
});
