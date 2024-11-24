import { ScheduleEngine } from '../utils/scheduleEngine';
import { Class, Schedule, ScheduleConstraints, SchedulePreferences, GradeGroup } from '../types';

const defaultConstraints: ScheduleConstraints = {
  maxPeriodsPerDay: 8,
  maxClassesPerDay: 6,
  maxConsecutivePeriods: 4,
  requiredBreakLength: 1
};

const defaultPreferences: SchedulePreferences = {
  gradeProgression: 'none'
};

function createTestClass(id: string, gradeLevel: string, gradeGroup: GradeGroup): Class {
  return {
    id,
    name: `Class ${id}`,
    gradeLevel,
    gradeGroup,
    teacher: `Teacher ${id}`,
    totalConflicts: [],
    partialConflicts: []
  };
}

function generateLargeClassSet(size: number): Class[] {
  const classes: Class[] = [];
  const gradeLevels = ['9', '10', '11', '12'];
  const gradeGroups: GradeGroup[] = ['elementary', 'middle', 'high'];

  for (let i = 0; i < size; i++) {
    const gradeLevel = gradeLevels[Math.floor(Math.random() * gradeLevels.length)];
    const gradeGroup = gradeGroups[Math.floor(Math.random() * gradeGroups.length)];
    classes.push(createTestClass(i.toString(), gradeLevel, gradeGroup));
  }

  // Add some conflicts
  classes.forEach(cls => {
    // 20% chance of having a total conflict
    if (Math.random() < 0.2) {
      cls.totalConflicts.push({
        date: new Date('2024-01-01'),
        period: Math.floor(Math.random() * 8) + 1
      });
    }

    // 30% chance of having a partial conflict
    if (Math.random() < 0.3) {
      cls.partialConflicts.push({
        date: new Date('2024-01-01'),
        period: Math.floor(Math.random() * 8) + 1
      });
    }
  });

  return classes;
}

function analyzeSchedule(schedule: Schedule) {
  const classesByDate = new Map<string, any[]>();
  const classesByGradeGroup = new Map<string, any[]>();
  const periodsUsedPerDay = new Map<string, Set<number>>();

  schedule.classes.forEach(cls => {
    // Group by date
    const dateKey = cls.date.toISOString().split('T')[0];
    if (!classesByDate.has(dateKey)) {
      classesByDate.set(dateKey, []);
    }
    classesByDate.get(dateKey)?.push(cls);

    // Group by grade group
    if (!classesByGradeGroup.has(cls.gradeGroup)) {
      classesByGradeGroup.set(cls.gradeGroup, []);
    }
    classesByGradeGroup.get(cls.gradeGroup)?.push(cls);

    // Track periods used per day
    if (!periodsUsedPerDay.has(dateKey)) {
      periodsUsedPerDay.set(dateKey, new Set());
    }
    periodsUsedPerDay.get(dateKey)?.add(cls.period);
  });

  return {
    totalClasses: schedule.classes.length,
    daysUsed: classesByDate.size,
    averageClassesPerDay: schedule.classes.length / classesByDate.size,
    gradeGroupDistribution: Object.fromEntries(
      Array.from(classesByGradeGroup.entries()).map(([group, classes]) => [
        group,
        classes.length
      ])
    ),
    averagePeriodsPerDay: Array.from(periodsUsedPerDay.values()).reduce(
      (acc, periods) => acc + periods.size,
      0
    ) / periodsUsedPerDay.size,
    score: schedule.score
  };
}

describe('Schedule Quality Analysis', () => {
  const startDate = new Date('2024-01-01');

  describe('Small Schedule (20 classes)', () => {
    it('should generate high-quality schedules', () => {
      const classes = generateLargeClassSet(20);
      const engine = new ScheduleEngine(classes, startDate, defaultConstraints, defaultPreferences);
      
      const schedules: any[] = [];
      const iterations = 10;

      console.time('Small Schedule Generation');
      for (let i = 0; i < iterations; i++) {
        const schedule = engine.generateSchedule();
        schedules.push(analyzeSchedule(schedule));
      }
      console.timeEnd('Small Schedule Generation');

      const averageScore = schedules.reduce((acc, s) => acc + s.score.totalLength, 0) / iterations;
      const averageClassesPerDay = schedules.reduce((acc, s) => acc + s.averageClassesPerDay, 0) / iterations;
      const averagePeriodsPerDay = schedules.reduce((acc, s) => acc + s.averagePeriodsPerDay, 0) / iterations;

      console.log('Small Schedule Metrics:', {
        averageScore,
        averageClassesPerDay,
        averagePeriodsPerDay,
        schedules: schedules[0] // Example of first schedule
      });

      expect(averageScore).toBeGreaterThan(0.9);
      expect(averageClassesPerDay).toBeLessThanOrEqual(defaultConstraints.maxClassesPerDay);
      expect(averagePeriodsPerDay).toBeLessThanOrEqual(defaultConstraints.maxPeriodsPerDay);
    });
  });

  describe('Medium Schedule (50 classes)', () => {
    it('should generate high-quality schedules', () => {
      const classes = generateLargeClassSet(50);
      const engine = new ScheduleEngine(classes, startDate, defaultConstraints, defaultPreferences);
      
      const schedules: any[] = [];
      const iterations = 5;

      console.time('Medium Schedule Generation');
      for (let i = 0; i < iterations; i++) {
        const schedule = engine.generateSchedule();
        schedules.push(analyzeSchedule(schedule));
      }
      console.timeEnd('Medium Schedule Generation');

      const averageScore = schedules.reduce((acc, s) => acc + s.score.totalLength, 0) / iterations;
      const averageClassesPerDay = schedules.reduce((acc, s) => acc + s.averageClassesPerDay, 0) / iterations;
      const averagePeriodsPerDay = schedules.reduce((acc, s) => acc + s.averagePeriodsPerDay, 0) / iterations;

      console.log('Medium Schedule Metrics:', {
        averageScore,
        averageClassesPerDay,
        averagePeriodsPerDay,
        schedules: schedules[0] // Example of first schedule
      });

      expect(averageScore).toBeGreaterThan(0.85);
      expect(averageClassesPerDay).toBeLessThanOrEqual(defaultConstraints.maxClassesPerDay);
      expect(averagePeriodsPerDay).toBeLessThanOrEqual(defaultConstraints.maxPeriodsPerDay);
    });
  });

  describe('Large Schedule (100 classes)', () => {
    it('should generate high-quality schedules', () => {
      const classes = generateLargeClassSet(100);
      const engine = new ScheduleEngine(classes, startDate, defaultConstraints, defaultPreferences);
      
      const schedules: any[] = [];
      const iterations = 3;

      console.time('Large Schedule Generation');
      for (let i = 0; i < iterations; i++) {
        const schedule = engine.generateSchedule();
        schedules.push(analyzeSchedule(schedule));
      }
      console.timeEnd('Large Schedule Generation');

      const averageScore = schedules.reduce((acc, s) => acc + s.score.totalLength, 0) / iterations;
      const averageClassesPerDay = schedules.reduce((acc, s) => acc + s.averageClassesPerDay, 0) / iterations;
      const averagePeriodsPerDay = schedules.reduce((acc, s) => acc + s.averagePeriodsPerDay, 0) / iterations;

      console.log('Large Schedule Metrics:', {
        averageScore,
        averageClassesPerDay,
        averagePeriodsPerDay,
        schedules: schedules[0] // Example of first schedule
      });

      expect(averageScore).toBeGreaterThan(0.8);
      expect(averageClassesPerDay).toBeLessThanOrEqual(defaultConstraints.maxClassesPerDay);
      expect(averagePeriodsPerDay).toBeLessThanOrEqual(defaultConstraints.maxPeriodsPerDay);
    });
  });
});
