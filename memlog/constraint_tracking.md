# Constraint Tracking

## Active Constraints
### Hard Constraints
- Blackout periods
- Class conflicts
- Valid period range (1-8 per day)
- Consecutive period limits
  * Maximum consecutive periods (1 or 2)
  * Required break length (1 or 2 periods)

### Soft Constraints
- Maximum periods per day (must be ≤ 8)
- Maximum periods per week
- Grade group cohesion (primary)
- Optional grade progression
  * High-to-low or low-to-high
  * Can be disabled
- Distribution quality

## Constraint Impact Analysis
*Track how different constraints affect schedule quality*

## Constraint Violations
*Document and analyze constraint violations*

## Period Distribution
- Total periods per day: 8
- Valid period numbers: 1-8
- Typical scheduling window: Monday-Friday

## User Override Patterns
*Track when and why users override constraints*

## Future Constraints
*Document potential future constraints to consider*

## Current Constraints Implementation

### 2024-01-24: Enhanced Constraint System
#### Hard Constraints
1. Period Availability
   - 8 periods per day
   - Monday through Friday only
   - Blackout period checking
   - No double-booking periods

2. Consecutive Period Rules
   - Configurable maximum (1 or 2 periods)
   - Configurable break length (1 or 2 periods)
   - Runtime validation of settings
   - Tracked through checkConsecutivePeriods()
   - Strictly enforced during scheduling

3. Class Conflicts
   - Total conflicts (100% blocked)
   - Partial conflicts (70% chance of blocking)
   - Day and period specific

#### Soft Constraints
1. Grade Group Cohesion
   - Primary scheduling factor
   - 50x weight in scoring
   - Tracked per day
   - Affects period selection priority

2. Grade Progression (Optional)
   - Configurable direction preference
   - 10x weight when enabled
   - Only affects inter-group transitions
   - Preserves group cohesion priority

3. Distribution Quality
   - 30x weight in scoring
   - Variance-based calculation
   - Balanced across days and weeks

#### Constraint Weights in Scoring
- Constraint violations: -100 points
- Grade group cohesion: +50 points
- Distribution quality: +30 points
- Schedule length: -2 points per day

#### Constraint Validation
1. Runtime Checks
   - Constructor validation of consecutive period settings
   - Type safety through TypeScript
   - Early constraint violation detection

2. Performance Optimization
   - Early filtering of invalid periods
   - Cached constraint checks
   - Efficient violation tracking

#### Implementation Details
1. Constraint Checking
```typescript
if (
  periodsToday >= constraints.maxPeriodsPerDay ||
  periodsThisWeek >= constraints.maxPeriodsPerWeek ||
  isBlackoutPeriod(period, date) ||
  hasConflict(period, date, classToSchedule, scheduledClasses) ||
  checkConsecutivePeriods(period, date, scheduledClasses)
) {
  continue
}
```

2. Grade Group Priority
```typescript
if (dayHasMatchingGroup) {
  periods.unshift(period) // Higher priority
} else if (!dayHasDifferentGroup) {
  periods.push(period) // Lower priority
} else if (!preferences.preferSameGradeInDay) {
  periods.push(period) // If preference disabled
}
```

#### Monitoring Needs
1. Constraint Satisfaction
   - Track violation frequencies
   - Identify common override patterns
   - Monitor impact on schedule quality

2. Grade Group Impact
   - Success rate of group cohesion
   - Impact on schedule length
   - Trade-offs with other constraints

3. Performance Impact
   - Constraint checking overhead
   - Grade group calculation costs
   - Score calculation frequency
