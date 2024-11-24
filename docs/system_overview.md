# ClassRotation: Advanced Class Scheduling System

## Purpose & Goals
ClassRotation is designed to create optimized schedules for rotating classes through different periods and days. The system aims to:
1. Schedule all provided classes across available time slots
2. Manage scheduling constraints through class-specific unavailable periods
3. Optimize for grade-level grouping and progression
4. Ensure robust conflict resolution via total and partial conflicts
5. Support parallel processing for efficient schedule generation

## System Performance

### Schedule Optimization
The system achieves the following optimization scores:
- Small schedules (3-15 classes): 92-98% optimization
- Medium schedules (20-22 classes): 85-97% optimization
- Large schedules (30+ classes): 73-74% optimization

### Optimization Weights
Schedule quality is evaluated using three primary metrics:
1. Completeness (40%): Ratio of scheduled to total classes
2. Cohesion (30%): Grade group scheduling effectiveness
3. Distribution (30%): Even spread of classes across periods

## Input Components

### 1. Classes
Each class has:
- Class number and name
- Teacher name
- Grade level (Pre-K through 5th, or mixed)
- Scheduling Constraints:
  * Total Conflicts: Periods when the class absolutely cannot be scheduled (includes teacher unavailability)
  * Partial Conflicts: Periods when scheduling is discouraged (70% probability of conflict)
- Can be input manually or imported via JSON

### 2. Constraint System
The system manages scheduling through two primary constraint types:

#### Hard Constraints
- Classes cannot be scheduled during their specified total conflicts
- This includes teacher unavailability and other absolute restrictions
- Maximum periods per day and week limits are enforced

#### Soft Constraints
- Partial conflicts are handled probabilistically (70% chance of conflict)
- Grade group cohesion preferences
- Distribution preferences for even class spread

### 3. Grade Groups & Preferences
- Grade groups: Custom groupings of classes by grade level
- Preferences:
  * Whether to keep same grade levels together in a day
  * Grade progression preference (high-to-low, low-to-high, or none)
  * Grade group cohesion importance

### 4. Period Structure
- 8 possible periods per day
- 5 days per week (Monday-Friday)
- Support for blackout periods (globally blocked time slots)

## Scheduling Algorithm

The class scheduler uses a sophisticated algorithm designed to generate optimal schedules while respecting various constraints and preferences. Here's how it works:

### Core Components

1. **Schedule Engine**
   - Handles the core scheduling logic
   - Manages class assignments and conflict resolution
   - Calculates schedule scores based on multiple metrics

2. **Score Calculation**
   - Total Length: Ratio of scheduled classes to total classes
   - Grade Group Cohesion: Measures how well classes of the same grade group are scheduled together
   - Distribution Quality: Evaluates the spread of classes across available days
   - Constraint Violations: Heavily penalizes violations of hard constraints

### Conflict Resolution

The scheduler employs a two-tier conflict resolution system:

1. **Total Conflicts**
   - Strictly enforced - no classes can be scheduled in slots with total conflicts
   - Used for absolute scheduling constraints (e.g., teacher unavailability)
   - Highest priority in the scheduling process

2. **Partial Conflicts**
   - Flexibly handled - allowed but monitored
   - Used for soft constraints or preferences
   - Does not affect schedule score, allowing for more adaptable solutions

### Scheduling Strategy

The algorithm follows these steps:

1. **Initial Solution Generation**
   - Creates an initial schedule respecting total conflicts
   - Uses a high acceptance rate (99%) for valid slots
   - Employs randomization to explore diverse solutions

2. **Schedule Optimization**
   - Focuses on maximizing class distribution and cohesion
   - Maintains grade group relationships where possible
   - Balances class load across available days

3. **Solution Refinement**
   - Iteratively improves initial solutions
   - Uses simulated annealing for optimization
   - Accepts improvements based on overall schedule score

### Performance Characteristics

- Statement Coverage: ~96%
- Branch Coverage: ~82%
- Function Coverage: 100%
- Handles up to 100+ classes efficiently
- Quick generation of initial solutions
- Robust handling of complex constraints

### Best Practices

1. **Constraint Definition**
   - Define total conflicts for hard constraints
   - Use partial conflicts for flexible preferences
   - Keep constraints realistic and necessary

2. **Schedule Generation**
   - Start with essential constraints only
   - Add additional constraints incrementally
   - Monitor schedule quality after changes

3. **Performance Optimization**
   - Limit unnecessary constraints
   - Use appropriate time windows
   - Balance between quality and generation speed

### Configuration Options

The scheduler can be configured through:

1. **Schedule Constraints**
   - Maximum periods per day
   - Maximum classes per day
   - Maximum consecutive periods

2. **Schedule Preferences**
   - Grade group cohesion weights
   - Distribution quality preferences
   - Schedule length optimization

### Future Considerations

1. **Potential Enhancements**
   - Configurable conflict penalties
   - Advanced machine learning optimization
   - Real-time schedule adjustment capabilities

2. **Scalability Plans**
   - Enhanced performance for larger datasets
   - Distributed scheduling capabilities
   - Improved constraint handling mechanisms

### Monitoring and Maintenance

Regular monitoring of:
- Schedule generation times
- Constraint satisfaction rates
- Resource utilization
- User satisfaction metrics

## Processing & Optimization

### Core Algorithm
1. Base ScheduleEngine:
   - Handles constraint validation
   - Manages candidate solutions
   - Scores schedules based on multiple factors

2. Simulated Annealing:
   - Adaptive temperature control
   - Multi-objective optimization
   - Shake operation for escaping local optima
   - Removes 2-20% of classes during shake
   - Weighted scoring system

### **Future Development: Parallel Processing**
- Plan to implement multiple concurrent optimization attempts
- Utilize worker threads for parallel execution
- Develop inter-worker communication protocols
- Implement load balancing and resource optimization

### Worker System Architecture
1. Worker Pool Management:
   - Dynamic worker creation and termination
   - Resource-aware worker allocation
   - Worker health monitoring
   - Automatic worker recovery

2. Inter-Worker Communication:
   - SharedArrayBuffer for efficient data sharing
   - Atomic operations for synchronization
   - Message-based control flow
   - Result aggregation protocol

3. Work Distribution:
   - Dynamic load balancing
   - Work stealing algorithm
   - Priority-based scheduling
   - Resource utilization optimization

## Schedule Generation Process

1. Initial Schedule Creation:
   - Random initial class placement
   - Basic constraint validation
   - Initial score calculation

2. Optimization Phase:
   - Simulated annealing iterations
   - Temperature-based acceptance
   - Periodic schedule shaking
   - Best solution tracking

3. Solution Refinement:
   - Grade group cohesion improvement
   - Distribution balancing
   - Final constraint validation

## Output & Results

### Schedule Format
- Complete class assignments
- Period allocations
- Grade group distributions

### Quality Metrics
1. Completeness Score:
   - Percentage of scheduled classes
   - Distribution across periods

2. Cohesion Score:
   - Grade group integrity
   - Teacher schedule efficiency
   - Progression adherence

3. Distribution Score:
   - Period utilization balance
   - Daily class spread
   - Weekly distribution

## Next Development Steps

1. Constraint Validation Optimization:
   - Improve performance of schedule validation
   - Implement caching and incremental checks

2. User Interface Development:
   - Schedule visualization
   - Manual adjustment tools
   - Preference configuration

3. Data Management:
   - Persistence layer
   - Import/export functionality
   - Template system

4. Future Features:
   - Parallel processing implementation
   - Real-time schedule updates
   - Collaborative editing
   - Schedule versioning
