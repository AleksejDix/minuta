# Epic 011: Framework-Agnostic Core Refactor

## Epic Overview
**Title**: Extract Framework Integrations into Separate Packages
**Status**: Proposed
**Priority**: Critical
**Epic Owner**: Architecture Team Lead
**Sprint**: Pre-v2.0 Stable Release

## Epic Description

Refactor the library architecture to make the core package (`minuta`) completely framework-agnostic by removing all reactivity dependencies. Extract the current "builder" API (`createTemporal`) and composables into separate framework-specific packages, enabling future framework integrations while reducing bundle size and maintaining clear separation of concerns.

**Critical Insight**: The so-called "builder pattern" (`createTemporal`) is NOT a builder - it's actually a **framework-specific reactive state container**. The `browsing`, `now`, and configuration options like `weekStartsOn` are all reactive values that should trigger recalculation when changed. This is fundamentally a framework concern (Vue composable, React hook, etc.), not a core library concern.

**Critical Context**: The current architecture bundles `@vue/reactivity` as a core dependency (package.json line 74), forcing all users to download Vue's reactivity system even when they don't need reactivity. This violates the "minimal API surface" philosophy and prevents usage in React, Svelte, Angular, and other frameworks.

## Business Value

- **Framework Flexibility**: Support React, Svelte, Angular, and other frameworks with dedicated integrations
- **Bundle Size Reduction**: Core library drops ~15-20KB by removing @vue/reactivity
- **Clear Architecture**: Framework-agnostic core with opt-in framework features
- **Developer Choice**: Use pure functions (Level 1), builder (Level 2), or framework reactivity (Level 3)
- **Market Expansion**: Attract users from all major frontend frameworks
- **Maintenance Clarity**: Framework-specific code isolated in dedicated packages

## Current State Analysis

### Current Architecture Problems

**1. Vue Reactivity in Core** (`packages/minuta/package.json:74`)
```json
"dependencies": {
  "@vue/reactivity": "^3.5.18"
}
```

**Impact:**
- React developers forced to bundle Vue reactivity (~15KB)
- Angular developers forced to bundle Vue reactivity (~15KB)
- Vanilla JS developers forced to bundle Vue reactivity (~15KB)
- Core package is NOT framework-agnostic despite claims

**2. Misunderstood "Three-Level API"**

Current export structure forces all users through the same package:

```typescript
// packages/minuta/src/index.ts
export * from './operations'        // Level 1: Pure functions ✅
export { createTemporal }           // Level 2: "Builder" ❌ Actually Vue composable!
export { usePeriod }               // Level 3: Vue composable ❌
```

**The Truth About "Level 2":**
The `createTemporal` function is NOT a simple builder pattern - it's a **reactive state container** that:
- Returns `browsing: Ref<Period>` and `now: Ref<Period>` (Vue reactivity)
- Should make settings like `weekStartsOn` reactive (changing it should trigger recalculation)
- Is fundamentally tied to a reactivity system (Vue, React, Svelte, etc.)

**Problems:**
- "Builder" is actually a Vue composable in disguise
- No clear separation between pure functions and reactive state
- Tree-shaking can't eliminate reactivity code
- Framework-specific code mixed with core logic
- Non-Vue users forced to bundle Vue reactivity

**3. Current Package Structure**

```
packages/
├── minuta/           # Core + Vue reactivity (mixed concerns)
│   ├── operations         # Pure functions ✅
│   ├── composables/       # Vue-specific ❌
│   └── createTemporal.ts  # Uses @vue/reactivity ❌
```

## Target Architecture: Pure Core + Framework Integrations

### New Package Structure

```
packages/
├── minuta/                    # Framework-agnostic core (PURE FUNCTIONS ONLY)
│   ├── operations/                 # Pure functions only
│   │   ├── period.ts
│   │   ├── divide.ts
│   │   ├── next.ts, previous.ts, go.ts
│   │   ├── contains.ts, isSame.ts
│   │   └── merge.ts, split.ts
│   ├── types/                      # Core types (NO reactive types)
│   └── adapters/                   # Date library adapters
│       ├── native.ts
│       ├── date-fns.ts
│       ├── luxon.ts
│       └── temporal.ts
│
├── minuta-vue/                # Vue.js integration (COMPLETE REACTIVE SOLUTION)
│   ├── Minuta.ts             # Main Vue composable (replaces createTemporal)
│   ├── usePeriod.ts               # Reactive period composable
│   └── index.ts                   # Re-exports core operations for convenience
│
├── minuta-react/              # React integration (new)
│   ├── Minuta.ts             # Main React hook
│   ├── usePeriod.ts               # Reactive period hook
│   └── index.ts                   # Re-exports core operations
│
└── minuta-svelte/             # Future: Svelte integration
    ├── temporal.ts                # Svelte store
    └── period.ts                  # Period store
```

**Key Principle**: The core package has ZERO reactive concepts. All reactivity lives in framework packages.

### New API Architecture

There are really only **TWO API approaches**, not three:

**Approach 1: Pure Functions** (Core Package - No Reactivity)
```typescript
import { period, divide, next } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

// weekStartsOn is an ADAPTER setting
const adapter = createNativeAdapter({ weekStartsOn: 1 })
const year = period(adapter, new Date(), 'year')
const months = divide(adapter, year, 'month')

// Want different week start? Create a new adapter:
const sundayAdapter = createNativeAdapter({ weekStartsOn: 0 })
const week = period(sundayAdapter, new Date(), 'week')
```

**Approach 2: Framework Reactivity** (Framework Packages - Full Reactive State)

**Vue:**
```typescript
import { useMinuta, usePeriod } from 'minuta-vue'
import { createNativeAdapter } from 'minuta/native'

// Minuta is the main composable (replaces createTemporal)
const weekStartsOn = ref(1)  // ← Reactive adapter setting

// Adapter is recreated when weekStartsOn changes
const minuta = useMinuta({
  adapter: computed(() => createNativeAdapter({ weekStartsOn: weekStartsOn.value })),
  date: ref(new Date())  // ← Reactive browsing date
})

// Change week start dynamically - adapter recreates, everything recalculates
weekStartsOn.value = 0  // ← New adapter created, all periods recalculate!

// usePeriod watches temporal state
const month = usePeriod(temporal, 'month')
```

**React:**
```typescript
import { useMinuta, usePeriod } from 'minuta-react'
import { createNativeAdapter } from 'minuta/native'

function MyComponent() {
  const [weekStartsOn, setWeekStartsOn] = useState(1)

  // Adapter recreates when weekStartsOn changes
  const minuta = useMinuta({
    adapter: useMemo(
      () => createNativeAdapter({ weekStartsOn }),
      [weekStartsOn]
    ),
    date: new Date()
  })

  const month = usePeriod(temporal, 'month')

  // Change settings triggers re-render and new adapter
  const handleChangeWeekStart = () => {
    setWeekStartsOn(0)  // ← New adapter created, re-render!
  }

  return <Calendar period={month} onWeekStartChange={handleChangeWeekStart} />
}
```

**Key Insight**: Since `weekStartsOn` is an **adapter setting** (not a temporal setting), changing it requires creating a new adapter. When a user changes "week starts on Sunday" to "week starts on Monday":
1. A new adapter is created with the new setting
2. The temporal instance uses this new adapter
3. All periods recalculate with the new adapter
4. Framework reactivity handles the UI update

This validates that adapter configuration management belongs in framework packages - it requires reactive recreation of adapters, which is a framework concern.

### Package Responsibilities

**minuta (Core)**
- ✅ Pure functional operations (period, divide, next, etc.)
- ✅ Period type (plain object, no reactivity)
- ✅ Adapter interface and implementations (native, date-fns, luxon, temporal)
- ✅ Unit registry system
- ✅ Calendar operations (stableMonth, etc.)
- ❌ NO reactivity whatsoever
- ❌ NO framework dependencies
- ❌ NO createTemporal
- ❌ NO composables/hooks
- ❌ NO reactive state management

**minuta-vue**
- ✅ `useMinuta()` - Main Vue composable for reactive state
  - Manages reactive `browsing` and `now` periods
  - Accepts reactive adapter (allows reactive adapter recreation)
  - Returns reactive refs that trigger recalculation
- ✅ `usePeriod()` - Reactive period composable
- ✅ Re-exports core operations for convenience
- ✅ Full Vue reactivity integration
- ✅ Depends on: @vue/reactivity, minuta

**minuta-react**
- ✅ `useMinuta()` - Main React hook for state management
  - Manages state for `browsing` and `now` periods
  - Accepts memoized adapter (allows adapter recreation on state change)
  - Returns state and navigation functions
- ✅ `usePeriod()` - Reactive period hook
- ✅ Re-exports core operations for convenience
- ✅ Full React hooks integration
- ✅ Depends on: react, minuta

**minuta-svelte** (Future)
- ✅ Temporal store with reactive settings
- ✅ Period store
- ✅ Re-exports core operations
- ✅ Depends on: svelte, minuta

## Success Criteria

### Bundle Size Targets
- **Core package**: ≤ 8KB gzipped (operations + adapters only)
- **Vue integration**: ≤ 22KB gzipped (core + @vue/reactivity)
- **React integration**: ≤ 20KB gzipped (core + React hooks)
- **Reduction**: 15-20KB for non-Vue users

### Developer Experience
- **Breaking changes**: Documented with clear migration guide
- **API levels**: All 3 levels working in framework packages
- **Examples**: Vue, React, and vanilla JS examples
- **Type safety**: Full TypeScript support across all packages

### Quality Assurance
- **All tests pass**: 100% test pass rate maintained
- **Coverage maintained**: ≥ 87% across all packages
- **No regressions**: All functionality preserved
- **Performance**: No degradation in operation speed

### Documentation
- **Migration guide**: From current v2.0.0-alpha.1 to new architecture
- **Framework guides**: Separate guides for Vue, React, vanilla JS
- **API reference**: Updated for all packages
- **Examples**: Working examples for each framework

## Stories in this Epic

### Phase 1: Core Extraction (Breaking Changes)
- **Story 011.01**: Remove @vue/reactivity from Core Package
  - Remove @vue/reactivity dependency
  - Remove reactive Refs from Temporal interface
  - Make browsing and now plain objects
  - Update all core operations
  - Status: Proposed

- **Story 011.02**: Extract Composables to Separate Directory
  - Move usePeriod to dedicated directory
  - Prepare for package extraction
  - Update imports and tests
  - Status: Proposed

### Phase 2: Vue Package Creation
- **Story 011.03**: Create minuta-vue Package
  - Initialize new package structure
  - Move Vue-specific code from core
  - Implement reactive Temporal factory
  - Migrate usePeriod composable
  - Status: Proposed

- **Story 011.04**: Update Core Package Exports
  - Remove composable exports
  - Clean up Level 2/3 API from core
  - Update package.json exports map
  - Document pure functional API
  - Status: Proposed

### Phase 3: React Integration
- **Story 011.05**: Create minuta-react Package
  - Initialize React package structure
  - Implement React state-based Temporal
  - Create usePeriod hook
  - Add React-specific tests
  - Status: Proposed

- **Story 011.06**: Create React Example Application
  - Build React example app
  - Demonstrate usePeriod hook
  - Show calendar implementation
  - Document React best practices
  - Status: Proposed

### Phase 4: Documentation and Migration
- **Story 011.07**: Write Migration Guide for v2.0 Stable
  - Document breaking changes
  - Provide code migration examples
  - Update all documentation references
  - Create migration scripts/codemods if needed
  - Status: Proposed

- **Story 011.08**: Update Examples and Documentation
  - Update Vue example to use minuta-vue
  - Add React example
  - Add vanilla JS example
  - Update VitePress documentation
  - Status: Proposed

### Phase 5: Quality Assurance
- **Story 011.09**: Comprehensive Testing Across All Packages
  - Ensure all tests pass
  - Add framework integration tests
  - Test tree-shaking in all packages
  - Validate bundle sizes
  - Status: Proposed

- **Story 011.10**: Bundle Size Analysis and Optimization
  - Measure actual bundle sizes
  - Validate tree-shaking effectiveness
  - Document bundle size comparisons
  - Add CI/CD bundle size checks
  - Status: Proposed

## Technical Considerations

### Breaking Changes Required

1. **Core Package Changes**
   - Remove @vue/reactivity dependency entirely
   - Remove `createTemporal` export (moves to framework packages)
   - Remove `usePeriod` export (moves to framework packages)
   - Remove all reactive concepts from core types
   - Core exports ONLY pure functions and adapters

2. **Import Path Changes**
   ```typescript
   // Before (alpha.1) - Everything from core
   import { createTemporal, usePeriod } from 'minuta'

   // After (stable) - Framework packages
   import { useMinuta, usePeriod } from 'minuta-vue'
   // or
   import { useMinuta, usePeriod } from 'minuta-react'

   // Pure functions still from core
   import { period, divide } from 'minuta/operations'
   ```

3. **No "Temporal Interface" in Core**
   ```typescript
   // Before (alpha.1) - Temporal was in core with Vue reactivity
   interface Temporal {
     adapter: Adapter
     weekStartsOn: number
     browsing: Ref<Period>  // Vue Ref ❌
     now: Ref<Period>       // Vue Ref ❌
   }

   // After (stable) - NO Temporal interface in core!
   // Each framework defines its own reactive Temporal:

   // Vue version (in minuta-vue)
   interface VueTemporal {
     adapter: Ref<Adapter>         // Reactive adapter (recreates on config change)
     browsing: Ref<Period>         // Reactive state
     now: Ref<Period>              // Reactive state
     next: () => void              // Navigation
     previous: () => void
     // Note: weekStartsOn lives in the adapter, not here
   }

   // React version (in minuta-react)
   interface ReactTemporal {
     adapter: Adapter              // Current adapter (recreates via useMemo)
     browsing: Period              // Current state
     now: Period                   // Current state
     next: () => void              // Navigation with setState
     previous: () => void
     // Note: weekStartsOn lives in the adapter, not here
   }
   ```

4. **Renamed Main Function**
   - `createTemporal` → `Minuta` (better reflects reactive nature)
   - Each framework package exports its own `Minuta`

### Migration Strategy

- **Version**: 2.0.0-alpha.1 → 2.0.0 (breaking changes acceptable)
- **Timing**: Pre-publication to npm stable
- **Risk**: MEDIUM - alpha users will need to migrate
- **Documentation**: Comprehensive migration guide required

### Rollback Plan

- **Git branch**: Create `refactor/framework-agnostic` branch
- **Baseline**: Tag current alpha as `v2.0.0-alpha.1-pre-framework-refactor`
- **Validation**: Parallel test suite for all packages
- **Rollback**: Git revert if critical issues discovered

## Dependencies

### Technical Requirements
- **TypeScript**: 5.0+ for proper module resolution
- **Build tools**: Vite for all packages
- **Node.js**: 18+ (current requirement)
- **Package managers**: npm workspaces

### Framework Dependencies
- **Vue package**: @vue/reactivity ^3.5.18
- **React package**: react ^18.0.0 (peer dependency)
- **Svelte package**: svelte ^4.0.0 (future, peer dependency)

### Internal Dependencies
- All framework packages depend on core package
- Epic 007 (Tree-Shaking Architecture) should be completed or coordinated
- Current test suite must be maintained

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking changes alienate alpha users | Medium | High | Clear migration guide, support, advance notice |
| React implementation complexity | Medium | Medium | Research React state management patterns early |
| Bundle size targets not met | High | Low | Validate with bundler analysis tools early |
| Type safety degradation | High | Low | Strict TypeScript checks, type tests |
| Framework-specific bugs | Medium | Medium | Comprehensive integration testing per framework |
| Documentation scope creep | Medium | High | Clear doc structure, focus on migration first |
| Maintenance burden (multiple packages) | Medium | Medium | Shared testing utilities, automated releases |

## Timeline Estimate

### Phase 1: Core Extraction (3-4 days)
- Story 011.01: Remove @vue/reactivity
- Story 011.02: Extract composables

### Phase 2: Vue Package (2-3 days)
- Story 011.03: Create Vue package
- Story 011.04: Update core exports

### Phase 3: React Integration (3-4 days)
- Story 011.05: Create React package
- Story 011.06: React example app

### Phase 4: Documentation (2-3 days)
- Story 011.07: Migration guide
- Story 011.08: Examples and docs

### Phase 5: Quality Assurance (2 days)
- Story 011.09: Testing
- Story 011.10: Bundle size analysis

**Total Estimate**: 12-16 days for full epic completion

## Success Metrics

### Quantitative Metrics
- Bundle size reduction: ≥50% for core package
- Framework coverage: 2+ frameworks supported (Vue, React)
- Test pass rate: 100% across all packages
- Coverage: ≥87% across all packages
- Build time: No significant increase
- Type errors: 0 across all packages

### Qualitative Metrics
- Migration guide clarity (user feedback)
- Framework integration quality (code review)
- Documentation completeness (tech writer review)
- Developer experience (community feedback)

### Validation Method
```bash
# Bundle size validation
npm run build --workspace=minuta
npx bundlesize # Core should be ≤8KB

npm run build --workspace=minuta-vue
npx bundlesize # Vue should be ≤22KB

npm run build --workspace=minuta-react
npx bundlesize # React should be ≤20KB

# Functional validation
TZ=UTC npm test  # All tests must pass
npm run type-check  # No TypeScript errors

# Framework integration tests
npm run demo:build --workspace=minuta-vue
npm run demo:build --workspace=minuta-react
```

## Alignment with Project Philosophy

This epic directly supports the "Calculus for Time" philosophy:

**Fundamental Operations Only**
- Core package contains ONLY fundamental operations (period, divide, next, etc.)
- Framework reactivity is NOT fundamental to time manipulation
- The "builder pattern" was a misconception - it's actually framework-specific reactive state
- Clean separation: pure functions in core, reactive wrappers in framework packages

**Composition Over Convenience**
- Framework packages compose core operations with reactivity
- Users can choose their framework or stay pure functional
- No forced dependencies or "one size fits all" approach
- `Minuta` is a composition of core operations + framework reactivity

**Minimal API Surface**
- Core package has zero framework dependencies
- Core API is just pure functions + adapters
- Each framework package adds only what's needed for that framework
- Users bundle only what they use

**Framework Agnostic at the Core**
- Pure core enables ANY framework integration
- Vue, React, Svelte, Angular all supported equally as first-class citizens
- Vanilla JS usage is first-class (just use operations directly)
- No framework has privileged status

**The Truth About "Levels"**
- There are not "three levels" - there are TWO approaches:
  1. Pure functions (no reactivity needed)
  2. Framework reactivity (Vue, React, etc.)
- What was called "Level 2 Builder" was actually "Level 3 Vue Composable" in disguise
- Settings like `weekStartsOn` should be reactive → framework concern, not core concern

## Impact on Existing Users

### Alpha Users
- **Breaking changes**: Yes, import paths change
- **Migration effort**: LOW - mostly import path updates
- **Benefits**: Smaller bundles, clearer architecture
- **Support**: Migration guide, upgrade assistance

### Future Users
- **Vue users**: Use minuta-vue
- **React users**: Use minuta-react
- **Vanilla JS**: Use minuta (pure functions)
- **Other frameworks**: Easy to add new integrations

## Future Framework Integrations

This architecture enables easy addition of:

- **minuta-svelte** - Svelte stores
- **minuta-angular** - Angular services/signals
- **minuta-solid** - Solid.js signals
- **minuta-preact** - Preact hooks

Each framework package follows the same pattern:
1. Depend on core package
2. Implement framework-specific reactivity
3. Re-export core operations
4. Provide framework-specific examples

## Relationship to Epic 007

**Epic 007**: Tree-Shaking Architecture Refactor
**Epic 011**: Framework-Agnostic Core Refactor

### Coordination Required
Both epics involve major architectural changes. They should be:
1. **Sequenced**: Complete Epic 007 first (pure functional core)
2. **Coordinated**: Epic 011 builds on Epic 007's foundation
3. **Combined**: Consider implementing together for single migration

### Recommended Approach
**Option A**: Sequential (Safer)
- Complete Epic 007 (pure functional core)
- Release as v2.0.0-alpha.2
- Then start Epic 011 (framework extraction)
- Release as v2.0.0-beta.1

**Option B**: Combined (Faster)
- Implement both epics in parallel
- Single major migration
- Release as v2.0.0-beta.1
- **RECOMMENDED** - avoids multiple breaking changes

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-24 | 1.0 | Epic creation for framework-agnostic refactor | Claude (BMad Master) |
| 2025-11-24 | 1.1 | Updated with reactive settings insight (weekStartsOn, etc.) | Claude (BMad Master) |
| 2025-11-24 | 1.2 | Corrected: weekStartsOn is adapter setting, requires adapter recreation | Claude (BMad Master) |

## Notes

This epic represents a fundamental architectural shift that aligns the codebase with modern best practices:

1. **Framework Agnostic Core**: The core should NOT depend on any framework
2. **Opt-In Frameworks**: Users choose their framework integration
3. **Bundle Size**: Users only bundle what they need
4. **Future Proof**: Easy to add new framework integrations
5. **Reactive Settings**: Settings like `weekStartsOn` should be reactive in framework packages

**Critical Insights:**
- The "three-level API" was a misconception - there are really only TWO approaches (pure vs. reactive)
- The "builder pattern" (`createTemporal`) is actually a framework-specific reactive state container
- `weekStartsOn` is an **adapter setting**, not a temporal setting - changing it requires adapter recreation
- Reactive adapter configuration management is a framework concern (Vue: computed adapter, React: useMemo adapter)
- `createTemporal` should be renamed to `Minuta` to reflect its reactive nature
- Each framework implements its own reactive state management (Vue: Refs, React: useState, etc.)
- Framework packages manage adapter lifecycle when settings change

**Key Decision Points:**
1. Remove @vue/reactivity from core? **RECOMMENDED: YES**
2. Remove `createTemporal` from core? **RECOMMENDED: YES** (moves to framework packages)
3. Rename to `Minuta`? **RECOMMENDED: YES** (better reflects reactive nature)
4. Make settings reactive? **RECOMMENDED: YES** (weekStartsOn changes should trigger recalc)
5. Create separate framework packages? **RECOMMENDED: YES**
6. Support React in v2.0.0? **RECOMMENDED: YES**
7. Coordinate with Epic 007? **RECOMMENDED: YES (Option B)**
8. Break alpha users' code? **ACCEPTABLE** - not published to npm stable yet

**Critical Success Factor**: This refactor enables the library to reach ALL frontend developers, not just Vue users. It's essential for market adoption and architectural integrity. The realization that settings should be reactive (not static configuration) validates that `createTemporal` belongs in framework packages, not core.
