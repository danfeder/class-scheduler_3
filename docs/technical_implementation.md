# Technical Implementation Guide

## Core Components

### 1. Schedule Engine

#### Schedule Interface
```typescript
interface Schedule {
  classes: ScheduledClass[]
  getUnscheduledClasses(): Class[]
  getScheduledClassCount(): number
  getTotalClassCount(): number
  addClass(cls: ScheduledClass): void
  removeClass(cls: ScheduledClass): void
  clone(): Schedule
}

interface ScheduledClass {
  class: Class
  date: Date
  period: number
}
```

#### Score Calculation
The engine uses a weighted scoring system to evaluate schedule quality:

```typescript
weights = {
  totalLength: 1,          // Importance of scheduling all classes
  gradeGroupCohesion: 0.5, // How well classes in same grade are grouped
  distributionQuality: 0.3, // Even distribution across available days
  constraintViolations: -100, // Heavy penalty for breaking hard constraints
  partialConflictPenalty: 0   // No penalty for partial conflicts
}
```

#### Core Algorithm
```typescript
class SimulatedAnnealing {
  public optimize(schedule: Schedule): Schedule {
    let currentSolution = schedule.clone()
    let currentScore = this.calculateWeightedScore(currentSolution)
    let temperature = this.config.initialTemperature

    while (temperature > this.config.minTemperature) {
      for (let i = 0; i < this.config.iterationsPerTemp; i++) {
        const neighbor = this.generateNeighbor(currentSolution)
        const neighborScore = this.calculateWeightedScore(neighbor)

        if (this.acceptSolution(currentScore, neighborScore, temperature)) {
          currentSolution = neighbor
          currentScore = neighborScore
        }

        if (neighborScore > this.bestScore) {
          this.bestSolution = neighbor.clone()
          this.bestScore = neighborScore
        }
      }

      temperature *= this.config.coolingRate
    }

    return this.bestSolution
  }
}
```

#### Neighbor Generation
```typescript
class SimulatedAnnealing {
  private generateNeighbor(schedule: Schedule): Schedule {
    const neighbor = schedule.clone()
    const completionRate = schedule.getScheduledClassCount() / schedule.getTotalClassCount()
    
    // Adaptive probability based on completion rate
    const addUnscheduledProb = Math.min(0.9, 0.6 + (1 - completionRate) * 0.5)
    
    if (Math.random() < addUnscheduledProb) {
      this.addUnscheduledClass(neighbor)
    } else {
      this.shakeSchedule(neighbor)
    }

    return neighbor
  }

  private shakeSchedule(schedule: Schedule): void {
    const numToRemove = Math.max(2, Math.floor(schedule.classes.length * 0.2))
    const classesToRemove = [...schedule.classes]
      .sort(() => Math.random() - 0.5)
      .slice(0, numToRemove)
    
    classesToRemove.forEach(cls => schedule.removeClass(cls))
  }
}
```

### 2. Simulated Annealing Implementation

#### Configuration
```typescript
interface SimulatedAnnealingConfig {
  initialTemperature: number
  coolingRate: number
  minTemperature: number
  iterationsPerTemp: number
  maxRestarts: number
}
```

#### Initial Solution Generation

The initial schedule is generated using a probabilistic approach:

1. **Class Placement**
   - Randomly shuffles available dates and periods
   - Uses 99% acceptance rate for valid slots
   - Strictly enforces total conflict constraints
   - Ignores partial conflicts for flexibility

2. **Slot Selection**
   ```typescript
   if (!hasTotalConflict) {
     if (Math.random() < 0.99) {
       // Schedule the class in this slot
     }
   }
   ```

### 2. Constraint System

#### Constraint Types
```typescript
interface Constraint {
  id: string
  type: 'HARD' | 'SOFT'
  weight: number
  validate(schedule: Schedule): boolean
  score(schedule: Schedule): number
  getAffectedPeriods(schedule: Schedule): Period[]
  getDependentConstraints(): Constraint[]
}

class TeacherConflictConstraint implements Constraint {
  id = 'teacher_conflict'
  type = 'HARD'
  weight = 1000

  validate(schedule: Schedule): boolean {
    return schedule.periods.every(period => {
      const teachers = new Set()
      for (const classId of period.assignedClasses) {
        const teacher = schedule.classes.get(classId).classInfo.teacher
        if (teachers.has(teacher)) return false
        teachers.add(teacher)
      }
      return true
    })
  }

  score(schedule: Schedule): number {
    let conflicts = 0
    schedule.periods.forEach(period => {
      const teachers = new Map<string, number>()
      period.assignedClasses.forEach(classId => {
        const teacher = schedule.classes.get(classId).classInfo.teacher
        teachers.set(teacher, (teachers.get(teacher) || 0) + 1)
      })
      teachers.forEach(count => {
        if (count > 1) conflicts += count - 1
      })
    })
    return Math.max(0, 1 - (conflicts * this.weight))
  }

  getAffectedPeriods(schedule: Schedule): Period[] {
    return schedule.periods.filter(period => {
      const teachers = new Set()
      for (const classId of period.assignedClasses) {
        const teacher = schedule.classes.get(classId).classInfo.teacher
        if (teachers.has(teacher)) return true
        teachers.add(teacher)
      }
      return false
    })
  }

  getDependentConstraints(): Constraint[] {
    return [] // No dependent constraints
  }
}

class RoomCapacityConstraint implements Constraint {
  id = 'room_capacity'
  type = 'HARD'
  weight = 800

  constructor(private roomCapacities: Map<string, number>) {}

  validate(schedule: Schedule): boolean {
    return schedule.periods.every(period => {
      const rooms = new Map<string, number>()
      for (const classId of period.assignedClasses) {
        const room = schedule.classes.get(classId).classInfo.room
        const currentCount = rooms.get(room) || 0
        if (currentCount >= this.roomCapacities.get(room)!) return false
        rooms.set(room, currentCount + 1)
      }
      return true
    })
  }

  score(schedule: Schedule): number {
    let overages = 0
    schedule.periods.forEach(period => {
      const rooms = new Map<string, number>()
      period.assignedClasses.forEach(classId => {
        const room = schedule.classes.get(classId).classInfo.room
        const count = (rooms.get(room) || 0) + 1
        rooms.set(room, count)
        if (count > this.roomCapacities.get(room)!) {
          overages += count - this.roomCapacities.get(room)!
        }
      })
    })
    return Math.max(0, 1 - (overages * this.weight))
  }

  getAffectedPeriods(schedule: Schedule): Period[] {
    return schedule.periods.filter(period => {
      const rooms = new Map<string, number>()
      for (const classId of period.assignedClasses) {
        const room = schedule.classes.get(classId).classInfo.room
        const count = (rooms.get(room) || 0) + 1
        if (count > this.roomCapacities.get(room)!) return true
        rooms.set(room, count)
      }
      return false
    })
  }

  getDependentConstraints(): Constraint[] {
    return [] // No dependent constraints
  }
}

interface ClassConflict {
  date: Date
  period: number
  type: 'total' | 'partial'
}

interface Class {
  id: string
  name: string
  teacher: string
  gradeLevel: string
  totalConflicts: ClassConflict[]
  partialConflicts: ClassConflict[]
}

class ClassConflictConstraint implements Constraint {
  id = 'class_conflict'
  type = 'HARD'
  weight = 1000

  validate(schedule: Schedule): boolean {
    return schedule.classes.every(cls => {
      const conflicts = cls.class.totalConflicts.filter(conflict =>
        conflict.date.getTime() === cls.date.getTime() &&
        conflict.period === cls.period
      )
      return conflicts.length === 0
    })
  }

  score(schedule: Schedule): number {
    let conflicts = 0
    schedule.classes.forEach(cls => {
      const conflicts = cls.class.totalConflicts.filter(conflict =>
        conflict.date.getTime() === cls.date.getTime() &&
        conflict.period === cls.period
      )
      conflicts += conflicts.length
    })
    return Math.max(0, 1 - (conflicts * this.weight))
  }

  getAffectedPeriods(schedule: Schedule): Period[] {
    return schedule.periods.filter(period => {
      const classes = period.assignedClasses.map(classId => schedule.classes.get(classId)!)
      return classes.some(cls => cls.class.totalConflicts.some(conflict =>
        conflict.date.getTime() === cls.date.getTime() &&
        conflict.period === cls.period
      ))
    })
  }

  getDependentConstraints(): Constraint[] {
    return [] // No dependent constraints
  }
}

class ClassPartialConflictConstraint implements Constraint {
  id = 'class_partial_conflict'
  type = 'SOFT'
  weight = 500

  validate(schedule: Schedule): boolean {
    return schedule.classes.every(cls => {
      const conflicts = cls.class.partialConflicts.filter(conflict =>
        conflict.date.getTime() === cls.date.getTime() &&
        conflict.period === cls.period
      )
      return conflicts.length === 0
    })
  }

  score(schedule: Schedule): number {
    let conflicts = 0
    schedule.classes.forEach(cls => {
      const conflicts = cls.class.partialConflicts.filter(conflict =>
        conflict.date.getTime() === cls.date.getTime() &&
        conflict.period === cls.period
      )
      conflicts += conflicts.length
    })
    return Math.max(0, 1 - (conflicts * this.weight))
  }

  getAffectedPeriods(schedule: Schedule): Period[] {
    return schedule.periods.filter(period => {
      const classes = period.assignedClasses.map(classId => schedule.classes.get(classId)!)
      return classes.some(cls => cls.class.partialConflicts.some(conflict =>
        conflict.date.getTime() === cls.date.getTime() &&
        conflict.period === cls.period
      ))
    })
  }

  getDependentConstraints(): Constraint[] {
    return [] // No dependent constraints
  }
}
```

#### Constraint Validation System
```typescript
class ConstraintValidator {
  private constraints: Map<string, Constraint>
  private validationCache: Map<string, boolean>
  private dependencyGraph: Map<string, Set<string>>

  constructor(constraints: Constraint[]) {
    this.constraints = new Map(
      constraints.map(c => [c.id, c])
    )
    this.buildDependencyGraph()
  }

  validateAll(schedule: Schedule): boolean {
    return Array.from(this.constraints.values())
      .filter(c => c.type === 'HARD')
      .every(c => this.validateConstraint(schedule, c))
  }

  validateIncremental(schedule: Schedule, change: ScheduleChange): boolean {
    const affectedConstraints = this.getAffectedConstraints(change)
    return affectedConstraints
      .filter(c => c.type === 'HARD')
      .every(c => this.validateConstraint(schedule, c))
  }

  private validateConstraint(
    schedule: Schedule, 
    constraint: Constraint
  ): boolean {
    const cacheKey = this.getCacheKey(schedule, constraint)
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!
    }

    const result = constraint.validate(schedule)
    this.validationCache.set(cacheKey, result)
    return result
  }

  private getAffectedConstraints(change: ScheduleChange): Constraint[] {
    const directlyAffected = new Set<string>()
    
    // Find constraints directly affected by the change
    this.constraints.forEach(constraint => {
      const affectedPeriods = constraint.getAffectedPeriods(change.schedule)
      if (affectedPeriods.some(p => change.affectsPeriod(p))) {
        directlyAffected.add(constraint.id)
      }
    })

    // Add dependent constraints
    const allAffected = new Set<string>(directlyAffected)
    directlyAffected.forEach(id => {
      this.getDependentConstraints(id).forEach(depId => {
        allAffected.add(depId)
      })
    })

    return Array.from(allAffected)
      .map(id => this.constraints.get(id)!)
  }

  private buildDependencyGraph(): void {
    this.dependencyGraph = new Map()
    
    this.constraints.forEach(constraint => {
      const dependents = new Set<string>()
      constraint.getDependentConstraints().forEach(dep => {
        dependents.add(dep.id)
      })
      this.dependencyGraph.set(constraint.id, dependents)
    })
  }

  private getDependentConstraints(constraintId: string): Set<string> {
    const result = new Set<string>()
    const toProcess = [constraintId]
    
    while (toProcess.length > 0) {
      const current = toProcess.pop()!
      const dependents = this.dependencyGraph.get(current) || new Set()
      
      dependents.forEach(dep => {
        if (!result.has(dep)) {
          result.add(dep)
          toProcess.push(dep)
        }
      })
    }
    
    return result
  }

  private getCacheKey(schedule: Schedule, constraint: Constraint): string {
    return `${schedule.hash()}-${constraint.id}`
  }
}
```

### 3. Parallel Processing

#### Worker Communication
```typescript
interface WorkerMessage {
  type: 'START' | 'RESULT' | 'ERROR'
  payload: {
    schedule?: Schedule
    score?: number
    error?: string
  }
}

class ParallelScheduler {
  private workers: Worker[]
  private results: Map<number, Schedule>

  async generateSchedule(): Promise<Schedule> {
    const promises = this.workers.map(worker => 
      this.runWorker(worker)
    )
    
    const schedules = await Promise.all(promises)
    return this.selectBestSchedule(schedules)
  }
}
```

### 4. Grade Group System

#### Grade Group Management
```typescript
interface GradeGroup {
  id: string
  grades: string[]
  preferences: GradePreferences
  constraints: GradeConstraint[]
}

interface GradePreferences {
  keepGradesTogether: boolean
  progressionDirection: 'high-to-low' | 'low-to-high' | 'none'
  cohesionWeight: number
}

class GradeGroupManager {
  private groups: Map<string, GradeGroup>
  private groupScores: Map<string, number>

  validateGroupConstraints(schedule: Schedule): boolean {
    return Array.from(this.groups.values())
      .every(group => this.validateGroup(schedule, group))
  }

  scoreGroupCohesion(schedule: Schedule): number {
    return Array.from(this.groups.values())
      .reduce((score, group) => 
        score + this.calculateGroupCohesion(schedule, group), 0)
  }

  private calculateGroupCohesion(schedule: Schedule, group: GradeGroup): number {
    const classes = this.getGroupClasses(schedule, group)
    const periods = this.getGroupPeriods(classes)
    
    return this.evaluateCohesion(classes, periods, group.preferences)
  }

  private evaluateCohesion(
    classes: ScheduledClass[], 
    periods: Period[], 
    preferences: GradePreferences
  ): number {
    let score = 0
    
    if (preferences.keepGradesTogether) {
      score += this.evaluateGradeProximity(classes)
    }
    
    if (preferences.progressionDirection !== 'none') {
      score += this.evaluateProgression(classes, preferences.progressionDirection)
    }
    
    return score * preferences.cohesionWeight
  }
}
```

#### Grade Progression
```typescript
class GradeProgressionValidator {
  validateProgression(
    schedule: Schedule, 
    direction: 'high-to-low' | 'low-to-high'
  ): boolean {
    const sortedClasses = this.getSortedClasses(schedule)
    const periods = this.getPeriodsInOrder(schedule)
    
    return this.checkProgression(sortedClasses, periods, direction)
  }

  private checkProgression(
    classes: ScheduledClass[], 
    periods: Period[], 
    direction: 'high-to-low' | 'low-to-high'
  ): boolean {
    let lastGrade = direction === 'high-to-low' ? Infinity : -Infinity
    
    for (const period of periods) {
      const periodGrade = this.getPeriodAverageGrade(classes, period)
      
      if (direction === 'high-to-low' && periodGrade > lastGrade) {
        return false
      }
      if (direction === 'low-to-high' && periodGrade < lastGrade) {
        return false
      }
      
      lastGrade = periodGrade
    }
    
    return true
  }
}
```

## Implementation Patterns

### 1. Immutable State Management
- All schedule modifications create new instances
- Original schedule objects are never modified
- Enables efficient state tracking and undo/redo

### 2. Adaptive Parameters
- Temperature cooling rate adjusts based on progress
- Neighbor generation probability adapts to completion rate
- Shake operation intensity varies with schedule size

### 3. Performance Optimization
- Efficient schedule cloning
- Cached score calculations
- Minimal object creation in hot paths
- Smart constraint validation

## Current Performance Characteristics

### 1. Time Complexity
- Schedule Generation: O(n * m)
  * n = number of classes
  * m = number of available periods
- Score Calculation: O(n)
- Constraint Validation: O(n * log n)

### 2. Space Complexity
- Base Schedule: O(n)
- Working Memory: O(n * w)
  * w = number of workers
- Result Storage: O(n * r)
  * r = number of retained solutions

### 3. Optimization Scores
- Small schedules (3-15 classes): 92-98%
- Medium schedules (20-22 classes): 85-97%
- Large schedules (30+ classes): 73-74%

## Next Implementation Steps

### 1. Performance Improvements
- Implement incremental constraint validation
- Optimize memory usage in worker communication
- Add result caching for similar schedules

### 2. Feature Implementation
- Add UI components for schedule visualization
- Implement data persistence layer
- Create export/import functionality

### 3. Code Quality
- Add comprehensive error handling
- Improve logging and monitoring
- Enhance test coverage

### 4. Architecture
- Implement true worker threads
- Add schedule template system
- Create collaborative editing support
