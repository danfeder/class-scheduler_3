# Project Documentation Directory Index

## Documentation Structure

### Core Documentation
- `README.md`: Project overview, setup instructions, and basic usage
- `AI_RULES_AND_GUIDELINES.md`: Guidelines for AI development and interaction
- `docs/system_overview.md`: Comprehensive functional overview of the system
- `docs/architecture_overview.md`: Technical architecture and design decisions
- `docs/technical_implementation.md`: Detailed implementation patterns and strategies
- `docs/performance_guide.md`: Performance optimization and monitoring
- `docs/testing_guide.md`: Testing strategy and guidelines
- `docs/ai_onboarding.md`: Detailed guide for onboarding new AI assistants
- `docs/directory_index.md`: This file - maps all documentation files

### Project Status
1. **Task Tracking**
   - `tasks.md`: Active, completed, blocked, and future tasks
   - Update: Before each development session
   - Purpose: Track task progress and dependencies

2. **Change Documentation**
   - `changelog.md`: All project changes and updates
   - Update: After each significant change
   - Purpose: Version history and change tracking

3. **Project Overview**
   - `project_summary.md`: High-level project status and architecture
   - Update: After major milestones or architectural changes
   - Purpose: Maintain current project overview

### Source Code (`/src/`)
1. **Core Components**
   - `types/`: Core type definitions
   - `engine/`: Scheduling logic
   - `constraints/`: Constraint system
   - `workers/`: Parallel processing

2. **Tests**
   - `__tests__/unit/`: Unit tests
   - `__tests__/integration/`: Integration tests
   - `__tests__/performance/`: Performance tests
   - `__tests__/fixtures/`: Test data and utilities

## Update Guidelines

### When to Update Each File

1. **For Code Changes:**
   - Update `changelog.md`
   - Update `technical_implementation.md` if patterns change
   - Update `performance_guide.md` if performance-related
   - Update `system_overview.md` if functionality changes

2. **For New Features:**
   - Update `README.md`
   - Update `project_summary.md`
   - Update `system_overview.md`
   - Update `technical_implementation.md`
   - Add/update relevant tests

3. **For Architecture Changes:**
   - Update `architecture_overview.md`
   - Update `project_summary.md`
   - Update `changelog.md`
   - Update affected documentation

4. **For Performance Changes:**
   - Update `performance_guide.md`
   - Update `changelog.md`
   - Update performance test suite

### Documentation Categories

1. **Entry Points**
   - Purpose: Quick project understanding
   - Files: README.md, directory_index.md
   - Update: Major changes
   - Audience: All developers

2. **System Understanding**
   - Purpose: Functional overview
   - Files: system_overview.md
   - Update: Feature changes
   - Audience: All developers

3. **Technical Details**
   - Purpose: Implementation details
   - Files: architecture_overview.md, technical_implementation.md
   - Update: Technical changes
   - Audience: Core developers

4. **Performance**
   - Purpose: Optimization guidance
   - Files: performance_guide.md
   - Update: Performance changes
   - Audience: Core developers

5. **Testing**
   - Purpose: Test strategy
   - Files: testing_guide.md
   - Update: Test changes
   - Audience: All developers

### File Dependencies

1. Core Dependencies:
   ```
   code change → changelog.md → project_summary.md → system_overview.md
   ```

2. Technical Dependencies:
   ```
   architecture change → architecture_overview.md → technical_implementation.md
   performance change → performance_guide.md → technical_implementation.md
   ```

3. Test Dependencies:
   ```
   test change → testing_guide.md → technical_implementation.md
   ```

### Most Frequently Updated
1. `changelog.md` - Every change
2. `tasks.md` - Every session
3. `performance_guide.md` - Performance changes
4. `project_summary.md` - Major updates

### Documentation Best Practices

1. **File Organization**
   - Keep related files together
   - Use consistent naming
   - Maintain clear hierarchy
   - Follow established structure

2. **Content Management**
   - Keep descriptions concise
   - Use consistent formatting
   - Include relevant examples
   - Maintain up-to-date status

3. **Updates**
   - Follow dependency order
   - Update all affected files
   - Maintain consistency
   - Keep cross-references valid

4. **Quality Control**
   - Verify file paths
   - Check cross-references
   - Validate code examples
   - Ensure accuracy
