# Epic 010: Allen's Temporal Relations - Brownfield Enhancement

## Epic Goal

Implement Allen's 13 fundamental temporal relations to provide a mathematically complete and mutually exclusive set of operations for determining relationships between any two time periods, enhancing Minuta's capability as a comprehensive time manipulation library.

## Epic Description

**Existing System Context:**

- Current relevant functionality: The library has `contains()` and `isSame()` for basic period comparison
- Technology stack: TypeScript, @vue/reactivity, functional API pattern
- Integration points: Operations module, Period type, existing comparison functions

**Enhancement Details:**

- What's being added: Complete implementation of Allen's 13 temporal relations (before, meets, overlaps, starts, during, finishes, equals, and their inverses)
- How it integrates: New operations in the operations module following existing functional patterns
- Success criteria: All 13 relations are implemented, tested, and documented with clear examples

## Background: Allen's Interval Algebra

James F. Allen proved that there are exactly 13 possible relationships between any two time intervals, and these relationships are:
- **Complete**: Any two periods must have exactly one of these relationships
- **Mutually Exclusive**: No two periods can have more than one relationship
- **Mathematically Fundamental**: These aren't arbitrary - they emerge from the mathematics of time

The 13 relations are:
1. `before` - A ends before B starts
2. `meets` - A ends exactly when B starts
3. `overlaps` - A starts before B, ends during B
4. `starts` - A and B start together, A ends first
5. `during` - A is fully contained in B
6. `finishes` - A starts after B, they end together
7. `equals` - A and B are the same interval
8. Plus their 6 inverses (after, metBy, overlappedBy, startedBy, contains, finishedBy)

## Stories

1. **Story 1: Core Allen Relations Operations**
   - Implement the 7 primary relations as individual operations in the operations module
   - Create comprehensive test suite covering all edge cases
   - Ensure performance optimization for common use cases

2. **Story 2: Inverse Relations Operations and Unified API**
   - Implement the 6 inverse relations as individual operations
   - Create a unified `relate()` operation that returns the specific relation
   - Add TypeScript types for all Allen relations

3. **Story 3: Documentation and Integration Examples**
   - Create comprehensive documentation with visual diagrams
   - Add practical examples for calendar/scheduling use cases
   - Update existing operations to leverage Allen relations where appropriate

## Compatibility Requirements

- [x] Existing APIs remain unchanged
- [x] Database schema changes are backward compatible (N/A - no DB changes)
- [x] UI changes follow existing patterns (N/A - operations only)
- [x] Performance impact is minimal

## Risk Mitigation

- **Primary Risk:** Confusion with existing `contains()` function which has similar but not identical semantics to Allen's `contains`
- **Mitigation:** Clear documentation explaining the difference, consider aliasing Allen's `contains` as `during` to match the original terminology
- **Rollback Plan:** New functions are additive - can be removed without affecting existing functionality

## Definition of Done

- [x] All stories completed with acceptance criteria met
- [x] Existing functionality verified through testing
- [x] Integration points working correctly
- [x] Documentation updated appropriately
- [x] No regression in existing features

## Technical Notes

### Proposed API Design

```typescript
// Individual operations (following existing pattern - all at top level)
before(adapter: Adapter, periodA: Period, periodB: Period): boolean
meets(adapter: Adapter, periodA: Period, periodB: Period): boolean
overlaps(adapter: Adapter, periodA: Period, periodB: Period): boolean
starts(adapter: Adapter, periodA: Period, periodB: Period): boolean
during(adapter: Adapter, periodA: Period, periodB: Period): boolean
finishes(adapter: Adapter, periodA: Period, periodB: Period): boolean
equals(adapter: Adapter, periodA: Period, periodB: Period): boolean

// Inverse relation operations
after(adapter: Adapter, periodA: Period, periodB: Period): boolean
metBy(adapter: Adapter, periodA: Period, periodB: Period): boolean
overlappedBy(adapter: Adapter, periodA: Period, periodB: Period): boolean
startedBy(adapter: Adapter, periodA: Period, periodB: Period): boolean
contains(adapter: Adapter, periodA: Period, periodB: Period): boolean  // Note: conflicts with existing
finishedBy(adapter: Adapter, periodA: Period, periodB: Period): boolean

// Unified relation operation
relate(adapter: Adapter, periodA: Period, periodB: Period): AllenRelation

// Type definition
type AllenRelation = 
  | 'before' | 'meets' | 'overlaps' | 'starts' | 'during' | 'finishes' | 'equals'
  | 'after' | 'metBy' | 'overlappedBy' | 'startedBy' | 'contains' | 'finishedBy'
```

### Implementation Notes

- All relations implemented as individual operations in `/operations` directory
- Each operation is a separate file for tree-shaking (e.g., `before.ts`, `meets.ts`)
- Exported from `operations/index.ts` and main `index.ts`
- Follows existing pattern: pure functions with temporal as first parameter

### Integration Considerations

- Existing `contains()` function checks if a date/period is within another period
- Allen's `contains` is the inverse of `during` - may need to handle naming carefully
- Can optimize existing operations using Allen relations internally

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-07-26 | 1.0 | Initial epic creation based on brainstorming session | Sarah (PO) |

## Story Manager Handoff

Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running TypeScript with @vue/reactivity
- Integration points: operations module, existing comparison functions (contains, isSame)
- Existing patterns to follow: functional API pattern with temporal as first parameter
- Critical compatibility requirements: Must not break existing contains() function
- Each story must include verification that existing functionality remains intact

The epic should maintain system integrity while delivering a mathematically complete set of temporal relation operations based on Allen's Interval Algebra.