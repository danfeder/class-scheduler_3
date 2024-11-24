import { SimulatedAnnealing } from '../utils/simulatedAnnealing';
import { ScheduleEngine } from '../utils/scheduleEngine';
import { Class, Schedule, ScheduleConstraints } from '../types';

describe('SimulatedAnnealing', () => {
  const createTestConstraints = (): ScheduleConstraints => ({
    maxPeriodsPerDay: 8,
    maxPeriodsPerWeek: 30,
    blackoutPeriods: []
  });

  const createTestClass = (id: string): Class => ({
    id,
    name: `Test Class ${id}`,
    gradeGroup: `group-${Math.floor(parseInt(id) / 3)}`,
    teacher: `teacher-${Math.floor(parseInt(id) / 4)}`,
    totalConflicts: [],
    partialConflicts: []
  });

  describe('Optimization Process', () => {
    let engine: ScheduleEngine;
    let annealing: SimulatedAnnealing;

    beforeEach(() => {
      engine = new ScheduleEngine(createTestConstraints());
      annealing = new SimulatedAnnealing(engine, {
        initialTemperature: 1000,
        coolingRate: 0.95,
        maxIterations: 1000,
        minTemperature: 0.01
      });
    });

    test('should generate valid initial solution', async () => {
      const classes = Array.from({ length: 5 }, (_, i) => createTestClass(String(i)));
      const result = await annealing.optimize(classes);
      expect(result.classes.length).toBeGreaterThan(0);
    });

    test('should improve schedule quality over iterations', async () => {
      const classes = Array.from({ length: 10 }, (_, i) => createTestClass(String(i)));
      const result = await annealing.optimize(classes);
      const score = engine.calculateScore(result);

      expect(score.totalLength).toBeGreaterThan(0.7);
      expect(score.partialConflictPenalty).toBeLessThan(0.3);
    });

    test('should handle partial conflicts appropriately', async () => {
      const date = new Date();
      const classes = [
        {
          ...createTestClass('1'),
          partialConflicts: [{ date, period: 1 }]
        },
        {
          ...createTestClass('2'),
          partialConflicts: [{ date, period: 1 }]
        }
      ];

      const result = await annealing.optimize(classes);
      const score = engine.calculateScore(result);

      expect(score.partialConflictPenalty).toBeLessThan(0.5);
    });

    test('should respect total conflicts', async () => {
      const date = new Date();
      const classes = [
        {
          ...createTestClass('1'),
          totalConflicts: [{ date, period: 1 }]
        },
        createTestClass('2')
      ];

      const result = await annealing.optimize(classes);
      
      // Verify no class is scheduled during total conflict
      const hasConflictingSchedule = result.classes.some(
        cls => cls.date.getTime() === date.getTime() && cls.period === 1
      );
      expect(hasConflictingSchedule).toBe(false);
    });
  });

  describe('Performance Characteristics', () => {
    test('should complete optimization within reasonable time', async () => {
      const engine = new ScheduleEngine(createTestConstraints());
      const annealing = new SimulatedAnnealing(engine, {
        initialTemperature: 1000,
        coolingRate: 0.95,
        maxIterations: 1000,
        minTemperature: 0.01
      });

      const classes = Array.from({ length: 20 }, (_, i) => createTestClass(String(i)));
      
      const startTime = process.hrtime();
      const result = await annealing.optimize(classes);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;

      expect(duration).toBeLessThan(10); // Should complete within 10 seconds
      expect(result.classes.length).toBeGreaterThan(0);
    });

    test('should maintain quality with larger schedules', async () => {
      const engine = new ScheduleEngine(createTestConstraints());
      const annealing = new SimulatedAnnealing(engine, {
        initialTemperature: 1000,
        coolingRate: 0.95,
        maxIterations: 2000,
        minTemperature: 0.01
      });

      const classes = Array.from({ length: 50 }, (_, i) => createTestClass(String(i)));
      
      const result = await annealing.optimize(classes);
      const score = engine.calculateScore(result);

      expect(score.totalLength).toBeGreaterThan(0.7);
      expect(score.partialConflictPenalty).toBeLessThan(0.4);
    });
  });
});
