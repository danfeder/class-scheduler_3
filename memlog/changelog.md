# ClassRotation Changelog

## [Unreleased]
### Added
- Project initialization
- Basic project structure
- AI guidelines and rules
- Memlog system setup
- Class Scheduler Development Log
- Enhanced simulated annealing test suite:
  - Added test for schedule optimization with unscheduled classes
  - Verified algorithm can successfully add unscheduled classes
  - Confirmed constraint enforcement during optimization
  - Added logging for optimization progress tracking
  - Test shows 100% scheduling success on small dataset (4 classes)
- Adaptive scoring weights system:
  - Dynamic weights based on completion rate
  - Increased focus on completeness when needed
  - Gradual transition to cohesion and distribution
- Schedule "shake" operation for escaping local optima
- Adaptive class scheduling attempts based on restart count

### Changed
- Improved simulated annealing test infrastructure:
  - Better Schedule object mocking
  - More comprehensive test scenarios
  - Enhanced type safety in test data
- Enhanced simulated annealing parameters:
  - Increased initial temperature to 3000
  - More aggressive initial cooling rate (0.99)
  - Increased iterations per temperature to 400
  - Doubled max restarts to 10
- Improved neighbor generation:
  - Adaptive probability for unscheduled classes
  - Up to 90% focus on unscheduled when needed
  - Smart class removal when stuck
- Enhanced class management:
  - More attempts after restarts
  - Improved swap and reschedule logic

### Fixed
- Type issues in simulated annealing tests:
  - Added missing Class interface properties
  - Fixed Schedule interface implementation
  - Corrected ScheduledClass type usage

### Removed

## 2024-11-23
### Added
- Documentation update entry to changelog

## 2024-11-22
### Added
- Enhanced UI components:
  - Improved grade group builder with better UX
  - Fixed settings tab rendering
  - Added proper form validation
  - Enhanced state management
- Updated type system:
  - Stricter typing for constraints
  - Better type definitions for preferences
  - Enhanced error handling types
  - Improved type safety throughout

### Changed
- Refactored preferences handling:
  - Simplified state management
  - Added proper storage integration
  - Improved initialization
- Enhanced form components:
  - Better validation feedback
  - Clearer UI organization
  - Improved error states

### Fixed
- Settings tab rendering issues
- Grade group builder state management
- Preferences initialization
- Type mismatches in components

## 2024-11-21
### Added
- Created new `scheduleEngine.ts` implementing advanced scheduling algorithm
  - Multiple candidate solution tracking
  - Sophisticated scoring system for schedule quality
  - Smart period selection with grade group cohesion
  - Backtracking capability
  - Comprehensive constraint handling

### Changed
- Enhanced consecutive period constraints:
  - Configurable maximum (1 or 2 periods)
  - Configurable break length (1 or 2 periods)
  - Runtime validation of settings
- Added flexible grade progression preferences:
  - Optional high-to-low or low-to-high progression
  - Can be disabled when not needed
  - Preserves grade group cohesion as primary factor
- Updated scoring system weights:
  - Grade group cohesion: 50x (primary)
  - Distribution quality: 30x
  - Grade progression: 10x (when enabled)
  - Total length: -2x
  - Constraint violations: -100x
- Replaced simple forward-filling approach with sophisticated backtracking algorithm
- Enhanced grade group handling with prioritization options
- Improved conflict handling to support both total and partial conflicts
- Updated `schedule.ts` to use new ScheduleEngine
  - Added wrapper function for backward compatibility
  - Enhanced logging for schedule generation analysis
  - Exposed additional utility functions

### Technical Details
- Added `ScheduleEngine` class with:
  - Score calculation for schedule quality metrics
  - Grade group cohesion optimization
  - Distribution quality measurements
  - Constraint violation tracking
  - Multiple solution path exploration
- Improved constraint validation in constructor
- Added type safety for consecutive period settings
- Enhanced scoring system with configurable progression
- Improved logging and debugging capabilities in schedule generation wrapper

## 2024-11-20
### Added
- Test infrastructure:
  - Jest configuration with TypeScript support
  - Test utility builders for test data generation
  - Comprehensive assertion utilities
  - Test data helpers for common scenarios
- Test coverage:
  - Basic constraint validation tests
  - Builder utility tests
  - Test helper validation
- Test scripts in package.json:
  - `npm test`
  - `npm test:watch`
  - `npm test:coverage`

### Changed
- Enhanced development workflow with test-driven approach
- Improved code organization with builder pattern
- Updated project structure for testing

### Fixed
- TypeScript configuration for Jest
- Test utility imports
- Test file organization

## 2024-01-22
### Added
- Created `docs/directory_index.md` to track all documentation files and their update requirements
- Added comprehensive documentation update guidelines and dependency chains
- Added file maintenance rules and quick reference guides

### Changed
- Updated project documentation structure to follow new directory index guidelines
- Improved documentation organization and tracking system
- Enhanced simulated annealing implementation:
  - Added restart mechanism for stuck states
  - Improved temperature parameters:
    * Increased initial temperature (2000)
    * Slower cooling rate (0.995)
    * Higher minimum temperature (0.1)
  - Enhanced mutation strategies:
    * Higher probability for adding unscheduled classes
    * Improved class swapping logic
  - Better scoring weights:
    * Normalized scores to 0-1 range
    * Increased completeness weight (2000)
    * Added cohesion (500) and distribution (300) weights

## 2024-01-10: Refined Scoring System and Added Test Coverage

### Changes Made
1. Added `scoreExistingSchedule()` method to `ScheduleEngine`
   - Enables scoring of predefined schedules
   - Separates scoring logic from schedule generation
   - Improves testability of scoring mechanism

2. Enhanced Scoring System Implementation
   - Grade Group Cohesion (Weight: 50)
     * Perfect (1.0): One grade group per day
     * Mixed (0.5): Two grade groups per day
     * Further penalties for more mixing
   - Distribution Quality (Weight: 30)
     * Perfect (1.0): Even distribution across days
     * Scores based on deviation from average
   - Grade Progression (Weight: 10)
     * Supports high-to-low or low-to-high preferences
     * Optional (weight = 0 if preference is 'none')
   - Total Length (Weight: -2)
     * Prefers shorter schedules
     * Minor tiebreaker in scoring
   - Constraint Violations (Weight: -100)
     * Heavily penalizes rule violations
     * Includes period limits and break requirements

3. Conflict Handling Integration
   - Total Conflicts: 100% blocking
   - Partial Conflicts: 70% chance of blocking
   - Conflicts checked before scoring criteria

4. Updated Test Suite
   - All tests now use `scoreExistingSchedule()`
   - Comprehensive coverage of scoring scenarios
   - Improved test data setup with explicit dates/periods

### Technical Details
- Scoring weights chosen to prioritize:
  1. Constraint compliance (most important)
  2. Grade group cohesion
  3. Even distribution
  4. Grade progression (optional)
  5. Schedule length (tiebreaker)

### Files Changed
- `src/utils/scheduleEngine.ts`
- `src/__tests__/scoring.test.ts`
- `src/__tests__/utils/builders.ts`

### Next Steps
- Consider performance optimization for large schedules
- Add more edge case tests
- Explore machine learning possibilities for weight optimization

## Class Scheduler Development Log

### Current Status (As of Last Session)
- Working on improving parallel scheduling algorithm
- Base implementation in place but not scheduling all classes
- Tests showing 28/50 classes scheduled

### Latest Changes (Current Session)

### Algorithm Improvements
1. Modified ScheduleEngine
   - Made `classes` field protected for derived class access
   - Increased MAX_ITERATIONS to 10000 and MAX_SOLUTIONS to 100
   - Enhanced `tryScheduleClass` to:
     - Try all available periods for each day
     - Use scoring to guide placement decisions
     - Skip weekends automatically

2. Enhanced SimulatedAnnealingScheduler
   - Improved neighbor generation to prioritize unscheduled classes
   - Added completeness weighting to solution scoring
   - Modified mutation strategies for better exploration

### Current Challenges
1. Still not scheduling all classes (22/50 unscheduled)
2. Solution quality not improving with more workers
3. Performance within limits but could be improved

### Next Steps
1. Test the latest changes to verify improvement
2. If still not scheduling all classes:
   - Review scoring thresholds in tryScheduleClass
   - Consider more aggressive mutation strategies
   - Look into backtracking when stuck

### Technical Details
- Location: Working in:
  - `/src/utils/scheduleEngine.ts`
  - `/src/utils/simulatedAnnealing.ts`
  - `/src/utils/parallelScheduler.ts`
- Last Changes:
  1. Made scheduling engine more thorough in trying periods
  2. Added scoring-guided placement
  3. Enhanced simulated annealing to focus on completing schedule

### Current Test Status
```
ParallelScheduler
  ✓ should generate valid schedule with parallel processing
  ✕ should handle large number of classes efficiently
  ✓ should maintain schedule quality with parallel processing
  ✓ should handle conflicts in parallel
  ✓ should handle worker failures gracefully
  ✕ should improve solution quality with more workers
```

### NEXT SESSION START HERE
- Run tests with latest changes to verify improvements
- If still not scheduling all classes:
  1. Review and adjust scoring threshold in tryScheduleClass (currently -1000)
  2. Consider more aggressive temperature and cooling parameters
  3. Look into adding restart mechanism when stuck
  4. May need to implement true worker threads for better parallelization

### Environment Context
- Node.js/TypeScript
- Jest for testing
- Current focus on scheduling algorithm quality
- Performance is secondary to completeness

### Open Questions
1. Is the scoring threshold (-1000) appropriate?
2. Should we implement true worker threads now?
3. Do we need more sophisticated backtracking?

### Code Health
- Test coverage: ~90%
- Main areas needing improvement:
  - scheduleEngine.ts: 87.01%
  - simulatedAnnealing.ts: 96.29%
  - parallelScheduler.ts: 100%

## Documentation Updates (2024-11-23)

### Major Documentation Revisions
1. Updated system_overview.md:
   - Added current performance metrics for different schedule sizes
   - Updated optimization weights (40/30/30 split)
   - Enhanced parallel processing documentation
   - Added detailed Worker System Architecture section

2. Updated technical_implementation.md:
   - Updated schedule interface with current methods
   - Added weighted score calculation details
   - Restored detailed constraint system implementation
   - Added grade group system and progression validation

3. Updated performance_guide.md:
   - Updated current and target performance metrics
   - Added optimization strategies
   - Restored constraint validation examples
   - Enhanced profiling tools documentation

### Key Changes
- Preserved historical implementation context
- Added comprehensive parallel processing details
- Updated performance characteristics
- Enhanced documentation organization

### Performance Metrics
- Small schedules (3-15 classes): 92-98% optimization
- Medium schedules (20-22 classes): 85-97% optimization
- Large schedules (30+ classes): 73-74% optimization

### Next Steps
- Begin UI component development
- Implement data persistence layer
- Create schedule visualization
- Enhance worker thread implementation
