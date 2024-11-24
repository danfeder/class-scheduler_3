# AI Assistant Onboarding Guide

## Initial Prompt for New AI Assistants

Please help me continue development on the ClassRotation scheduling system. To understand the project:

1. **Start with the Documentation Map**:
   - **`/docs/directory_index.md`**: This is your primary navigation tool. It contains:
     - Complete documentation structure
     - Documentation guidelines
     - File dependencies and relationships
     - Documentation categories and purposes

2. **Then read these core documentation files in order**:
   - **`/docs/system_overview.md`**: Understand the system's purpose, inputs, outputs, and key features
   - **`/docs/architecture_overview.md`**: Learn the technical reasoning behind our architectural choices
   - **`/docs/technical_implementation.md`**: Detailed implementation patterns and strategies
   - **`/docs/performance_guide.md`**: Performance considerations and optimization strategies

3. **Then, examine these core implementation files**:
   - **`/src/types/index.ts`**: Core type definitions
   - **`/src/scheduleEngine.ts`**: Base scheduling logic
   - **`/src/simulatedAnnealing.ts`**: Optimization algorithm
   - **`/src/parallelScheduler.ts`**: Parallel processing implementation

4. **Review the testing documentation and infrastructure**:
   - **`/docs/testing_guide.md`**: Comprehensive testing strategy
   - **`/src/__tests__/simulatedAnnealing.test.ts`**: Current test scenarios
   - **`/src/__tests__/scheduleEngine.test.ts`**: Core logic validation

5. **Finally, check recent changes**:
   - **`/project_summary.md`**: Current project status

## Key Areas to Focus On

1. **Algorithm Understanding**
   - **Simulated Annealing Implementation**:
     - Temperature management
     - Cooling schedules
     - Acceptance probabilities
   - **Mutation Strategies**:
     - Single class moves
     - Class swaps
     - Grade group operations
   - **Scoring System**:
     - Component weights
     - Score calculation
     - Performance impact

2. **Constraint System**
   - **Hard Constraints**:
     - Teacher conflicts
     - Room availability
     - Period limits
   - **Soft Constraints**:
     - Grade cohesion
     - Distribution quality
     - Teacher preferences
   - **Validation Strategies**:
     - Incremental validation
     - Caching mechanisms
     - Performance optimization
   - **Class-Specific Conflicts**:
     - Total Conflicts (Hard Constraints):
       * Periods where classes absolutely cannot be scheduled
       * Includes teacher unavailability
       * Must be strictly enforced
     - Partial Conflicts (Soft Constraints):
       * Periods where scheduling is discouraged
       * 70% probability of causing a conflict
       * Affects schedule scoring
     - Implementation Details:
       * Conflicts are stored per-class
       * Each conflict specifies date, period, and type
       * Validation occurs in scheduleEngine.ts
   - **Conflict Resolution**:
     - Total conflicts are never violated
     - Partial conflicts use probabilistic acceptance
     - Scoring penalties for partial conflict scheduling
     - Complex scenarios with overlapping conflicts
   - **Performance Considerations**:
     - Efficient conflict checking
     - Caching of conflict validation results
     - Optimized date comparisons

3. **Performance Optimization**
   - **Current Metrics**:
     - **Large Schedules (30+ classes)**: 73-74% optimization rate
     - **Test Suite Execution Time**: ~350 seconds
     - **Memory Usage**: ~200MB peak
   - **Target Metrics**:
     - **Large Schedules (30+ classes)**: 95% optimization rate
     - **Test Suite Execution Time**: < 100 seconds
     - **Memory Usage**: < 150MB peak
   - **Optimization Strategies**:
     - Constraint validation improvements
     - Memory pooling
     - Worker coordination
     - Shared memory usage

4. **Documentation Categories**

   - **Entry Points**:
     - **Purpose**: Quick project understanding
     - **Update**: Major changes
     - **Examples**: `README.md`, `directory_index.md`

   - **System Understanding**:
     - **Purpose**: Functional overview
     - **Update**: Feature changes
     - **Examples**: `system_overview.md`

   - **Architecture & Design**:
     - **Purpose**: Technical decisions
     - **Update**: Design changes
     - **Examples**: `architecture_overview.md`

   - **Technical Implementation**:
     - **Purpose**: Code patterns
     - **Update**: Implementation changes
     - **Examples**: `technical_implementation.md`

   - **Testing & Quality**:
     - **Purpose**: Test strategy
     - **Update**: Test changes
     - **Examples**: `testing_guide.md`

   - **Performance**:
     - **Purpose**: Optimization
     - **Update**: Performance changes
     - **Examples**: `performance_guide.md`

## Development Guidelines

1. **Code Organization**

   ```typescript
   // Core scheduling components
   interface ScheduleEngine {
     schedule(): Promise<Schedule>;
     validate(schedule: Schedule): boolean;
     score(schedule: Schedule): number;
   }

   // Optimization strategy
   class SimulatedAnnealingScheduler implements ScheduleEngine {
     private temperature: number;
     private coolingRate: number;

     constructor(config: SchedulerConfig) {
       this.temperature = config.initialTemp;
       this.coolingRate = config.coolingRate;
     }

     async schedule(): Promise<Schedule> {
       // Implementation
     }
   }

   // Worker coordination
   interface WorkerMessage {
     type: 'START' | 'RESULT' | 'BEST_SOLUTION';
     payload: any;
   }
   ```

2. **Testing Strategy**

   ```typescript
   // Test suite organization
   describe('Schedule Generation', () => {
     // Unit tests
     describe('Constraint Validation', () => {
       it('should validate teacher conflicts', () => {
         // Test implementation
       });
     });

     // Integration tests
     describe('End-to-End Generation', () => {
       it('should generate valid schedule', async () => {
         // Test implementation
       });
     });

     // Performance tests
     describe('Performance', () => {
       it('should complete within time limit', () => {
         // Test implementation
       });
     });
   });
   ```

3. **Performance Considerations**

   - Use incremental validation where possible
   - Implement caching for expensive operations
   - Consider memory usage in worker communication
   - Profile and optimize hot paths

## Impact Analysis

When making changes, consider:

1. **Algorithm Impact**

   - How will changes affect scheduling success rate?
   - What's the impact on execution time?
   - Are there memory usage implications?
   - How does it affect solution quality?

2. **Code Quality Impact**

   - Does it maintain type safety?
   - Are tests comprehensive?
   - Is documentation updated?
   - Are performance metrics tracked?

3. **Maintenance Impact**

   - Is the change easy to understand?
   - Can it be easily modified?
   - Are dependencies minimal?
   - Is debugging straightforward?

## Common Pitfalls

1. **Performance**

   - O(n²) constraint validation
   - Excessive schedule copying
   - Poor worker communication
   - Memory leaks in long runs

2. **Algorithm**

   - Poor temperature management
   - Ineffective mutation strategies
   - Unbalanced scoring weights
   - Stuck in local optima

3. **Testing**

   - Incomplete test coverage
   - Slow test execution
   - Flaky tests
   - Missing edge cases
