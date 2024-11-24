import { ScheduleConstraints, MaxConsecutivePeriods, ConsecutiveBreakLength } from '../types';

describe('Schedule Constraints Validation', () => {
  // Helper function to create valid base constraints
  const createValidConstraints = (): ScheduleConstraints => ({
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 30,
    consecutivePeriods: {
      maximum: 2 as MaxConsecutivePeriods,
      requireBreak: 1 as ConsecutiveBreakLength
    }
  });

  describe('maxPeriodsPerDay validation', () => {
    it('should accept valid periods per day', () => {
      const constraints = createValidConstraints();
      expect(validateMaxPeriodsPerDay(constraints.maxPeriodsPerDay)).toBe(true);
    });

    it('should reject negative periods per day', () => {
      const constraints = { ...createValidConstraints(), maxPeriodsPerDay: -1 };
      expect(validateMaxPeriodsPerDay(constraints.maxPeriodsPerDay)).toBe(false);
    });

    it('should reject zero periods per day', () => {
      const constraints = { ...createValidConstraints(), maxPeriodsPerDay: 0 };
      expect(validateMaxPeriodsPerDay(constraints.maxPeriodsPerDay)).toBe(false);
    });

    it('should reject more than 8 periods per day', () => {
      const constraints = { ...createValidConstraints(), maxPeriodsPerDay: 9 };
      expect(validateMaxPeriodsPerDay(constraints.maxPeriodsPerDay)).toBe(false);
    });
  });

  describe('maxPeriodsPerWeek validation', () => {
    it('should accept valid periods per week', () => {
      const constraints = createValidConstraints();
      expect(validateMaxPeriodsPerWeek(constraints.maxPeriodsPerWeek)).toBe(true);
    });

    it('should reject negative periods per week', () => {
      const constraints = { ...createValidConstraints(), maxPeriodsPerWeek: -1 };
      expect(validateMaxPeriodsPerWeek(constraints.maxPeriodsPerWeek)).toBe(false);
    });

    it('should reject zero periods per week', () => {
      const constraints = { ...createValidConstraints(), maxPeriodsPerWeek: 0 };
      expect(validateMaxPeriodsPerWeek(constraints.maxPeriodsPerWeek)).toBe(false);
    });

    it('should reject more than 40 periods per week', () => {
      const constraints = { ...createValidConstraints(), maxPeriodsPerWeek: 41 };
      expect(validateMaxPeriodsPerWeek(constraints.maxPeriodsPerWeek)).toBe(false);
    });

    it('should reject when less than maxPeriodsPerDay * 5', () => {
      const constraints = {
        ...createValidConstraints(),
        maxPeriodsPerDay: 6,
        maxPeriodsPerWeek: 25 // Less than 6 * 5 = 30
      };
      expect(validateMaxPeriodsPerWeek(constraints.maxPeriodsPerWeek, constraints.maxPeriodsPerDay)).toBe(false);
    });
  });

  describe('consecutivePeriods validation', () => {
    it('should accept valid consecutive period settings', () => {
      const constraints = createValidConstraints();
      expect(validateConsecutivePeriods(constraints.consecutivePeriods)).toBe(true);
    });

    it('should reject invalid maximum consecutive periods', () => {
      const constraints = {
        ...createValidConstraints(),
        consecutivePeriods: {
          ...createValidConstraints().consecutivePeriods,
          maximum: 3 as MaxConsecutivePeriods
        }
      };
      expect(validateConsecutivePeriods(constraints.consecutivePeriods)).toBe(false);
    });

    it('should reject invalid break length', () => {
      const constraints = {
        ...createValidConstraints(),
        consecutivePeriods: {
          ...createValidConstraints().consecutivePeriods,
          requireBreak: 3 as ConsecutiveBreakLength
        }
      };
      expect(validateConsecutivePeriods(constraints.consecutivePeriods)).toBe(false);
    });
  });
});

// Validation functions
function validateMaxPeriodsPerDay(maxPeriodsPerDay: number): boolean {
  return maxPeriodsPerDay > 0 && maxPeriodsPerDay <= 8;
}

function validateMaxPeriodsPerWeek(maxPeriodsPerWeek: number, maxPeriodsPerDay?: number): boolean {
  if (maxPeriodsPerWeek <= 0 || maxPeriodsPerWeek > 40) return false;
  if (maxPeriodsPerDay && maxPeriodsPerWeek < maxPeriodsPerDay * 5) return false;
  return true;
}

function validateConsecutivePeriods(consecutivePeriods: ScheduleConstraints['consecutivePeriods']): boolean {
  const validMaximums = [1, 2];
  const validBreakLengths = [1, 2];
  
  return (
    validMaximums.includes(consecutivePeriods.maximum) &&
    validBreakLengths.includes(consecutivePeriods.requireBreak)
  );
}
