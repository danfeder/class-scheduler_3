import { ScheduleEngine } from '../src/utils/scheduleEngine';
import { SimulatedAnnealing } from '../src/utils/simulatedAnnealing';
import { Class, Schedule } from '../src/types';

describe('Performance Tests', () => {
  const createTestClass = (id: string, totalConflicts = [], partialConflicts = []): Class => ({
    id,
    name: `Test Class ${id}`,
    totalConflicts,
    partialConflicts,
    gradeGroup: `group-${Math.floor(parseInt(id) / 3)}`,
    teacher: `teacher-${Math.floor(parseInt(id) / 4)}`
  });

  const createDate = (dayOffset: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date;
  };

  const generateTestClasses = (count: number, conflictDensity: number = 0.2) => {
    return Array.from({ length: count }, (_, i) => {
      const partialConflicts = [];
      // Add partial conflicts based on density
      const conflictCount = Math.floor(count * conflictDensity);
      for (let j = 0; j < conflictCount; j++) {
        partialConflicts.push({
          date: createDate(Math.floor(j / 8)),
          period: (j % 8) + 1
        });
      }
      return createTestClass(String(i), [], partialConflicts);
    });
  };

  describe('Schedule Optimization Performance', () => {
    let engine: ScheduleEngine;
    let annealing: SimulatedAnnealing;

    beforeEach(() => {
      engine = new ScheduleEngine({
        maxPeriodsPerDay: 8,
        maxPeriodsPerWeek: 30,
        blackoutPeriods: []
      });
      annealing = new SimulatedAnnealing(engine);
    });

    const runPerformanceTest = async (
      classCount: number,
      conflictDensity: number
    ) => {
      const classes = generateTestClasses(classCount, conflictDensity);
      
      const startTime = process.hrtime();
      const result = await annealing.optimize(classes);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;

      const score = engine.calculateScore(result);
      
      return {
        duration,
        score,
        scheduledCount: result.classes.length,
        expectedCount: classes.length
      };
    };

    test('small schedule (20 classes) performance', async () => {
      const result = await runPerformanceTest(20, 0.2);
      
      expect(result.duration).toBeLessThan(5); // Should complete within 5 seconds
      expect(result.score.totalLength).toBeGreaterThan(0.9); // >90% completion
      expect(result.score.partialConflictPenalty).toBeLessThan(0.2);
    });

    test('medium schedule (50 classes) performance', async () => {
      const result = await runPerformanceTest(50, 0.2);
      
      expect(result.duration).toBeLessThan(10); // Should complete within 10 seconds
      expect(result.score.totalLength).toBeGreaterThan(0.85); // >85% completion
      expect(result.score.partialConflictPenalty).toBeLessThan(0.3);
    });

    test('large schedule (100 classes) performance', async () => {
      const result = await runPerformanceTest(100, 0.2);
      
      expect(result.duration).toBeLessThan(20); // Should complete within 20 seconds
      expect(result.score.totalLength).toBeGreaterThan(0.8); // >80% completion
      expect(result.score.partialConflictPenalty).toBeLessThan(0.4);
    });

    test('high conflict density impact', async () => {
      const lowConflict = await runPerformanceTest(50, 0.1);
      const highConflict = await runPerformanceTest(50, 0.4);

      // High conflict density should still maintain reasonable completion
      expect(highConflict.score.totalLength).toBeGreaterThan(0.7);
      // But should have higher penalty than low conflict
      expect(highConflict.score.partialConflictPenalty)
        .toBeGreaterThan(lowConflict.score.partialConflictPenalty);
    });

    test('schedule quality metrics', async () => {
      const result = await runPerformanceTest(50, 0.2);
      const { score } = result;

      // Verify our scoring weights are working as intended
      expect(score.totalLength * 0.45 +
             score.gradeGroupCohesion * 0.25 +
             score.distributionQuality * 0.15 -
             score.partialConflictPenalty * 0.15)
        .toBeGreaterThan(0.7); // Overall score should be good

      // Individual metrics should be balanced
      expect(score.gradeGroupCohesion).toBeGreaterThan(0.5);
      expect(score.distributionQuality).toBeGreaterThan(0.5);
    });
  });
});
