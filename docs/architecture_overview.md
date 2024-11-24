# Architecture Overview

## System Architecture

### High-Level Components
```
Frontend (React/TypeScript)
└── Schedule Management
    ├── Class Input
    │   └── Conflict Management
    ├── Schedule Generation
    │   ├── Simulated Annealing Engine
    │   └── Parallel Workers
    └── Schedule Display
        └── Interactive Adjustments
```

## Core Algorithm Selection

### 1. Simulated Annealing

#### Decision Context
Need to solve complex scheduling problem with multiple competing constraints and preferences.

#### Why Simulated Annealing?
- Natural fit for schedule optimization
- Good balance of exploration and exploitation
- Flexible constraint handling
- Efficient mutation operations
- Parallelizable algorithm

#### Alternatives Considered

1. **Constraint Programming**
   - ✅ Guaranteed optimal solution
   - ✅ Clear constraint expression
   - ❌ Poor scaling with problem size
   - ❌ Too slow for real-world class sizes
   - ❌ Complex implementation

2. **Genetic Algorithms**
   - ✅ Good at global optimization
   - ✅ Natural parallelization
   - ❌ Complex chromosome representation
   - ❌ Harder to incorporate domain knowledge
   - ❌ Difficult constraint handling

3. **Simulated Annealing (Chosen)**
   - ✅ Natural schedule mutations
   - ✅ Easy constraint incorporation
   - ✅ Simple to implement and understand
   - ✅ Good performance in prototypes
   - ❌ No guarantee of optimal solution
   - ❌ Requires parameter tuning

#### Implementation Strategy
```typescript
class SimulatedAnnealingScheduler {
  // Core algorithm components
  temperature: Temperature
  mutationManager: MutationManager
  constraintValidator: ConstraintValidator
  scoreCalculator: ScoreCalculator
  
  // Optimization parameters
  initialTemp: number
  coolingRate: number
  iterationsPerTemp: number
  minTemp: number
  
  // Execution strategy
  async schedule(): Promise<Schedule> {
    let current = this.generateInitialSchedule()
    let best = current
    
    while (!this.isTerminated()) {
      // Multiple iterations at each temperature
      for (let i = 0; i < this.iterationsPerTemp; i++) {
        const neighbor = this.mutationManager.mutate(current)
        if (this.shouldAccept(current, neighbor)) {
          current = neighbor
          if (current.score > best.score) {
            best = current
          }
        }
      }
      this.temperature.cool()
    }
    
    return best
  }
}
```

### 2. Parallel Processing

#### Decision Context
Need to improve performance for large schedules and enable multiple concurrent optimization attempts.

#### Why Worker Threads?
- Lightweight threading model
- Shared memory capabilities
- Good for CPU-bound tasks
- Easy coordination

#### Implementation Strategy
```typescript
class ParallelScheduler {
  private workers: Worker[]
  private results: Map<number, Schedule>
  
  async schedule(): Promise<Schedule> {
    // Launch multiple workers with different:
    // - Starting temperatures
    // - Mutation probabilities
    // - Initial schedules
    this.initializeWorkers()
    
    // Collect and combine results
    const results = await this.gatherResults()
    return this.selectBestSchedule(results)
  }
}
```

## Core Design Patterns

### 1. Type System Architecture
```typescript
// Core types with strict hierarchies
interface BaseSchedule {
  classes: Class[]
  periods: Period[]
}

interface PartialSchedule extends BaseSchedule {
  unscheduledClasses: Class[]
  score?: number
}

interface CompleteSchedule extends BaseSchedule {
  score: number
  metrics: ScheduleMetrics
}

// Strategy pattern for mutations
interface MutationStrategy {
  apply(schedule: Schedule): Schedule
  probability: number
}

// Composite pattern for constraints
interface Constraint {
  validate(schedule: Schedule): boolean
  score(schedule: Schedule): number
}
```

### 2. Grade Group Design
Grade groups are first-class concepts with dedicated:
- Type definitions
- Mutation strategies
- Scoring components
- Visualization support

### 3. Constraint System
Flexible constraint system supporting:
- Hard vs soft constraints
- Complex relationships
- Custom scoring
- Efficient validation

## Technical Evolution

### 1. Current Technical Debt

#### Constraint Validation Performance
- **Issue**: O(n²) validation in some cases
- **Impact**: Slows down large schedules
- **Plan**: Implement incremental validation
- **Status**: Planned for next sprint

#### Worker Communication
- **Issue**: Basic message passing
- **Impact**: Not utilizing shared memory
- **Plan**: Implement SharedArrayBuffer
- **Status**: Under investigation

#### Test Data Generation
- **Issue**: Manual test data
- **Impact**: Limited test scenarios
- **Plan**: Implement procedural generation
- **Status**: In progress

### 2. Future Technical Directions

#### Machine Learning Integration
- Parameter optimization
- Starting point prediction
- Mutation guidance
- Constraint weight learning

#### Advanced Parallelization
- SharedArrayBuffer implementation
- Dynamic work distribution
- Result aggregation strategies
- Load balancing

#### UI/UX Improvements
- Interactive adjustments
- Real-time feedback
- Comparison tools
- Visualization enhancements

## Performance Considerations

### Current Metrics
- 50 classes: 56% success rate
- Test suite: ~350 seconds
- Memory usage: ~200MB peak

### Target Metrics
- 50 classes: 95% success rate
- Test suite: < 100 seconds
- Memory usage: < 150MB peak

### Performance Patterns
1. **CPU Usage**
   - Constraint checking: 45%
   - Schedule mutation: 30%
   - Score calculation: 15%
   - Other: 10%

2. **Memory Patterns**
   - Peaks during mutations
   - Worker communication overhead
   - Schedule representation impact

## Key Implementation Insights

### 1. Mutation Strategies
- Single-class moves often insufficient
- Grade-group moves more effective
- Need mutation variety
- Temperature-dependent selection

### 2. Temperature Management
- Initial temperature critical
- Slow cooling more effective
- Multiple restarts beneficial
- Adaptive cooling helps

### 3. Constraint Handling
- Balance between hard/soft
- Careful weight tuning needed
- Grade cohesion important
- Incremental validation key

### 4. Parallel Processing
- Worker coordination overhead
- Result aggregation strategy
- Memory sharing benefits
- Load balancing impact
