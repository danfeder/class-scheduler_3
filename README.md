# Class Scheduler

An advanced class scheduling system using parallel processing and simulated annealing to generate optimal class schedules.

## Features

- Sophisticated scheduling algorithm with simulated annealing
- Parallel processing for improved solution quality
- Comprehensive constraint handling
  - Time slot conflicts
  - Room availability
  - Teacher availability
  - Grade level progression
  - Consecutive period limits
- Configurable scheduling preferences
- Grade group cohesion optimization
- Adaptive scheduling parameters
- Score-based optimization (completeness, cohesion, distribution)

## Project Status

Core algorithm implementation complete. Moving to application development phase:

### Completed
- Base scheduling engine with constraint validation
- Simulated annealing implementation with 70-97% optimization scores
- Parallel processing framework
- Comprehensive test suite
- Score-based optimization system

### In Progress
- User interface development
- Schedule visualization
- Data persistence layer

### Planned
- Manual schedule adjustments
- Export and sharing capabilities
- Schedule templates
- User preferences system

## Architecture

The system consists of three main components:

1. **ScheduleEngine**: Core scheduling logic with constraint handling
2. **SimulatedAnnealingScheduler**: Advanced optimization using simulated annealing
   - Adaptive temperature control
   - Multi-objective optimization
   - Configurable weights for different objectives
3. **ParallelScheduler**: Parallel processing for improved solutions

### Key Files

- `/src/utils/scheduleEngine.ts`: Base scheduling implementation
- `/src/utils/simulatedAnnealing.ts`: Simulated annealing optimizer
- `/src/utils/parallelScheduler.ts`: Parallel processing coordinator
- `/src/__tests__/`: Comprehensive test suite

## Development

### Prerequisites

- Node.js
- TypeScript
- Jest for testing

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests:
   ```bash
   npm test
   ```

### Algorithm Performance

The scheduling algorithm achieves the following optimization scores:
- Small schedules (3-15 classes): 92-98% optimization
- Medium schedules (20-22 classes): 85-97% optimization
- Large schedules (30+ classes): 73-74% optimization

Optimization considers:
- Schedule completeness (40%)
- Grade group cohesion (30%)
- Class distribution (30%)

## Testing

Run the test suite:

```bash
npm test
```

Test coverage includes:
- Unit tests for core components
- Integration tests for scheduling workflows
- Performance benchmarks
- Constraint validation

## Contributing

Currently in active development. Contributions welcome for:

- User interface components
- Additional scheduling features
- Performance optimization
- Documentation
- User experience improvements

## License

[Add appropriate license]

## Acknowledgments

- Built with React + TypeScript + Vite
- Uses Jest for testing
- Implements simulated annealing algorithm
