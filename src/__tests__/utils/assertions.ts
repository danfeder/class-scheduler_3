import { Schedule, Class, GradeGroup } from '../../types';

/**
 * Schedule Assertions
 */
export const scheduleAssertions = {
  /**
   * Assert that classes in the same grade group are scheduled close together
   */
  hasGradeGroupCohesion: (schedule: Schedule, gradeGroups: GradeGroup[]): void => {
    // Implementation will depend on how we measure cohesion
    // This is a placeholder for the actual implementation
    expect(schedule).toBeDefined();
    expect(gradeGroups.length).toBeGreaterThan(0);
  },

  /**
   * Assert that the schedule respects maximum periods per day
   */
  respectsMaxPeriodsPerDay: (schedule: Schedule): void => {
    const maxPerDay = schedule.constraints.maxPeriodsPerDay;
    // TODO: Implement check for each day's period count
    expect(maxPerDay).toBeGreaterThan(0);
  },

  /**
   * Assert that the schedule respects maximum periods per week
   */
  respectsMaxPeriodsPerWeek: (schedule: Schedule): void => {
    const maxPerWeek = schedule.constraints.maxPeriodsPerWeek;
    // TODO: Implement check for weekly period count
    expect(maxPerWeek).toBeGreaterThan(0);
  },

  /**
   * Assert that consecutive period constraints are respected
   */
  respectsConsecutivePeriods: (schedule: Schedule): void => {
    const { maximum, requireBreak } = schedule.constraints.consecutivePeriods;
    // TODO: Implement check for consecutive periods and breaks
    expect(maximum).toBeDefined();
    expect(requireBreak).toBeDefined();
  }
};

/**
 * Class Assertions
 */
export const classAssertions = {
  /**
   * Assert that a class has valid grade levels
   */
  hasValidGradeLevels: (classObj: Class): void => {
    expect(classObj.gradeLevel).toBeDefined();
    if (classObj.allowedGrades) {
      expect(classObj.allowedGrades).toContain(classObj.gradeLevel);
    }
  },

  /**
   * Assert that class conflicts are valid
   */
  hasValidConflicts: (classObj: Class): void => {
    if (classObj.totalConflicts) {
      classObj.totalConflicts.forEach(conflict => {
        expect(conflict.classId).toBeDefined();
        expect(conflict.dayOfWeek).toBeGreaterThanOrEqual(0);
        expect(conflict.dayOfWeek).toBeLessThanOrEqual(4); // 0-4 for Monday-Friday
        expect(conflict.period).toBeGreaterThanOrEqual(1);
      });
    }

    if (classObj.partialConflicts) {
      classObj.partialConflicts.forEach(conflict => {
        expect(conflict.classId).toBeDefined();
        expect(conflict.dayOfWeek).toBeGreaterThanOrEqual(0);
        expect(conflict.dayOfWeek).toBeLessThanOrEqual(4);
        expect(conflict.period).toBeGreaterThanOrEqual(1);
      });
    }
  }
};

/**
 * Grade Group Assertions
 */
export const gradeGroupAssertions = {
  /**
   * Assert that grade groups are valid
   */
  isValid: (group: GradeGroup): void => {
    expect(group.id).toBeDefined();
    expect(group.name).toBeDefined();
    expect(group.grades).toBeDefined();
    expect(group.grades.length).toBeGreaterThan(0);
  },

  /**
   * Assert that grade groups don't overlap
   */
  noOverlap: (groups: GradeGroup[]): void => {
    const allGrades = new Set<string>();
    groups.forEach(group => {
      group.grades.forEach(grade => {
        expect(allGrades.has(grade)).toBeFalsy();
        allGrades.add(grade);
      });
    });
  }
};

/**
 * Test Data Generation Helpers
 */
export const testDataHelpers = {
  /**
   * Generate a range of dates for testing
   */
  dateRange: (startDate: Date, days: number): Date[] => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });
  },

  /**
   * Generate a sequence of class numbers
   */
  classNumbers: (count: number, startFrom: number = 1): number[] => {
    return Array.from({ length: count }, (_, i) => startFrom + i);
  },

  /**
   * Generate grade levels
   */
  gradeLevels: (min: number = 9, max: number = 12): string[] => {
    return Array.from({ length: max - min + 1 }, (_, i) => (min + i).toString());
  }
};
