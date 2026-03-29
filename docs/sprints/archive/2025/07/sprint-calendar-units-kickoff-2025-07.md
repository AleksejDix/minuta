# Sprint Kickoff: Calendar Units Package Sprint - July 2025 (Team B)

## Sprint Overview
- **Sprint Name**: Calendar Units Package Sprint
- **Sprint Duration**: 3 days (2025-07-25 to 2025-07-29)
- **Sprint Goal**: Create minuta/calendar package with stableMonth support
- **Team**: Team B

## Mission Statement

We're creating a dedicated package for calendar-specific time units, starting with the highly-requested `stableMonth` unit that always returns a 6-week (42-day) grid for consistent calendar layouts.

## Sprint Scope

### Three Sequential Stories
1. **Story 004.01**: Calendar Package Setup (Day 1)
   - Create package infrastructure
   - Establish core integration
   - Set up testing framework

2. **Story 004.02**: Implement StableMonth Unit (Day 2)
   - Define unit using core's defineUnit API
   - Implement 42-day grid logic
   - Comprehensive testing

3. **Story 004.03**: Calendar Docs & Examples (Day 3)
   - API documentation
   - Migration guide
   - Framework examples (Vue, React, Vanilla)

## Context & Background

### Why This Sprint Matters
- StableMonth was removed from core to maintain minimalism
- Calendar developers need stable grids to prevent layout shifts
- This establishes the pattern for future calendar units

### Key Technical Details
- Package name: `minuta/calendar`
- Location: `/packages/calendar-units/`
- Peer dependency on `minuta`
- Uses core's unit registry system

## Quick Start Guide

### Day 1 Focus - Package Setup
1. Create package structure following monorepo patterns
2. Reference `/packages/adapter-luxon/` for structure
3. Key files to create:
   ```
   packages/calendar-units/
   ├── package.json
   ├── tsconfig.json
   ├── README.md
   └── src/
       ├── index.ts
       └── units/
   ```

### Integration Pattern
```typescript
// Using core's defineUnit API
import { defineUnit } from 'minuta';

defineUnit('stableMonth', {
  duration: { days: 42 },
  validate: (adapter, date) => true,
  // Custom divide logic here
});
```

### Testing Approach
- Test with all adapters (native, date-fns, luxon, temporal)
- Edge cases: February, leap years, different weekStartsOn
- Verify exactly 42 days for every month

## Success Criteria
✅ Package builds and publishes successfully  
✅ StableMonth always returns 42-day grid  
✅ Works with all core operations  
✅ Clear migration from manual workaround  
✅ Examples for major frameworks  

## Communication & Coordination
- Work independently from Team A (no dependencies)
- Update sprint tracking doc daily
- Flag blockers immediately
- PR ready by end of sprint

## Resources
- Architecture decision: `/docs/architecture/decision-calendar-units-separation.md`
- Existing workaround: `/vitepress/examples/stable-month-calendar.md`
- Unit registry docs: Core package documentation

## Daily Milestones
- **End of Day 1**: Package infrastructure complete, builds successfully
- **End of Day 2**: StableMonth fully implemented with tests
- **End of Day 3**: Documentation and examples complete

---

Let's deliver the most requested calendar feature and set the foundation for future calendar enhancements! 📅✨