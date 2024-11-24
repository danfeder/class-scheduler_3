/**
 * Core scheduling engine that handles class scheduling with constraints.
 * Works in conjunction with SimulatedAnnealing for optimization.
 * 
 * Features:
 * - Constraint validation
 * - Schedule scoring
 * - Grade group management
 * - Blackout period handling
 * 
 * @version 1.0.0
 */

import {
  Class,
  Schedule,
  ScheduledClass,
  ScheduleConstraints,
  SchedulePreferences,
} from '../types';

const MAX_ITERATIONS = 10000 // Prevent infinite loops

/**
 * Interface for tracking schedule scores
 */
interface ScheduleScore {
  totalLength: number
  gradeGroupCohesion: number
  distributionQuality: number
  constraintViolations: number
  gradeProgression: number
  partialConflictPenalty: number
}

/**
 * Main class for generating and optimizing class schedules
 */
export class ScheduleEngine {
  private classes: Class[]
  private startDate: Date
  private constraints: ScheduleConstraints

  constructor(
    classes: Class[],
    startDate: Date,
    constraints: ScheduleConstraints,
    _preferences: SchedulePreferences
  ) {
    this.classes = classes
    this.startDate = startDate
    this.constraints = constraints
  }

  /**
   * Calculates various metrics for a schedule
   * @param classes The scheduled classes to evaluate
   * @returns A ScheduleScore object with various metrics
   */
  protected calculateScore(classes: ScheduledClass[]): ScheduleScore {
    // Calculate total length score
    const totalLength = classes.length / this.classes.length;

    // Calculate grade group cohesion
    let gradeGroupCohesion = 0;
    const gradeGroups = new Map<string, ScheduledClass[]>();
    classes.forEach(cls => {
      if (!gradeGroups.has(cls.gradeGroup)) {
        gradeGroups.set(cls.gradeGroup, []);
      }
      gradeGroups.get(cls.gradeGroup)?.push(cls);
    });

    gradeGroups.forEach(groupClasses => {
      // Calculate average distance between classes in the same group
      let totalDistance = 0;
      let comparisons = 0;

      for (let i = 0; i < groupClasses.length; i++) {
        for (let j = i + 1; j < groupClasses.length; j++) {
          const distance = Math.abs(
            groupClasses[i].date.getTime() - groupClasses[j].date.getTime()
          );
          totalDistance += distance;
          comparisons++;
        }
      }

      if (comparisons > 0) {
        // Normalize the cohesion score
        gradeGroupCohesion += 1 - (totalDistance / comparisons) / (14 * 24 * 60 * 60 * 1000);
      }
    });

    if (gradeGroups.size > 0) {
      gradeGroupCohesion /= gradeGroups.size;
    }

    // Calculate distribution quality
    let distributionQuality = 0;
    const classesByDate = new Map<string, number>();
    classes.forEach(cls => {
      const dateKey = cls.date.toISOString().split('T')[0];
      classesByDate.set(dateKey, (classesByDate.get(dateKey) || 0) + 1);
    });

    const maxClassesPerDay = this.constraints.maxClassesPerDay;
    classesByDate.forEach(count => {
      // Higher score for days that are closer to maxClassesPerDay
      distributionQuality += count / maxClassesPerDay;
    });

    if (classesByDate.size > 0) {
      distributionQuality /= classesByDate.size;
    }

    // Calculate grade progression score
    let gradeProgression = 0;
    const classesByDay = new Map<string, ScheduledClass[]>();
    classes.forEach(cls => {
      const dateKey = cls.date.toISOString().split('T')[0];
      if (!classesByDay.has(dateKey)) {
        classesByDay.set(dateKey, []);
      }
      classesByDay.get(dateKey)?.push(cls);
    });

    classesByDay.forEach(dayClasses => {
      // Sort classes by period
      dayClasses.sort((a, b) => a.period - b.period);

      // Check if grade levels generally increase throughout the day
      for (let i = 0; i < dayClasses.length - 1; i++) {
        const currentGrade = parseInt(dayClasses[i].gradeLevel);
        const nextGrade = parseInt(dayClasses[i + 1].gradeLevel);
        if (currentGrade <= nextGrade) {
          gradeProgression++;
        }
      }

      if (dayClasses.length > 1) {
        gradeProgression /= (dayClasses.length - 1);
      }
    });

    // Calculate constraint violations and partial conflict penalties
    const constraintViolations = this.calculateConstraintViolations(classes);

    return {
      totalLength,
      gradeGroupCohesion,
      distributionQuality,
      constraintViolations,
      gradeProgression,
      partialConflictPenalty: 0
    };
  }

  protected aggregateScore(scores: ScheduleScore): number {
    const weights = {
      totalLength: 1,
      gradeGroupCohesion: 0.5,
      distributionQuality: 0.3,
      constraintViolations: -100,
      gradeProgression: 0.4,
      partialConflictPenalty: 0  // No penalty for partial conflicts
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + scores[key as keyof ScheduleScore] * weight;
    }, 0);
  }

  private calculateConstraintViolations(classes: ScheduledClass[]): number {
    let violations = 0;

    // Check for total conflict violations
    classes.forEach(cls => {
      const originalClass = this.classes.find(c => c.id === cls.id);
      if (!originalClass) return;

      const hasTotalConflict = originalClass.totalConflicts.some(
        conflict => 
          conflict.date.getTime() === cls.date.getTime() && 
          conflict.period === cls.period
      );
      if (hasTotalConflict) {
        violations += 1;
      }
    });

    return violations;
  }

  private getDateRange(startDate: Date, numDays: number): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < numDays; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  private generateInitialSolution(): Schedule {
    const classes: ScheduledClass[] = [];
    const dates = this.getDateRange(this.startDate, 14); // Two weeks of dates
    const periods = Array.from({ length: this.constraints.maxPeriodsPerDay }, (_, i) => i + 1);

    // Track classes per day to ensure even distribution
    const classesPerDay = new Map<string, number>();

    // Try to schedule each class
    this.classes.forEach(cls => {
      let scheduled = false;
      let bestSlot: { date: Date; period: number } | null = null;

      // Shuffle dates and periods for better distribution
      const shuffledDates = [...dates].sort(() => Math.random() - 0.5);
      const shuffledPeriods = [...periods].sort(() => Math.random() - 0.5);

      // Try each date and period until we find a valid slot
      for (const date of shuffledDates) {
        if (scheduled) break;

        const dateKey = date.toISOString().split('T')[0];
        const currentClassesOnDay = classesPerDay.get(dateKey) || 0;

        // Skip if we've reached max classes for this day
        if (currentClassesOnDay >= this.constraints.maxClassesPerDay) {
          continue;
        }

        for (const period of shuffledPeriods) {
          // Check if this slot has any total conflicts
          const hasTotalConflict = cls.totalConflicts.some(
            conflict => 
              conflict.date.getTime() === date.getTime() && 
              conflict.period === period
          );

          if (!hasTotalConflict) {
            // Always update best slot
            if (!bestSlot) {
              bestSlot = { date, period };
            }

            // Always schedule with high probability
            if (Math.random() < 0.99) {
              classes.push({
                id: cls.id,
                name: cls.name,
                gradeLevel: cls.gradeLevel,
                gradeGroup: cls.gradeGroup,
                teacher: cls.teacher,
                date,
                period,
                totalConflicts: cls.totalConflicts,
                partialConflicts: cls.partialConflicts
              });
              
              // Update classes per day count
              classesPerDay.set(dateKey, currentClassesOnDay + 1);
              scheduled = true;
              break;
            }
          }
        }
      }

      // If we haven't scheduled yet, use the best available slot
      if (!scheduled && bestSlot) {
        const dateKey = bestSlot.date.toISOString().split('T')[0];
        const currentClassesOnDay = classesPerDay.get(dateKey) || 0;
        
        classes.push({
          id: cls.id,
          name: cls.name,
          gradeLevel: cls.gradeLevel,
          gradeGroup: cls.gradeGroup,
          teacher: cls.teacher,
          date: bestSlot.date,
          period: bestSlot.period,
          totalConflicts: cls.totalConflicts,
          partialConflicts: cls.partialConflicts
        });
        
        // Update classes per day count
        classesPerDay.set(dateKey, currentClassesOnDay + 1);
      }
    });

    const score = this.calculateScore(classes);

    return {
      classes,
      score
    };
  }

  private mutateSchedule(schedule: Schedule): Schedule {
    const newClasses = [...schedule.classes];
    const dates = this.getDateRange(this.startDate, 14);
    const periods = Array.from({ length: this.constraints.maxPeriodsPerDay }, (_, i) => i + 1);

    // Track classes per day
    const classesPerDay = new Map<string, number>();
    newClasses.forEach(cls => {
      const dateKey = cls.date.toISOString().split('T')[0];
      classesPerDay.set(dateKey, (classesPerDay.get(dateKey) || 0) + 1);
    });

    // Randomly select a class to move
    const indexToMove = Math.floor(Math.random() * newClasses.length);
    const classToMove = newClasses[indexToMove];
    const originalClass = this.classes.find(c => c.id === classToMove.id);

    if (!originalClass) return schedule;

    // Remove the class from its current day count
    const oldDateKey = classToMove.date.toISOString().split('T')[0];
    classesPerDay.set(oldDateKey, (classesPerDay.get(oldDateKey) || 1) - 1);

    // Try to find a new valid slot
    let moved = false;
    let bestSlot: { date: Date; period: number } | null = null;

    const shuffledDates = dates.sort(() => Math.random() - 0.5);
    const shuffledPeriods = periods.sort(() => Math.random() - 0.5);

    for (const date of shuffledDates) {
      if (moved) break;

      const dateKey = date.toISOString().split('T')[0];
      const currentClassesOnDay = classesPerDay.get(dateKey) || 0;

      // Skip if we've reached max classes for this day
      if (currentClassesOnDay >= this.constraints.maxClassesPerDay) {
        continue;
      }

      for (const period of shuffledPeriods) {
        // Check if this slot has any total conflicts
        const hasTotalConflict = originalClass.totalConflicts.some(
          conflict => 
            conflict.date.getTime() === date.getTime() && 
            conflict.period === period
        );

        if (!hasTotalConflict) {
          // Update best slot
          if (!bestSlot) {
            bestSlot = { date, period };
          }

          // Always schedule with high probability
          if (Math.random() < 0.99) {
            moved = true;
            break;
          }
        }
      }
    }

    // Use the best slot we found
    if (bestSlot) {
      const dateKey = bestSlot.date.toISOString().split('T')[0];
      const currentClassesOnDay = classesPerDay.get(dateKey) || 0;
      
      newClasses[indexToMove] = {
        ...classToMove,
        date: bestSlot.date,
        period: bestSlot.period
      };
      
      // Update classes per day count for the new day
      classesPerDay.set(dateKey, currentClassesOnDay + 1);
    }

    const score = this.calculateScore(newClasses);

    return {
      classes: newClasses,
      score
    };
  }

  public generateSchedule(): Schedule {
    let iterations = 0
    let bestScore = -Infinity
    let lastImprovement = 0
    const maxIterationsWithoutImprovement = 1000

    // Generate initial solution
    let currentSchedule = this.generateInitialSolution()
    let bestSchedule = currentSchedule

    // Simulated annealing parameters
    const initialTemperature = 1.0
    const coolingRate = 0.995

    while (iterations < MAX_ITERATIONS && (iterations - lastImprovement) < maxIterationsWithoutImprovement) {
      const temperature = initialTemperature * Math.pow(coolingRate, iterations)

      // Generate a neighbor solution
      const newSchedule = this.mutateSchedule(currentSchedule)
      const currentScore = this.aggregateScore(currentSchedule.score)
      const newScore = this.aggregateScore(newSchedule.score)

      // Decide if we should accept the new solution
      if (newScore > currentScore || Math.random() < Math.exp((newScore - currentScore) / temperature)) {
        currentSchedule = newSchedule

        // Update best solution if this is better
        if (newScore > bestScore) {
          bestScore = newScore
          bestSchedule = newSchedule
          lastImprovement = iterations
        }
      }

      iterations++
    }

    return bestSchedule
  }
}
