import { ScheduleEngine } from '../utils/scheduleEngine';
import { GradeGroup, ScheduleConstraints } from '../types';
import { ClassBuilder, GradeGroupBuilder, PreferencesBuilder } from './utils/builders';

describe('Schedule Scoring System', () => {
  // Common test data
  const startDate = new Date('2024-01-01');
  const defaultConstraints: ScheduleConstraints = {
    maxPeriodsPerDay: 8,
    maxPeriodsPerWeek: 40,
    consecutivePeriods: {
      maximum: 2,
      requireBreak: 1
    }
  };

  let gradeGroups: GradeGroup[];
  let defaultPreferences: any;
  
  beforeEach(() => {
    // Create two grade groups: Lower (1-3) and Upper (4-6)
    gradeGroups = [
      new GradeGroupBuilder()
        .withId('lower')
        .withName('Lower Grades')
        .withGrades(['1', '2', '3'])
        .build(),
      new GradeGroupBuilder()
        .withId('upper')
        .withName('Upper Grades')
        .withGrades(['4', '5', '6'])
        .build()
    ];

    defaultPreferences = new PreferencesBuilder()
      .withGradeGroups(gradeGroups)
      .withPreferSameGradeInDay(true)
      .withGradeProgression('none')
      .build();
  });

  describe('Grade Group Cohesion', () => {
    it('should score perfect cohesion when grade groups are scheduled on different days', () => {
      // Create classes for lower grades on Monday
      const lowerClasses = [
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('2')
          .withClassNumber(2)
          .withDate(startDate)
          .withPeriod(2)
          .build()
      ];

      // Create classes for upper grades on Tuesday
      const nextDay = new Date(startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const upperClasses = [
        new ClassBuilder()
          .withGradeLevel('4')
          .withClassNumber(3)
          .withDate(nextDay)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('5')
          .withClassNumber(4)
          .withDate(nextDay)
          .withPeriod(2)
          .build()
      ];

      const engine = new ScheduleEngine(
        [...lowerClasses, ...upperClasses],
        startDate,
        defaultConstraints,
        defaultPreferences,
        []
      );

      const schedule = engine.scoreExistingSchedule([...lowerClasses, ...upperClasses]);
      expect(schedule.score.gradeGroupCohesion).toBe(1); // Perfect cohesion
    });

    it('should score lower cohesion when grade groups are mixed on same day', () => {
      // Mix lower and upper grades on same day
      const mixedClasses = [
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('4')
          .withClassNumber(2)
          .withDate(startDate)
          .withPeriod(2)
          .build(),
        new ClassBuilder()
          .withGradeLevel('2')
          .withClassNumber(3)
          .withDate(startDate)
          .withPeriod(3)
          .build(),
        new ClassBuilder()
          .withGradeLevel('5')
          .withClassNumber(4)
          .withDate(startDate)
          .withPeriod(4)
          .build()
      ];

      const engine = new ScheduleEngine(
        mixedClasses,
        startDate,
        defaultConstraints,
        defaultPreferences,
        []
      );

      const schedule = engine.scoreExistingSchedule(mixedClasses);
      expect(schedule.score.gradeGroupCohesion).toBe(0.5); // Two groups per day = 0.5 cohesion
    });
  });

  describe('Grade Progression', () => {
    it('should score perfect progression when high-to-low preference is followed', () => {
      const preferences = new PreferencesBuilder()
        .withGradeGroups(gradeGroups)
        .withPreferSameGradeInDay(true)
        .withGradeProgression('high-to-low')
        .build();

      const classes = [
        new ClassBuilder()
          .withGradeLevel('6')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('5')
          .withClassNumber(2)
          .withDate(startDate)
          .withPeriod(2)
          .build(),
        new ClassBuilder()
          .withGradeLevel('4')
          .withClassNumber(3)
          .withDate(startDate)
          .withPeriod(3)
          .build()
      ];

      const engine = new ScheduleEngine(
        classes,
        startDate,
        defaultConstraints,
        preferences,
        []
      );

      const schedule = engine.scoreExistingSchedule(classes);
      expect(schedule.score.gradeProgression).toBe(1); // Perfect progression
    });

    it('should score perfect progression when low-to-high preference is followed', () => {
      const preferences = new PreferencesBuilder()
        .withGradeGroups(gradeGroups)
        .withPreferSameGradeInDay(true)
        .withGradeProgression('low-to-high')
        .build();

      const classes = [
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('2')
          .withClassNumber(2)
          .withDate(startDate)
          .withPeriod(2)
          .build(),
        new ClassBuilder()
          .withGradeLevel('3')
          .withClassNumber(3)
          .withDate(startDate)
          .withPeriod(3)
          .build()
      ];

      const engine = new ScheduleEngine(
        classes,
        startDate,
        defaultConstraints,
        preferences,
        []
      );

      const schedule = engine.scoreExistingSchedule(classes);
      expect(schedule.score.gradeProgression).toBe(1); // Perfect progression
    });
  });

  describe('Distribution Quality', () => {
    it('should score perfect distribution when classes are evenly distributed', () => {
      const classes = [
        // Monday - 2 classes
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('2')
          .withClassNumber(2)
          .withDate(startDate)
          .withPeriod(2)
          .build(),
        // Tuesday - 2 classes
        new ClassBuilder()
          .withGradeLevel('3')
          .withClassNumber(3)
          .withDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000))
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('4')
          .withClassNumber(4)
          .withDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000))
          .withPeriod(2)
          .build()
      ];

      const engine = new ScheduleEngine(
        classes,
        startDate,
        defaultConstraints,
        defaultPreferences,
        []
      );

      const schedule = engine.scoreExistingSchedule(classes);
      expect(schedule.score.distributionQuality).toBe(1); // Perfect distribution
    });

    it('should score lower distribution when classes are unevenly distributed', () => {
      const classes = [
        // Monday - 1 class
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        // Tuesday - 3 classes
        new ClassBuilder()
          .withGradeLevel('2')
          .withClassNumber(2)
          .withDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000))
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('3')
          .withClassNumber(3)
          .withDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000))
          .withPeriod(2)
          .build(),
        new ClassBuilder()
          .withGradeLevel('4')
          .withClassNumber(4)
          .withDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000))
          .withPeriod(3)
          .build()
      ];

      const engine = new ScheduleEngine(
        classes,
        startDate,
        defaultConstraints,
        defaultPreferences,
        []
      );

      const schedule = engine.scoreExistingSchedule(classes);
      expect(schedule.score.distributionQuality).toBeLessThan(1); // Imperfect distribution
    });
  });

  describe('Constraint Violations', () => {
    it('should count violations when max periods per day is exceeded', () => {
      const classes = Array.from({ length: 10 }, (_, i) => 
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(i + 1)
          .withDate(startDate)
          .withPeriod(i + 1)
          .build()
      );

      const engine = new ScheduleEngine(
        classes,
        startDate,
        defaultConstraints,
        defaultPreferences,
        []
      );

      const schedule = engine.scoreExistingSchedule(classes);
      expect(schedule.score.constraintViolations).toBeGreaterThan(0);
    });

    it('should count violations when consecutive period limit is exceeded', () => {
      const classes = [
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(2)
          .withDate(startDate)
          .withPeriod(2)
          .build(),
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(3)
          .withDate(startDate)
          .withPeriod(3)
          .build()
      ];

      const engine = new ScheduleEngine(
        classes,
        startDate,
        defaultConstraints,
        defaultPreferences,
        []
      );

      const schedule = engine.scoreExistingSchedule(classes);
      expect(schedule.score.constraintViolations).toBeGreaterThan(0);
    });
  });

  describe('Total Length', () => {
    it('should prefer shorter schedules', () => {
      // Create a compact schedule (all on same day)
      const compactClasses = [
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('2')
          .withClassNumber(2)
          .withDate(startDate)
          .withPeriod(2)
          .build()
      ];

      // Create a spread out schedule (on different days)
      const spreadClasses = [
        new ClassBuilder()
          .withGradeLevel('1')
          .withClassNumber(1)
          .withDate(startDate)
          .withPeriod(1)
          .build(),
        new ClassBuilder()
          .withGradeLevel('2')
          .withClassNumber(2)
          .withDate(new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000))  // 2 days later
          .withPeriod(1)
          .build()
      ];

      const compactEngine = new ScheduleEngine(
        compactClasses,
        startDate,
        defaultConstraints,
        defaultPreferences,
        []
      );

      const spreadEngine = new ScheduleEngine(
        spreadClasses,
        startDate,
        defaultConstraints,
        defaultPreferences,
        []
      );

      const compactSchedule = compactEngine.scoreExistingSchedule(compactClasses);
      const spreadSchedule = spreadEngine.scoreExistingSchedule(spreadClasses);

      expect(compactSchedule.score.totalLength).toBeLessThan(spreadSchedule.score.totalLength);
    });
  });
});
