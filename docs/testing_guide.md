# Testing Guide

## Test Organization

### 1. Unit Tests
Located in `__tests__/unit`

#### Core Components
- `Schedule.test.ts`
- `Constraints.test.ts`
- `Mutations.test.ts`
- `GradeGroups.test.ts`

#### Test Data
```typescript
// __tests__/fixtures/scheduleFixtures.ts
export const createTestSchedule = (config: Partial<ScheduleConfig> = {}): Schedule => ({
  classes: new Map([
    [1, createTestClass({ id: 1, teacher: 'T1', grade: '9' })],
    [2, createTestClass({ id: 2, teacher: 'T2', grade: '10' })],
    // ... more test classes
  ]),
  periods: [
    createTestPeriod({ day: 'MONDAY', timeSlot: 1 }),
    createTestPeriod({ day: 'MONDAY', timeSlot: 2 }),
    // ... more test periods
  ],
  ...config
})

export const createTestClass = (config: Partial<ClassConfig> = {}): Class => ({
  id: config.id || 1,
  name: config.name || `Class ${config.id || 1}`,
  teacher: config.teacher || 'T1',
  gradeLevel: config.gradeLevel || '9',
  totalConflicts: config.totalConflicts || [],
  partialConflicts: config.partialConflicts || [],
  ...config
})

export const createScheduleWithClass = (cls: Class): Schedule => ({
  classes: new Map([[cls.id, cls]]),
  periods: [
    createTestPeriod({ day: 'MONDAY', timeSlot: 1 }),
    createTestPeriod({ day: 'MONDAY', timeSlot: 2 }),
    createTestPeriod({ day: 'MONDAY', timeSlot: 3 })
  ]
})

export const createScheduleWithClasses = (classes: Class[]): Schedule => ({
  classes: new Map(classes.map(cls => [cls.id, cls])),
  periods: [
    createTestPeriod({ day: 'MONDAY', timeSlot: 1 }),
    createTestPeriod({ day: 'MONDAY', timeSlot: 2 }),
    createTestPeriod({ day: 'MONDAY', timeSlot: 3 })
  ]
})
```

### 2. Integration Tests
Located in `__tests__/integration`

#### End-to-End Flows
- Schedule generation
- Constraint validation
- Grade group optimization
- Worker coordination

#### Test Scenarios
```typescript
// __tests__/integration/scheduleGeneration.test.ts
describe('Schedule Generation', () => {
  const scenarios = [
    {
      name: 'small schedule',
      classes: 10,
      expectedSuccess: true,
      maxDuration: 1000
    },
    {
      name: 'medium schedule',
      classes: 50,
      expectedSuccess: true,
      maxDuration: 5000
    },
    {
      name: 'large schedule',
      classes: 100,
      expectedSuccess: true,
      maxDuration: 15000
    }
  ]

  scenarios.forEach(scenario => {
    it(`should handle ${scenario.name}`, async () => {
      const result = await generateSchedule(scenario)
      expect(result.success).toBe(scenario.expectedSuccess)
      expect(result.duration).toBeLessThan(scenario.maxDuration)
    })
  })
})

#### Conflict Handling Tests
```typescript
// __tests__/integration/conflictHandling.test.ts
describe('Class Conflict Handling', () => {
  describe('Total Conflicts', () => {
    it('should never schedule classes during total conflicts', () => {
      const class1 = createTestClass({
        id: 1,
        totalConflicts: [
          { date: new Date('2024-01-01'), period: 1, type: 'total' }
        ]
      })
      const schedule = createScheduleWithClass(class1)
      const result = scheduleEngine.generateSchedule(schedule)
      
      expect(result.classes.some(cls => 
        cls.date.getTime() === class1.totalConflicts[0].date.getTime() &&
        cls.period === class1.totalConflicts[0].period
      )).toBeFalsy()
    })

    it('should handle overlapping total conflicts', () => {
      const class1 = createTestClass({
        id: 1,
        totalConflicts: [
          { date: new Date('2024-01-01'), period: 1, type: 'total' }
        ]
      })
      const class2 = createTestClass({
        id: 2,
        totalConflicts: [
          { date: new Date('2024-01-01'), period: 1, type: 'total' }
        ]
      })
      const schedule = createScheduleWithClasses([class1, class2])
      const result = scheduleEngine.generateSchedule(schedule)
      
      expect(result.isValid()).toBeTruthy()
    })
  })

  describe('Partial Conflicts', () => {
    it('should handle partial conflicts probabilistically', () => {
      const class1 = createTestClass({
        id: 1,
        partialConflicts: [
          { date: new Date('2024-01-01'), period: 1, type: 'partial' }
        ]
      })
      
      // Run multiple times to test probabilistic behavior
      const trials = 100
      let conflictCount = 0
      
      for (let i = 0; i < trials; i++) {
        const schedule = createScheduleWithClass(class1)
        const result = scheduleEngine.generateSchedule(schedule)
        
        if (result.classes.some(cls =>
          cls.date.getTime() === class1.partialConflicts[0].date.getTime() &&
          cls.period === class1.partialConflicts[0].period
        )) {
          conflictCount++
        }
      }
      
      // Expect roughly 30% scheduling during partial conflicts
      expect(conflictCount / trials).toBeCloseTo(0.3, 1)
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle mixed total and partial conflicts', () => {
      const class1 = createTestClass({
        id: 1,
        totalConflicts: [
          { date: new Date('2024-01-01'), period: 1, type: 'total' }
        ],
        partialConflicts: [
          { date: new Date('2024-01-01'), period: 2, type: 'partial' }
        ]
      })
      
      const schedule = createScheduleWithClass(class1)
      const result = scheduleEngine.generateSchedule(schedule)
      
      // Verify total conflicts are never scheduled
      expect(result.classes.some(cls =>
        cls.date.getTime() === class1.totalConflicts[0].date.getTime() &&
        cls.period === class1.totalConflicts[0].period
      )).toBeFalsy()
      
      // Verify partial conflicts are handled
      const hasPartialConflict = result.classes.some(cls =>
        cls.date.getTime() === class1.partialConflicts[0].date.getTime() &&
        cls.period === class1.partialConflicts[0].period
      )
      
      // Should be either scheduled or not, but schedule should be valid
      expect(result.isValid()).toBeTruthy()
    })
  })
})
```

### 3. Performance Tests
Located in `__tests__/performance`

#### Benchmarks
- Schedule generation time
- Memory usage
- Worker efficiency
- Constraint validation speed

#### Performance Metrics
```typescript
// __tests__/performance/metrics.ts
interface PerformanceMetrics {
  generationTime: number
  peakMemory: number
  constraintChecks: number
  mutationCount: number
  successRate: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    generationTime: 0,
    peakMemory: 0,
    constraintChecks: 0,
    mutationCount: 0,
    successRate: 0
  }

  startMonitoring(): void {
    this.resetMetrics()
    this.startTime = performance.now()
    this.memoryUsage = process.memoryUsage()
  }

  stopMonitoring(): PerformanceMetrics {
    this.metrics.generationTime = performance.now() - this.startTime
    this.metrics.peakMemory = Math.max(
      ...Object.values(process.memoryUsage())
    )
    return this.metrics
  }
}
```

## Test Data Management

### 1. Test Data Generation
```typescript
// __tests__/utils/dataGenerator.ts
class TestDataGenerator {
  generateClasses(count: number): Class[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Class ${i + 1}`,
      teacher: this.generateTeacher(),
      grade: this.generateGrade(),
      requirements: this.generateRequirements()
    }))
  }

  generateSchedule(classCount: number): Schedule {
    const classes = this.generateClasses(classCount)
    const periods = this.generatePeriods()
    return new Schedule(classes, periods)
  }
}
```

### 2. Test Fixtures
```typescript
// __tests__/fixtures/index.ts
export const fixtures = {
  smallSchedule: {
    classes: [/* 10 classes */],
    periods: [/* 30 periods */],
    constraints: [/* basic constraints */]
  },
  mediumSchedule: {
    classes: [/* 50 classes */],
    periods: [/* 30 periods */],
    constraints: [/* all constraints */]
  },
  largeSchedule: {
    classes: [/* 100 classes */],
    periods: [/* 30 periods */],
    constraints: [/* all constraints */]
  }
}
```

## Testing Strategies

### 1. Constraint Testing
```typescript
describe('Constraint Testing', () => {
  it('should handle teacher conflicts', () => {
    const schedule = createScheduleWithConflict('teacher')
    const validator = new ConstraintValidator()
    expect(validator.validate(schedule)).toBe(false)
    expect(validator.getViolations(schedule))
      .toContain('TeacherConflict')
  })

  it('should handle room conflicts', () => {
    const schedule = createScheduleWithConflict('room')
    const validator = new ConstraintValidator()
    expect(validator.validate(schedule)).toBe(false)
    expect(validator.getViolations(schedule))
      .toContain('RoomConflict')
  })
})
```

### 2. Mutation Testing
```typescript
describe('Mutation Testing', () => {
  it('should maintain valid state after mutations', () => {
    const schedule = createValidSchedule()
    const mutator = new ScheduleMutator()
    
    for (let i = 0; i < 100; i++) {
      const newSchedule = mutator.mutate(schedule)
      expect(validateSchedule(newSchedule)).toBe(true)
    }
  })
})
```

### 3. Grade Group Testing
```typescript
describe('Grade Group Testing', () => {
  it('should optimize grade group cohesion', () => {
    const schedule = createScheduleWithGrades()
    const optimizer = new GradeOptimizer()
    const optimized = optimizer.optimize(schedule)
    
    expect(calculateGradeCohesion(optimized))
      .toBeGreaterThan(calculateGradeCohesion(schedule))
  })
})
```

## Test Automation

### 1. CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Run performance tests
        run: npm run test:performance
```

### 2. Test Reports
```typescript
// __tests__/utils/reporter.ts
class TestReporter {
  generateReport(results: TestResults): TestReport {
    return {
      summary: this.generateSummary(results),
      details: this.generateDetails(results),
      performance: this.generatePerformanceReport(results)
    }
  }

  private generatePerformanceReport(results: TestResults): PerformanceReport {
    return {
      averageGenerationTime: this.calculateAverage(
        results.map(r => r.metrics.generationTime)
      ),
      peakMemoryUsage: Math.max(
        ...results.map(r => r.metrics.peakMemory)
      ),
      successRate: this.calculateSuccessRate(results)
    }
  }
}
```

## Debugging Guide

### 1. Common Issues
```typescript
// __tests__/utils/debugger.ts
class ScheduleDebugger {
  analyzeFailure(schedule: Schedule): DebugReport {
    return {
      constraintViolations: this.findConstraintViolations(schedule),
      gradeGroupIssues: this.findGradeGroupIssues(schedule),
      resourceConflicts: this.findResourceConflicts(schedule)
    }
  }

  private findConstraintViolations(schedule: Schedule): Violation[] {
    return this.constraints
      .filter(c => !c.validate(schedule))
      .map(c => ({
        constraint: c.name,
        details: c.getViolationDetails(schedule)
      }))
  }
}
```

### 2. Debugging Tools
```typescript
// __tests__/utils/tools.ts
export const debugTools = {
  visualizeSchedule: (schedule: Schedule): string => {
    // Generate ASCII visualization of schedule
    return generateScheduleGrid(schedule)
  },

  analyzePerformance: (metrics: PerformanceMetrics): string => {
    // Generate performance analysis report
    return generatePerformanceReport(metrics)
  },

  traceConstraints: (schedule: Schedule): string => {
    // Generate constraint validation trace
    return generateConstraintTrace(schedule)
  }
}
```

## Performance Testing

### 1. Load Tests
```typescript
describe('Load Testing', () => {
  const loads = [10, 50, 100, 200, 500]
  
  loads.forEach(classCount => {
    it(`should handle ${classCount} classes`, async () => {
      const schedule = await generateSchedule(classCount)
      expect(schedule.classes.size).toBe(classCount)
      expect(validateSchedule(schedule)).toBe(true)
    })
  })
})
```

### 2. Stress Tests
```typescript
describe('Stress Testing', () => {
  it('should handle continuous mutations', () => {
    const schedule = createLargeSchedule()
    const mutator = new ScheduleMutator()
    
    // Perform 1000 mutations
    for (let i = 0; i < 1000; i++) {
      const newSchedule = mutator.mutate(schedule)
      expect(validateSchedule(newSchedule)).toBe(true)
    }
  })
})
```

### 3. Memory Tests
```typescript
describe('Memory Testing', () => {
  it('should maintain stable memory usage', () => {
    const initialMemory = process.memoryUsage()
    const schedule = createLargeSchedule()
    
    // Generate 100 schedules
    for (let i = 0; i < 100; i++) {
      generateSchedule()
    }
    
    const finalMemory = process.memoryUsage()
    expect(finalMemory.heapUsed - initialMemory.heapUsed)
      .toBeLessThan(MAX_MEMORY_GROWTH)
  })
})
```
