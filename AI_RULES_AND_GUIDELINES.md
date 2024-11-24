# AI Rules and Guidelines for ClassRotation Development

This document outlines the rules, best practices, and guidelines that AI must follow when assisting with the development of the ClassRotation project.

## 1. Algorithm Development and Optimization

- Always consider the impact on total rotation length when making algorithm changes
- Document scheduling decisions and trade-offs made by the algorithm
- Track algorithm performance metrics and optimization attempts
- Maintain multiple solution approaches for comparison
- Document any assumptions made about scheduling preferences
- Test with various constraint combinations to ensure robustness

## 2. Constraint Management

- Clearly separate hard constraints from soft constraints
- Document the priority order of constraints
- Track the impact of each constraint on schedule quality
- Provide clear explanations for constraint violations
- Maintain flexibility for future constraint additions
- Test edge cases for each constraint type

## 3. Grade Group Management

- Document all grade grouping decisions and changes
- Track group scheduling preferences and their impact
- Maintain flexibility for group configuration changes
- Test group scheduling with various class combinations
- Document group conflict resolution strategies

## 4. User Interface Guidelines

- Prioritize clarity in schedule visualization
- Provide clear feedback for scheduling decisions
- Make constraint violations visually obvious
- Enable intuitive manual schedule adjustments
- Support clear visualization of grade groups
- Maintain consistent interaction patterns for scheduling operations

## 5. Project Documentation
- Follow the documentation structure in directory_index.md
- Keep documentation up to date with all changes
- Update changelog.md for all significant changes
- Track tasks and progress in tasks.md
- Document performance metrics and improvements
- Follow established documentation guidelines

## 6. Task Breakdown and Execution

- Break down all user instructions into clear, numbered steps
- Include both actions and reasoning for each step
- Flag potential issues before they arise
- Verify the completion of each step before proceeding to the next
- If errors occur, document them, return to previous steps, and retry as needed

## 7. Code Structure and Organization

- Keep files small and modular
- Split large components into smaller, manageable parts
- Move constants, configurations, and long strings to separate files
- Use descriptive names for files, functions, and variables
- Document all file dependencies and maintain a clean project structure

## 8. Error Handling and Reporting

- Implement detailed and actionable error reporting
- Log errors with context and timestamps
- Provide users with clear steps for error recovery
- Track error history to identify patterns
- Implement escalation procedures for unresolved issues
- Ensure all systems have robust error handling mechanisms

## 9. Dependencies and Libraries

- Always use the most stable versions of dependencies to ensure compatibility
- Regularly update libraries, avoiding changes that might disrupt functionality

## 10. Code Documentation

- Write clear, concise comments for all sections of code
- Use only one set of triple quotes for docstrings to prevent syntax errors
- Document the purpose and expected behavior of functions and modules

## 11. Change Management

- Review all changes to assess their impact on other parts of the project
- Test changes thoroughly to ensure consistency and prevent conflicts
- Document all changes, their outcomes, and any corrective actions in the changelog

## 12. Problem-Solving Approach

- Exhaust all options before determining an action is impossible
- When evaluating feasibility, check alternatives in all directions: up/down and left/right
- Only conclude an action cannot be performed after all possibilities have been tested

## 13. Testing and Quality Assurance

- Test scheduling algorithm with various class combinations
- Validate constraint enforcement
- Test grade group scheduling scenarios
- Verify manual scheduling operations
- Document test scenarios and results
- Maintain test cases for known edge cases

## 14. Performance Optimization

- Optimize scheduling algorithm efficiency
- Implement caching for computed schedules
- Minimize unnecessary re-computations
- Profile algorithm performance regularly
- Track and optimize memory usage during schedule generation
- Benchmark different scheduling approaches

## 15. Security Best Practices

- Validate all user inputs for scheduling constraints
- Ensure schedule data integrity
- Implement proper error boundaries to prevent UI crashes
- Maintain data consistency during manual schedule adjustments

## 16. Documentation

- Maintain clear documentation of the scheduling algorithm
- Document all constraints and their interactions
- Provide clear guides for manual scheduling operations
- Keep grade group configuration documentation current
- Document known scheduling limitations and workarounds

Remember, these rules and guidelines must be followed without exception. Always refer back to this document when making decisions or providing assistance during the development process.