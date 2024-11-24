import { ScheduleEngine } from '../utils/scheduleEngine';
import { Class, ScheduleConstraints } from '../types';

describe('ScheduleEngine', () => {
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');
  const maxPeriodsPerDay = 8;
  const maxPeriodsPerWeek = 30;

  const createTestConstraints = (): ScheduleConstraints => ({
    maxPeriodsPerDay,
    maxPeriodsPerWeek,
    blackoutPeriods: []
  });

  const createTestClass = (id: string, gradeGroup: string = 'A'): Class => ({
    id,
    name: `Test Class ${id}`,
    gradeGroup,
    teacher: `teacher-${Math.floor(parseInt(id) / 4)}`,
    totalConflicts: [],
    partialConflicts: []
  });

  let engine: ScheduleEngine;

  beforeEach(() => {
    engine = new ScheduleEngine(
      createTestConstraints(),
      startDate,
      endDate,
      maxPeriodsPerDay,
      maxPeriodsPerWeek
    );
  });

  describe('Schedule Generation', () => {
    test('should generate valid schedule', () => {
      const classes = Array.from({ length: 5 }, (_, i) => createTestClass(String(i)));
      const schedule = engine.generateSchedule();
      
      expect(schedule.classes.length).toBeGreaterThan(0);
      expect(schedule.classes.every(c => c.date && c.period)).toBe(true);
    });

    test('should respect maximum periods per day', () => {
      const constraints = createTestConstraints();
      constraints.maxPeriodsPerDay = 4;
      engine = new ScheduleEngine(
        constraints,
        startDate,
        endDate,
        constraints.maxPeriodsPerDay,
        constraints.maxPeriodsPerWeek
      );
      
      const schedule = engine.generateSchedule();
      
      // Group classes by date
      const classesByDate = schedule.classes.reduce((acc: Record<string, number>, cls) => {
        const dateStr = cls.date.toISOString().split('T')[0];
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
      }, {});
      
      // Check that no day has more than maxPeriodsPerDay classes
      expect(Object.values(classesByDate).every(count => count <= constraints.maxPeriodsPerDay))
        .toBe(true);
    });

    test('should respect maximum periods per week', () => {
      const constraints = createTestConstraints();
      constraints.maxPeriodsPerWeek = 15;
      engine = new ScheduleEngine(
        constraints,
        startDate,
        endDate,
        constraints.maxPeriodsPerDay,
        constraints.maxPeriodsPerWeek
      );
      
      const schedule = engine.generateSchedule();
      
      // Group classes by week
      const classesByWeek = schedule.classes.reduce((acc: Record<string, number>, cls) => {
        const weekStart = new Date(cls.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString();
        acc[weekKey] = (acc[weekKey] || 0) + 1;
        return acc;
      }, {});
      
      // Check that no week has more than maxPeriodsPerWeek classes
      expect(Object.values(classesByWeek).every(count => count <= constraints.maxPeriodsPerWeek))
        .toBe(true);
    });
  });

  describe('Schedule Optimization', () => {
    test('should improve schedule quality through optimization', () => {
      const schedule = engine.generateSchedule();
      const optimizedSchedule = engine.optimizeSchedule(schedule);
      
      expect(optimizedSchedule.classes.length).toBeGreaterThanOrEqual(schedule.classes.length);
      expect(optimizedSchedule.score.totalLength).toBeGreaterThanOrEqual(schedule.score.totalLength);
    });

    test('should maintain schedule validity after optimization', () => {
      const schedule = engine.generateSchedule();
      const optimizedSchedule = engine.optimizeSchedule(schedule);
      
      // Check that all scheduled classes have valid dates and periods
      expect(optimizedSchedule.classes.every(c => c.date && c.period)).toBe(true);
      
      // Check that constraints are still respected
      expect(optimizedSchedule.score.constraintViolations).toBe(0);
    });
  });
});
