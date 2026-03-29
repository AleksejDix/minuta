# Test Structure Migration Plan

## Current State

The project currently has an inconsistent test structure:
- Some tests are colocated (e.g., `divide.test.ts` next to `divide.ts`)
- Some are in `__tests__` folders (e.g., `calendar/__tests__/`)
- Some are at the root of src (e.g., `exports.test.ts`)

## Proposed Structure

Adopt a **colocated test structure** with clear conventions:

### 1. Unit Tests - Colocated
Place unit tests next to the files they test:
```
src/
├── operations/
│   ├── divide.ts
│   ├── divide.test.ts                    # Unit tests
│   ├── divide.multi-adapter.test.ts      # Multi-adapter tests
```

### 2. Integration Tests - Centralized
Keep integration and e2e tests in a central location:
```
src/
└── __tests__/
    ├── integration/
    │   ├── adapter-compliance.test.ts
    │   └── calendar-integration.test.ts
    └── regression/
        └── issue-123.test.ts
```

### 3. Test Utilities - Dedicated Folder
Keep test utilities separate:
```
src/
└── test/
    ├── multi-adapter-test-template.ts
    ├── functionalMockAdapter.ts
    └── test-utils.ts
```

## Migration Steps

### Phase 1: Move Existing Tests
1. Move `calendar/__tests__/*.test.ts` → colocate with calendar files
2. Move root-level tests to appropriate locations:
   - `exports.test.ts` → `__tests__/integration/exports.test.ts`
   - `createTemporal.test.ts` → next to `createTemporal.ts`
   - `reactivity.test.ts` → `__tests__/integration/reactivity.test.ts`

### Phase 2: Remove Empty Directories
1. Delete `operations/utils/__tests__/` (empty)
2. Delete other empty `__tests__` directories

### Phase 3: Update Import Paths
1. Update any imports that reference moved test files
2. Update test utilities imports

### Phase 4: Document Standards
1. Update coding-standards.md with test structure guidelines
2. Add examples of each test type

## Benefits

1. **Consistency**: One clear pattern for all developers
2. **Discoverability**: Tests are easy to find
3. **Maintainability**: Related code stays together
4. **Clarity**: Clear distinction between test types

## Test Naming Conventions

| Test Type | File Pattern | Example |
|-----------|-------------|---------|
| Unit Test | `{name}.test.ts` | `divide.test.ts` |
| Multi-Adapter Test | `{name}.multi-adapter.test.ts` | `divide.multi-adapter.test.ts` |
| Integration Test | Descriptive name in `__tests__/integration/` | `adapter-compliance.test.ts` |
| Regression Test | Issue reference in `__tests__/regression/` | `issue-123-timezone-fix.test.ts` |

## Example Directory Structure After Migration

```
packages/minuta/src/
├── operations/
│   ├── divide.ts
│   ├── divide.test.ts
│   ├── divide.multi-adapter.test.ts
│   ├── merge.ts
│   ├── merge.test.ts
│   ├── merge.multi-adapter.test.ts
│   └── utils/
│       ├── isToday.ts
│       ├── isToday.test.ts
│       └── isToday.multi-adapter.test.ts
├── composables/
│   ├── usePeriods.ts
│   └── usePeriods.test.ts
├── calendar/
│   ├── stableMonth.ts
│   ├── stableMonth.test.ts
│   └── integration.test.ts
├── createTemporal.ts
├── createTemporal.test.ts
├── test/                                 # Test utilities only
│   ├── multi-adapter-test-template.ts
│   ├── functionalMockAdapter.ts
│   └── adapter-compliance.ts
└── __tests__/                           # Integration/e2e only
    ├── integration/
    │   ├── exports.test.ts
    │   ├── reactivity.test.ts
    │   └── adapter-compliance.test.ts
    └── regression/
        └── regression.test.ts
```

## Implementation Timeline

1. **Week 1**: Create migration script to move files
2. **Week 2**: Execute migration and fix imports
3. **Week 3**: Update documentation
4. **Week 4**: Team training on new structure