# Epic 007: Tree-Shaking Architecture Refactor

## Epic Overview
**Title**: Refactor Architecture for Optimal Tree-Shaking and Bundle Size
**Status**: Proposed
**Priority**: Critical
**Epic Owner**: Architect Team Lead
**Sprint**: Pre-v2.0 Launch Preparation

## Epic Description
The current architecture uses global unit registries with side-effect imports that prevent effective tree-shaking. Users importing a single operation receive the entire 30KB bundle, even when they only need 5-7KB of code. This epic refactors the library to a pure functional architecture where bundle size grows proportionally with feature usage, while maintaining excellent developer experience through an optional convenience layer.

**Critical Timing**: Package is currently v2.0.0-alpha.1 and NOT published to npm. This is the ideal time for breaking changes before public release.

## Business Value
- **Bundle Size Reduction**: 76% reduction for minimal usage (30KB → 5-7KB)
- **Developer Experience**: Bundle size scales with actual feature usage
- **Market Differentiation**: Best-in-class tree-shaking among time libraries
- **Performance**: Faster page loads, especially for users with limited features
- **Future-Proofing**: Clean architecture enables easier maintenance and extensions
- **Competitive Edge**: Critical for adoption in performance-sensitive applications

## Current State Analysis

### Problem: Side-Effect Imports Kill Tree-Shaking

**Current index.ts:**
```typescript
import "./units/definitions";  // ← Executes defineUnit() calls (side effect)
import "./calendar";            // ← Registers calendar units (side effect)
```

**Impact on Bundle Size:**
- **Minimal usage**: 30KB (should be 5-7KB)
- **Tree-shaking score**: 2/10
- **Root cause**: Global mutable state (Map) populated on import
- **Package.json declares**: `"sideEffects": false` ← INCORRECT

### Current Architecture Pattern
```typescript
// Global registry (mutable state)
const unitRegistry = new Map<string, UnitDefinition>();

// Side effect on import
defineUnit("year", { period: ..., divisions: [...] });
defineUnit("month", { period: ..., mergesTo: "year" });
// ... 7 more units auto-registered

// Operations depend on global state
export function period(adapter: Adapter, date: Date, unit: Unit): Period {
  const unitDefinition = getUnitDefinition(type);  // ← Reads from global
  // ...
}
```

## Target Architecture: Pure Functional + Opt-In

### Three-Level API Design

**Level 1: Purist (Maximum Tree-Shaking)**
```typescript
// 5-7KB bundle - only what you use
import { divide, period } from 'minuta/operations';
import { createNativeAdapter } from 'minuta/native';

const adapter = createNativeAdapter({ weekStartsOn: 1 });
const year = period(adapter, new Date(), 'year');
const months = divide(adapter, year, 'month');
```

**Level 2: Builder (Balanced)**
```typescript
// 8-12KB bundle - convenience without bloat
import { createTemporal } from 'minuta';
import { nativeAdapter } from 'minuta/native';

const minuta = createTemporal({
  adapter: nativeAdapter,
  weekStartsOn: 1
});

const year = minuta.period(new Date(), 'year');
const months = minuta.divide(year, 'month');
```

**Level 3: Full DX (Current API, Tree-Shakable)**
```typescript
// 15-20KB bundle - all convenience features
import { createTemporal, usePeriod } from 'minuta';
import { nativeAdapter } from 'minuta/native';

const minuta = createTemporal({
  adapter: nativeAdapter,
  date: new Date()
});

const month = usePeriod(temporal, 'month');
```

### Architectural Changes

**1. Remove Global Registry**
- Eliminate `unitRegistry` Map entirely
- Operations become pure functions
- Adapter handles all unit definitions

**2. Adapter-Centric Units**
```typescript
// Adapters know their units
interface Adapter {
  startOf(date: Date, unit: AdapterUnit): Date;
  endOf(date: Date, unit: AdapterUnit): Date;
  add(date: Date, value: number, unit: AdapterUnit): Date;
  diff(start: Date, end: Date, unit: AdapterUnit): number;
  // NEW: Optional unit metadata
  units?: UnitDefinition[];
}
```

**3. Pure Operations**
```typescript
// Before: Depends on global state
export function period(adapter: Adapter, date: Date, unit: Unit): Period

// After: Explicit dependencies
export function period(adapter: Adapter, date: Date, unit: Unit): Period
```

**4. Calendar as Extension**
```typescript
// Separate entry point (opt-in)
import { stableMonth } from 'minuta/calendar';

const stable = stableMonth(adapter, date);
```

## Success Criteria

### Bundle Size Targets
- **Minimal usage** (period + divide + native): ≤ 7KB gzipped
- **Calendar usage**: ≤ 15KB gzipped
- **Full features**: ≤ 25KB gzipped (current: 30KB)

### Tree-Shaking Metrics
- **Score**: 9/10 or better (current: 2/10)
- **Unused operations**: 0KB in bundle
- **Dead code**: < 5% of imported code

### Developer Experience
- **Breaking changes**: Documented with migration guide
- **API levels**: All 3 levels working and documented
- **Examples**: Updated for all 3 API levels
- **Type safety**: Maintained or improved

### Quality Assurance
- **All tests pass**: 722/722 tests passing
- **Coverage maintained**: ≥ 87% (current: 87.08%)
- **No regressions**: All functionality preserved
- **Performance**: No degradation in operation speed

## Stories in this Epic

### Phase 1: Foundation (Breaking Changes)
- **Story 007.01**: Remove Global Unit Registry and Refactor to Pure Functions
  - Eliminate unitRegistry Map
  - Refactor operations to accept adapter directly
  - Update all operation signatures
  - Status: Proposed

### Phase 2: Modularization
- **Story 007.02**: Extract Calendar Units to Separate Entry Point
  - Move stableMonth, stableYear to separate package entry
  - Create minuta/calendar export
  - Update calendar-specific tests
  - Status: Proposed

- **Story 007.03**: Update Package Exports Structure for Tree-Shaking
  - Configure package.json exports map
  - Set correct sideEffects declarations
  - Create operation-level exports
  - Add bundle size validation
  - Status: Proposed

### Phase 3: Developer Experience
- **Story 007.04**: Create Tree-Shakable Builder/Convenience API
  - Implement builder pattern API (Level 2)
  - Maintain full DX API (Level 3)
  - Ensure both layers tree-shake properly
  - Status: Proposed

- **Story 007.05**: Update Documentation and Examples for New Architecture
  - Write migration guide from v1 to v2
  - Document all 3 API levels
  - Update Vue example
  - Create minimal usage examples
  - Status: Proposed

### Phase 4: Quality Assurance
- **Story 007.06**: Add Bundle Size Analysis and CI Monitoring
  - Set up bundle size tracking
  - Add size budgets to CI/CD
  - Create before/after comparisons
  - Document tree-shaking verification
  - Status: Proposed

## Technical Considerations

### Breaking Changes Required
1. **Operation signatures**: Add adapter parameter
2. **Unit definitions**: Move from global registry to adapter-managed
3. **Import paths**: New subpath exports (minuta/operations)
4. **Calendar separation**: No longer auto-imported

### Migration Strategy
- **Version**: 2.0.0 (alpha → stable, breaking changes acceptable)
- **Timing**: Pre-publication (currently not on npm)
- **Risk**: LOW - no existing users to migrate
- **Documentation**: Comprehensive migration guide for alpha testers

### Rollback Plan
- **Git branch**: Create `refactor/tree-shaking` branch
- **Baseline**: Tag current alpha as `v2.0.0-alpha.1-pre-refactor`
- **Validation**: Parallel test suite on old and new architecture
- **Rollback**: Git revert if tests fail or performance degrades

## Dependencies

### Technical Requirements
- **TypeScript**: 5.0+ for proper module resolution
- **Build tools**: Rollup/Vite with tree-shaking enabled
- **Node.js**: 18+ (current requirement)
- **Package managers**: npm/pnpm/yarn supporting exports field

### External Dependencies
- Date adapters remain unchanged (native, date-fns, luxon, temporal)
- @vue/reactivity remains unchanged
- Vitest testing framework remains unchanged

### Internal Dependencies
- Must complete Epic 005 (Test Architecture Enhancement) - ✅ DONE
- Must have stable test suite - ✅ 722 tests passing
- Documentation infrastructure - ✅ In place

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking changes alienate alpha testers | Medium | Medium | Comprehensive migration guide, support channel |
| Bundle size targets not met | High | Low | Validate with rollup-plugin-visualizer early |
| Performance regression | High | Low | Benchmark before/after, optimize hot paths |
| Type safety degradation | Medium | Low | Strict TypeScript checks, type tests |
| API complexity increases | Medium | Medium | Three-level approach lets users choose simplicity |
| Calendar separation confusing | Low | Medium | Clear documentation, examples for common cases |
| Adapter refactoring scope creep | Medium | Medium | Strict scope: only add units metadata if needed |

## Timeline Estimate

### Phase 1: Foundation (3-5 days)
- Story 007.01: Pure functional refactor

### Phase 2: Modularization (2-3 days)
- Story 007.02: Calendar extraction
- Story 007.03: Package exports

### Phase 3: Developer Experience (3-4 days)
- Story 007.04: Builder API
- Story 007.05: Documentation

### Phase 4: Quality Assurance (1-2 days)
- Story 007.06: Bundle size monitoring

**Total Estimate**: 9-14 days for full epic completion

## Success Metrics

### Quantitative Metrics
- Bundle size reduction: ≥70% for minimal usage
- Tree-shaking score: ≥9/10
- Test pass rate: 100% (722/722)
- Coverage: ≥87%
- Build time: No increase
- Type errors: 0

### Qualitative Metrics
- Migration guide completeness (developer feedback)
- API clarity (code review assessment)
- Documentation quality (tech writer review)
- Example usefulness (community feedback)

### Validation Method
```bash
# Bundle size validation
npm run build
npx rollup-plugin-visualizer dist/stats.html

# Tree-shaking test
echo "import { period } from 'minuta/operations'" > test.js
npx rollup test.js --format esm | wc -c  # Should be ~5-7KB

# Functional validation
TZ=UTC npm test  # All 722 tests must pass
npm run type-check  # No TypeScript errors
```

## Alignment with Project Philosophy

This epic directly supports the "Calculus for Time" philosophy:

**Fundamental Operations Only**
- Pure functions replace global state
- Each operation stands alone
- Minimal dependencies between operations

**Composition Over Convenience**
- Level 1 API is pure composition
- Level 2/3 are compositional wrappers
- Users can create their own abstractions

**Minimal API Surface**
- Removes registry complexity
- Reduces conceptual overhead
- Each addition is truly fundamental

## Impact on Calendar Creation

### Current Calendar Pattern (30KB bundle)
```typescript
import { createTemporal, usePeriod } from 'minuta';
import { nativeAdapter } from 'minuta/native';

const minuta = createTemporal({ adapter: nativeAdapter, date: new Date() });
const month = usePeriod(temporal, 'month');
const weeks = divide(temporal, month.value, 'week');
// Calendar UI renders weeks
```

### New Calendar Pattern - Option 1: Minimal (7KB bundle)
```typescript
import { period, divide } from 'minuta/operations';
import { createNativeAdapter } from 'minuta/native';

const adapter = createNativeAdapter({ weekStartsOn: 1 });
const month = period(adapter, new Date(), 'month');
const weeks = divide(adapter, month, 'week');
// Calendar UI renders weeks - same complexity
```

### New Calendar Pattern - Option 2: Builder (12KB bundle)
```typescript
import { createTemporal } from 'minuta';
import { nativeAdapter } from 'minuta/native';

const minuta = createTemporal({ adapter: nativeAdapter, weekStartsOn: 1 });
const month = minuta.period(new Date(), 'month');
const weeks = minuta.divide(month, 'week');
// Calendar UI renders weeks - cleaner API
```

### New Calendar Pattern - Option 3: Full DX (15KB bundle)
```typescript
import { createTemporal, usePeriod } from 'minuta';
import { nativeAdapter } from 'minuta/native';

const minuta = createTemporal({ adapter: nativeAdapter, date: new Date() });
const month = usePeriod(temporal, 'month');
const weeks = divide(temporal, month.value, 'week');
// Identical to current API, but tree-shakable
```

**Answer**: Calendar creation remains EQUALLY simple across all API levels. The refactor:
- ✅ Does NOT add complexity to calendar use cases
- ✅ Provides flexibility to choose bundle size vs. convenience
- ✅ Maintains reactivity patterns (usePeriod still works)
- ✅ Reduces bundle size by 50-76% with no API degradation

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-10 | 1.0 | Epic creation based on tree-shaking analysis | Claude (BMad Master) |

## Notes
This epic is critical for v2.0 launch success. The library's value proposition includes performance, and a 30KB bundle for minimal usage undermines that promise. With no npm publication yet, we have a rare opportunity to make breaking changes without ecosystem disruption.

**Key Decision Points:**
1. Proceed with breaking changes before v2.0 stable? **RECOMMENDED: YES**
2. Support all 3 API levels or just Level 1+2? **RECOMMENDED: All 3**
3. Move calendar to separate package or just separate entry point? **RECOMMENDED: Entry point only**
4. Maintain backward compatibility layer? **RECOMMENDED: NO - clean break for v2.0**
