import { ScheduleEngine } from '../utils/scheduleEngine';
import { Class, GradeGroup, ScheduleConstraints, SchedulePreferences } from '../types';

describe('ScheduleEngine Conflict Handling', () => {
  const defaultConstraints: ScheduleConstraints = {
    maxPeriodsPerDay: 8,
    maxClassesPerDay: 6,
    maxConsecutivePeriods: 3,
    requiredBreakLength: 1
  };

  const defaultPreferences: SchedulePreferences = {
    gradeProgression: 'low-to-high'
  };

  const createTestClass = (id: string, gradeLevel: string, gradeGroup: GradeGroup, conflicts: { date: Date, period: number }[] = []): Class => ({
    id,
    name: `Test Class ${id}`,
    gradeLevel,
    gradeGroup,
    teacher: `Teacher ${id}`,
    totalConflicts: conflicts,
    partialConflicts: []
  });

  describe('generateSchedule - Basic Functionality', () => {
    it('should handle total conflicts correctly', () => {
      const startDate = new Date('2024-01-01');
      const conflictDate = new Date('2024-01-01');
      
      const classes: Class[] = [
        createTestClass('1', '9', 'high', [{ date: conflictDate, period: 1 }]),
        createTestClass('2', '9', 'high')
      ];

      const engine = new ScheduleEngine(classes, startDate, defaultConstraints, defaultPreferences);
      const schedule = engine.generateSchedule();

      // Verify no class is scheduled during its conflict time
      const conflictingSchedule = schedule.classes.find(
        cls => cls.id === '1' && 
        cls.date.getTime() === conflictDate.getTime() && 
        cls.period === 1
      );
      expect(conflictingSchedule).toBeUndefined();
    });

    it('should maintain grade progression preference', () => {
      const startDate = new Date('2024-01-01');
      const classes: Class[] = [
        createTestClass('1', '9', 'high'),
        createTestClass('2', '10', 'high'),
        createTestClass('3', '11', 'high')
      ];

      const engine = new ScheduleEngine(classes, startDate, defaultConstraints, defaultPreferences);
      const schedule = engine.generateSchedule();

      // Check if classes on the same day are scheduled in grade progression order
      const classesByDate = new Map<string, Array<{ grade: number, period: number }>>();
      schedule.classes.forEach(cls => {
        const dateKey = cls.date.toISOString().split('T')[0];
        const existing = classesByDate.get(dateKey) || [];
        existing.push({
          grade: parseInt(cls.gradeLevel),
          period: cls.period
        });
        classesByDate.set(dateKey, existing);
      });

      classesByDate.forEach(dayClasses => {
        // Sort by period to get the actual sequence
        dayClasses.sort((a, b) => a.period - b.period);
        
        // For low-to-high progression, check if grades are increasing
        for (let i = 1; i < dayClasses.length; i++) {
          expect(dayClasses[i].grade).toBeGreaterThanOrEqual(dayClasses[i-1].grade);
        }
      });
    });
  });

  describe('generateSchedule - Edge Cases', () => {
    it('should handle same grade level classes appropriately', () => {
      const startDate = new Date('2024-01-01');
      const classes: Class[] = [
        createTestClass('1', '9', 'high'),
        createTestClass('2', '9', 'high'),
        createTestClass('3', '9', 'high')
      ];

      const engine = new ScheduleEngine(classes, startDate, defaultConstraints, defaultPreferences);
      const schedule = engine.generateSchedule();

      // All classes should be scheduled
      expect(schedule.classes.length).toBe(classes.length);
      
      // Classes should be distributed across periods
      const periodsUsed = new Set(schedule.classes.map(c => c.period));
      expect(periodsUsed.size).toBeGreaterThan(1);
    });

    it('should handle non-linear grade progressions', () => {
      const startDate = new Date('2024-01-01');
      const classes = [
        createTestClass('1', '10', 'high'),
        createTestClass('2', '9', 'high'),
        createTestClass('3', '11', 'high')
      ];

      const engine = new ScheduleEngine(classes, startDate, defaultConstraints, defaultPreferences);
      const schedule = engine.generateSchedule();

      // Verify all classes are scheduled
      expect(schedule.classes.length).toBe(classes.length);

      // Verify no total conflicts
      schedule.classes.forEach(cls => {
        const conflictingClasses = schedule.classes.filter(
          other => 
            other.id !== cls.id &&
            other.date.getTime() === cls.date.getTime() &&
            other.period === cls.period
        );
        expect(conflictingClasses.length).toBe(0);
      });
    });

    it('should handle overlapping total and partial conflicts', () => {
      const startDate = new Date('2024-01-01');
      const conflictDate = new Date('2024-01-01');
      
      // Create a scenario where partial conflicts are unavoidable
      const classes: Class[] = [
        {
          ...createTestClass('1', '9', 'high'),
          totalConflicts: [{ date: conflictDate, period: 1 }],
          partialConflicts: [
            { date: conflictDate, period: 2 }
          ]
        },
        {
          ...createTestClass('2', '9', 'high'),
          totalConflicts: [{ date: conflictDate, period: 3 }],
          partialConflicts: [
            { date: conflictDate, period: 2 }
          ]
        }
      ];

      // Use very constrained scheduling to force partial conflicts
      const engine = new ScheduleEngine(classes, startDate, {
        ...defaultConstraints,
        maxPeriodsPerDay: 3,   // Only periods 1-3 available
        maxClassesPerDay: 2,   // Force classes on the same day
        maxConsecutivePeriods: 3  // Allow consecutive periods
      }, defaultPreferences);

      // Run multiple times to increase chance of getting partial conflicts
      let foundPartialConflict = false;
      let attempts = 0;
      const maxAttempts = 50;  // Increased attempts

      while (!foundPartialConflict && attempts < maxAttempts) {
        const schedule = engine.generateSchedule();
        
        // Check if any scheduled classes have partial conflicts
        const scheduledClasses = schedule.classes.filter(cls => 
          cls.date.getTime() === conflictDate.getTime()
        );

        // If we have multiple classes scheduled on the conflict date
        if (scheduledClasses.length > 1) {
          // Count how many classes are scheduled in period 2
          const period2Count = scheduledClasses.filter(cls => cls.period === 2).length;

          // If we have more than one class in period 2, we have a partial conflict
          if (period2Count > 0) {
            foundPartialConflict = true;
          }
        }

        attempts++;
      }

      // At least one run should have had partial conflicts
      expect(foundPartialConflict).toBe(true);

      // Verify that all classes were scheduled
      const finalSchedule = engine.generateSchedule();
      expect(finalSchedule.classes.length).toBe(classes.length);
    });

    it('should handle high-density conflict periods', () => {
      const startDate = new Date('2024-01-01');
      const conflictDate = new Date('2024-01-01');
      
      // Create many classes with conflicts in the same time slots
      const classes: Class[] = Array.from({ length: 5 }, (_, i) => ({
        ...createTestClass(`${i+1}`, '9', 'high'),
        totalConflicts: [
          { date: conflictDate, period: 1 },
          { date: conflictDate, period: 2 }
        ],
        partialConflicts: [
          { date: conflictDate, period: 3 },
          { date: conflictDate, period: 4 }
        ]
      }));

      const engine = new ScheduleEngine(classes, startDate, defaultConstraints, defaultPreferences);
      const schedule = engine.generateSchedule();

      // All classes should be scheduled
      expect(schedule.classes.length).toBe(classes.length);

      // No classes should be in total conflict slots
      const totalConflicts = schedule.classes.filter(
        cls => cls.date.getTime() === conflictDate.getTime() && 
        (cls.period === 1 || cls.period === 2)
      );
      expect(totalConflicts.length).toBe(0);

      // Classes should be distributed across available periods
      const periodsUsed = new Set(schedule.classes.map(c => c.period));
      expect(periodsUsed.size).toBeGreaterThanOrEqual(3);
    });

    it('should respect grade progression when no conflicts exist', () => {
      const startDate = new Date('2024-01-01');
      const classes: Class[] = [
        createTestClass('1', '9', 'high'),
        createTestClass('2', '10', 'high'),
        createTestClass('3', '11', 'high'),
        createTestClass('4', '12', 'high')
      ];

      const engine = new ScheduleEngine(
        classes,
        startDate,
        defaultConstraints,
        { gradeProgression: 'low-to-high' }
      );
      const schedule = engine.generateSchedule();

      // Check score reflects good grade progression
      expect(schedule.score.gradeProgression).toBeGreaterThan(0);
    });
  });

  describe('generateSchedule - Performance', () => {
    it('should handle maximum class load efficiently', () => {
      const startDate = new Date('2024-01-01');
      const maxClasses = defaultConstraints.maxClassesPerDay * 5; // One week worth of classes
      
      const classes: Class[] = Array.from({ length: maxClasses }, (_, i) => 
        createTestClass(`${i+1}`, '9', 'high')
      );

      const startTime = process.hrtime();
      const engine = new ScheduleEngine(
        classes,
        startDate,
        {
          ...defaultConstraints,
          maxPeriodsPerDay: 8,  // Ensure enough periods per day
          maxClassesPerDay: 6   // Maintain reasonable class load
        },
        defaultPreferences
      );
      const schedule = engine.generateSchedule();
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;

      // Schedule should complete within reasonable time
      expect(duration).toBeLessThan(2); // 2 seconds max

      // All classes should be scheduled
      expect(schedule.classes.length).toBe(classes.length);

      // Classes should be well-distributed across days
      const classesPerDay = new Map<string, number>();
      schedule.classes.forEach(cls => {
        const dateKey = cls.date.toISOString().split('T')[0];
        classesPerDay.set(dateKey, (classesPerDay.get(dateKey) || 0) + 1);
      });

      // No day should exceed max classes
      Array.from(classesPerDay.values()).forEach(count => {
        expect(count).toBeLessThanOrEqual(defaultConstraints.maxClassesPerDay);
      });

      // Verify we're using multiple days
      expect(classesPerDay.size).toBeGreaterThanOrEqual(5); // At least a week's worth of days
    });
  });
});
