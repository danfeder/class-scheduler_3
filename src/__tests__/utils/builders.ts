import { 
  GradeGroup, 
  ScheduleConstraints, 
  SchedulePreferences,
  GradeProgressionPreference,
  MaxConsecutivePeriods,
  ConsecutiveBreakLength,
  ScheduledClass,
  Schedule,
  Class
} from '../../types';

/**
 * Class Builder
 */
export class ClassBuilder {
  private class: Partial<ScheduledClass> = {};

  constructor() {
    // Set default values
    this.class = {
      id: `class-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test Class',
      classNumber: 1,
      teacher: 'Test Teacher',
      gradeLevel: '9',
      maxStudents: 30
    };
  }

  withId(id: string): ClassBuilder {
    this.class.id = id;
    return this;
  }

  withName(name: string): ClassBuilder {
    this.class.name = name;
    return this;
  }

  withClassNumber(num: number): ClassBuilder {
    this.class.classNumber = num;
    return this;
  }

  withTeacher(teacher: string): ClassBuilder {
    this.class.teacher = teacher;
    return this;
  }

  withGradeLevel(grade: string): ClassBuilder {
    this.class.gradeLevel = grade;
    return this;
  }

  withMaxStudents(max: number): ClassBuilder {
    this.class.maxStudents = max;
    return this;
  }

  withAllowedGrades(grades: string[]): ClassBuilder {
    this.class.allowedGrades = grades;
    return this;
  }

  withDate(date: Date): ClassBuilder {
    this.class.date = date;
    return this;
  }

  withPeriod(period: number): ClassBuilder {
    this.class.period = period;
    return this;
  }

  withTotalConflicts(conflicts: Array<{ classId: string; dayOfWeek: number; period: number }>): ClassBuilder {
    this.class.totalConflicts = conflicts;
    return this;
  }

  withPartialConflicts(conflicts: Array<{ classId: string; dayOfWeek: number; period: number }>): ClassBuilder {
    this.class.partialConflicts = conflicts;
    return this;
  }

  build(): ScheduledClass {
    return this.class as ScheduledClass;
  }
}

/**
 * Grade Group Builder
 */
export class GradeGroupBuilder {
  private group: Partial<GradeGroup> = {};

  constructor() {
    this.group = {
      id: `group-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test Group',
      grades: ['9', '10']
    };
  }

  withId(id: string): GradeGroupBuilder {
    this.group.id = id;
    return this;
  }

  withName(name: string): GradeGroupBuilder {
    this.group.name = name;
    return this;
  }

  withGrades(grades: string[]): GradeGroupBuilder {
    this.group.grades = grades;
    return this;
  }

  build(): GradeGroup {
    return this.group as GradeGroup;
  }
}

/**
 * Schedule Constraints Builder
 */
export class ConstraintsBuilder {
  private constraints: Partial<ScheduleConstraints> = {};

  constructor() {
    this.constraints = {
      maxPeriodsPerDay: 6,
      maxPeriodsPerWeek: 30,
      consecutivePeriods: {
        maximum: 2 as MaxConsecutivePeriods,
        requireBreak: 1 as ConsecutiveBreakLength
      }
    };
  }

  withMaxPeriodsPerDay(max: number): ConstraintsBuilder {
    this.constraints.maxPeriodsPerDay = max;
    return this;
  }

  withMaxPeriodsPerWeek(max: number): ConstraintsBuilder {
    this.constraints.maxPeriodsPerWeek = max;
    return this;
  }

  withConsecutivePeriods(maximum: MaxConsecutivePeriods, requireBreak: ConsecutiveBreakLength): ConstraintsBuilder {
    this.constraints.consecutivePeriods = { maximum, requireBreak };
    return this;
  }

  build(): ScheduleConstraints {
    return this.constraints as ScheduleConstraints;
  }
}

/**
 * Schedule Preferences Builder
 */
export class PreferencesBuilder {
  private preferences: Partial<SchedulePreferences> = {};

  constructor() {
    this.preferences = {
      gradeGroups: [],
      preferSameGradeInDay: true,
      gradeProgression: 'none' as GradeProgressionPreference
    };
  }

  withGradeGroups(groups: GradeGroup[]): PreferencesBuilder {
    this.preferences.gradeGroups = groups;
    return this;
  }

  withPreferSameGradeInDay(prefer: boolean): PreferencesBuilder {
    this.preferences.preferSameGradeInDay = prefer;
    return this;
  }

  withGradeProgression(progression: GradeProgressionPreference): PreferencesBuilder {
    this.preferences.gradeProgression = progression;
    return this;
  }

  build(): SchedulePreferences {
    return this.preferences as SchedulePreferences;
  }
}

/**
 * Schedule Builder
 */
export class ScheduleBuilder {
  private classes: Class[] = [];
  private startDate: Date = new Date();
  private constraints: ScheduleConstraints = {
    maxPeriodsPerDay: 4,
    maxPeriodsPerWeek: 16,
    consecutivePeriods: {
      maximum: 2,
      requireBreak: 1
    }
  };

  withClasses(classes: Class[]): ScheduleBuilder {
    this.classes = classes;
    return this;
  }

  withStartDate(date: Date): ScheduleBuilder {
    this.startDate = date;
    return this;
  }

  withConstraints(constraints?: Partial<ScheduleConstraints>): ScheduleBuilder {
    this.constraints = {
      maxPeriodsPerDay: 4,
      maxPeriodsPerWeek: 16,
      consecutivePeriods: {
        maximum: 2,
        requireBreak: 1
      },
      ...constraints
    }
    return this
  }

  build(): Schedule {
    if (!this.startDate) {
      this.startDate = new Date('2024-01-01')
    }

    // Convert classes to scheduled classes
    const scheduledClasses: ScheduledClass[] = this.classes.map((cls, index) => ({
      ...cls,
      date: new Date(this.startDate!.getTime() + Math.floor(index / 4) * 24 * 60 * 60 * 1000),
      period: (index % 4) + 1
    }))

    const schedule: Schedule = {
      classes: scheduledClasses,
      startDate: this.startDate,
      endDate: new Date(this.startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      constraints: this.constraints!,
      score: {
        totalLength: 0,
        gradeGroupCohesion: 0,
        distributionQuality: 0,
        constraintViolations: 0,
        gradeProgression: 0
      },

      clone(): Schedule {
        return {
          ...this,
          classes: [...this.classes],
          startDate: new Date(this.startDate),
          endDate: new Date(this.endDate),
          score: { ...this.score }
        }
      },

      getScheduledClassCount(): number {
        return this.classes.length
      },

      getTotalClassCount(): number {
        return this.classes.length
      },

      getUnscheduledClasses(): Class[] {
        const scheduledIds = new Set(this.classes.map(c => c.id))
        return this.classes.filter(c => !scheduledIds.has(c.id))
      },

      addClass(cls: ScheduledClass): void {
        this.classes.push(cls)
        this.endDate = new Date(Math.max(this.endDate.getTime(), cls.date.getTime()))
      },
      removeClass(cls: ScheduledClass): void {
        const index = this.classes.findIndex(c => c.id === cls.id)
        if (index !== -1) {
          this.classes.splice(index, 1)
        }
      }
    }

    return schedule
  }
}
