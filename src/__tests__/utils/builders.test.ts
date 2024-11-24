import { 
  ClassBuilder, 
  GradeGroupBuilder, 
  ConstraintsBuilder, 
  PreferencesBuilder 
} from './builders';
import { 
  classAssertions, 
  gradeGroupAssertions, 
  testDataHelpers 
} from './assertions';

describe('Test Utilities', () => {
  describe('ClassBuilder', () => {
    it('should create a valid class with default values', () => {
      const testClass = new ClassBuilder().build();
      expect(testClass.id).toBeDefined();
      expect(testClass.name).toBe('Test Class');
      expect(testClass.classNumber).toBe(1);
      classAssertions.hasValidGradeLevels(testClass);
    });

    it('should allow custom values', () => {
      const testClass = new ClassBuilder()
        .withName('Math 101')
        .withClassNumber(101)
        .withTeacher('Mr. Smith')
        .withGradeLevel('10')
        .withMaxStudents(25)
        .withAllowedGrades(['9', '10', '11'])
        .build();

      expect(testClass.name).toBe('Math 101');
      expect(testClass.classNumber).toBe(101);
      expect(testClass.teacher).toBe('Mr. Smith');
      expect(testClass.gradeLevel).toBe('10');
      expect(testClass.maxStudents).toBe(25);
      expect(testClass.allowedGrades).toEqual(['9', '10', '11']);
      classAssertions.hasValidGradeLevels(testClass);
    });

    it('should handle conflicts correctly', () => {
      const testClass = new ClassBuilder()
        .withTotalConflicts([
          { classId: 'class-1', dayOfWeek: 0, period: 1 }
        ])
        .withPartialConflicts([
          { classId: 'class-2', dayOfWeek: 1, period: 2 }
        ])
        .build();

      classAssertions.hasValidConflicts(testClass);
    });
  });

  describe('GradeGroupBuilder', () => {
    it('should create a valid grade group with default values', () => {
      const group = new GradeGroupBuilder().build();
      gradeGroupAssertions.isValid(group);
    });

    it('should allow custom values', () => {
      const group = new GradeGroupBuilder()
        .withName('Junior High')
        .withGrades(['7', '8', '9'])
        .build();

      expect(group.name).toBe('Junior High');
      expect(group.grades).toEqual(['7', '8', '9']);
      gradeGroupAssertions.isValid(group);
    });

    it('should create non-overlapping groups', () => {
      const group1 = new GradeGroupBuilder()
        .withGrades(['9', '10'])
        .build();
      const group2 = new GradeGroupBuilder()
        .withGrades(['11', '12'])
        .build();

      gradeGroupAssertions.noOverlap([group1, group2]);
    });
  });

  describe('ConstraintsBuilder', () => {
    it('should create valid constraints with default values', () => {
      const constraints = new ConstraintsBuilder().build();
      expect(constraints.maxPeriodsPerDay).toBe(6);
      expect(constraints.maxPeriodsPerWeek).toBe(30);
      expect(constraints.consecutivePeriods.maximum).toBe(2);
      expect(constraints.consecutivePeriods.requireBreak).toBe(1);
    });

    it('should allow custom values', () => {
      const constraints = new ConstraintsBuilder()
        .withMaxPeriodsPerDay(5)
        .withMaxPeriodsPerWeek(25)
        .withConsecutivePeriods(1, 2)
        .build();

      expect(constraints.maxPeriodsPerDay).toBe(5);
      expect(constraints.maxPeriodsPerWeek).toBe(25);
      expect(constraints.consecutivePeriods.maximum).toBe(1);
      expect(constraints.consecutivePeriods.requireBreak).toBe(2);
    });
  });

  describe('PreferencesBuilder', () => {
    it('should create valid preferences with default values', () => {
      const preferences = new PreferencesBuilder().build();
      expect(preferences.gradeGroups).toEqual([]);
      expect(preferences.preferSameGradeInDay).toBe(true);
      expect(preferences.gradeProgression).toBe('none');
    });

    it('should allow custom values', () => {
      const group = new GradeGroupBuilder().build();
      const preferences = new PreferencesBuilder()
        .withGradeGroups([group])
        .withPreferSameGradeInDay(false)
        .withGradeProgression('high-to-low')
        .build();

      expect(preferences.gradeGroups).toHaveLength(1);
      expect(preferences.preferSameGradeInDay).toBe(false);
      expect(preferences.gradeProgression).toBe('high-to-low');
    });
  });

  describe('TestDataHelpers', () => {
    it('should generate correct date ranges', () => {
      const startDate = new Date('2024-11-22');
      const dates = testDataHelpers.dateRange(startDate, 5);
      
      expect(dates).toHaveLength(5);
      expect(dates[0]).toEqual(startDate);
      expect(dates[4].getDate()).toBe(startDate.getDate() + 4);
    });

    it('should generate correct class numbers', () => {
      const numbers = testDataHelpers.classNumbers(3, 100);
      expect(numbers).toEqual([100, 101, 102]);
    });

    it('should generate correct grade levels', () => {
      const grades = testDataHelpers.gradeLevels(9, 12);
      expect(grades).toEqual(['9', '10', '11', '12']);
    });
  });
});
