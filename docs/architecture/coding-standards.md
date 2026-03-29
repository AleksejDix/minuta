# Coding Standards

This document defines the coding standards and conventions for the Minuta project. All code contributions must adhere to these standards to maintain consistency and quality across the codebase.

## Language and Framework Standards

### TypeScript

- **Version**: TypeScript 5.7.3+
- **Strict Mode**: Always enabled
- **Module System**: ESM only (`"type": "module"`)
- **Target**: ES2022 or later

### Code Style

#### Formatting (Prettier)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### Naming Conventions

- **Files**: `camelCase.ts` (e.g., `createTemporal.ts`, `usePeriods.ts`)
- **Directories**: `kebab-case` for packages, `camelCase` for source folders
- **Interfaces/Types**: `PascalCase` (e.g., `Period`, `Temporal`, `Adapter`)
- **Functions**: `camelCase` (e.g., `createPeriod`, `divide`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `UNITS`, `YEAR`, `MONTH`)
- **Type Parameters**: Single letter or descriptive `PascalCase` (e.g., `T`, `TUnit extends Unit`)

#### Import Organization

1. External dependencies
2. Internal packages (`@minuta/*`)
3. Relative imports (furthest to nearest)
4. Type imports last

```typescript
// External
import { ref, computed } from "@vue/reactivity";

// Internal packages
import type { Adapter } from "@minuta/adapter-native";

// Relative imports
import { createPeriod } from "./operations/createPeriod";
import { divide } from "./operations/divide";

// Type imports
import type { Period, Unit, Temporal } from "./types";
```

## Architectural Principles

### Functional Programming

- **Pure Functions**: All operations must be pure functions
- **No Side Effects**: Functions should not modify inputs
- **Immutability**: Always return new objects, never mutate
- **No Classes**: Use functions and objects, not classes

```typescript
// ✅ Good - Pure function
export function next(adapter: Adapter, period: Period): Period {
  const nextDate = minuta.adapter.add(period.date, 1, period.type);
  return createPeriod(temporal, nextDate, period.type);
}

// ❌ Bad - Mutates input
export function next(adapter: Adapter, period: Period): Period {
  period.date = minuta.adapter.add(period.date, 1, period.type);
  return period;
}
```

### API Design Philosophy

Following the "Calculus for Time" philosophy:

1. **Minimal API Surface**: Only fundamental operations
2. **Composition Over Convenience**: Let users compose their own abstractions
3. **No Trivial Wrappers**: Reject functions that just reorder parameters

```typescript
// ✅ Good - Fundamental operation
export function divide(adapter: Adapter, period: Period, unit: Unit): Period[] {
  // Core logic for breaking down periods
}

// ❌ Bad - Trivial wrapper
export function today(adapter: Adapter, unit: Unit): Period {
  return createPeriod(temporal, new Date(), unit);
}
// Users should compose: createPeriod(temporal, new Date(), unit)
```

### Type Safety

- **Explicit Types**: Always provide explicit return types
- **Avoid `any`**: Use `unknown` or generic types instead
- **Discriminated Unions**: Use for variant types
- **Type Guards**: Implement for runtime type checking

```typescript
// ✅ Good - Explicit types and type guard
export function isPeriod(value: unknown): value is Period {
  return (
    typeof value === "object" &&
    value !== null &&
    "start" in value &&
    "end" in value &&
    "type" in value &&
    "date" in value
  );
}

export function merge(adapter: Adapter, periods: Period[]): Period {
  // Explicit return type
}
```

## Testing Standards

### Test Organization

**Colocated Structure**: Tests live next to the code they test for better maintainability.

```
src/
├── operations/
│   ├── divide.ts
│   ├── divide.test.ts                    # Unit tests
│   ├── divide.multi-adapter.test.ts      # Multi-adapter tests
│   └── utils/
│       ├── isToday.ts
│       └── isToday.test.ts
├── calendar/
│   ├── stableMonth.ts
│   ├── stableMonth.test.ts               # Colocated calendar tests
│   ├── stableYear.ts
│   └── stableYear.test.ts
├── composables/
│   ├── usePeriods.ts
│   └── reactivity.test.ts                # Reactivity integration tests
├── __tests__/                            # Integration/regression only
│   ├── integration/
│   │   ├── exports.test.ts
│   │   └── integration.test.ts
│   └── regression/
│       └── regression.test.ts
└── test/                                 # Test utilities only
    └── multi-adapter-test-template.ts
```

### Test File Naming

| Test Type | File Pattern | Description |
|-----------|-------------|-------------|
| Unit Test | `{name}.test.ts` | Single module tests with mocked dependencies |
| Multi-Adapter | `{name}.multi-adapter.test.ts` | Tests run against all adapters |
| Integration | `__tests__/integration/*.test.ts` | Multi-module interaction tests |
| Regression | `__tests__/regression/*.test.ts` | Bug prevention tests |

### Test Environment

**CRITICAL**: Always run tests with UTC timezone:

```bash
# Unix/Linux/macOS
TZ=UTC npm test

# Windows PowerShell
$env:TZ="UTC"; npm test
```

### Test Structure

```typescript
import { describe, it, expect } from "vitest";
import { runAdapterCompliance } from "../test/run-adapter-compliance.test";

describe("divide", () => {
  // Unit tests
  it("should validate input parameters", () => {
    // Test with mock adapter
  });

  // Multi-adapter tests (separate file: divide.multi-adapter.test.ts)
  runAdapterCompliance((adapter) => {
    it("should divide year into months", () => {
      const minuta = createTemporal({ adapter });
      const year = period(temporal, new Date(2024, 0, 1), "year");
      const months = divide(temporal, year, "month");
      
      expect(months).toHaveLength(12);
      expect(months[0].type).toBe("month");
    });
  });
});
```

### Testing Guidelines

- **Framework**: Vitest
- **Coverage Target**: Minimum 80% coverage
- **Multi-Adapter Testing**: Required for all date operations
- **Test Isolation**: Each test should be independent
- **Clear Descriptions**: Use descriptive test names
- **Arrange-Act-Assert**: Follow AAA pattern

## Documentation Standards

### Code Comments

- **JSDoc**: For all exported functions and types
- **Implementation Comments**: Only for complex logic
- **No Obvious Comments**: Code should be self-documenting

```typescript
/**
 * Divides a period into smaller units.
 * 
 * @param temporal - The temporal instance
 * @param period - The period to divide
 * @param unit - The unit to divide into
 * @returns Array of periods representing the divisions
 * 
 * @example
 * const months = divide(temporal, yearPeriod, "month");
 * // Returns 12 month periods
 */
export function divide(
  temporal: Temporal,
  period: Period,
  unit: Unit
): Period[] {
  // Implementation
}
```

### File Headers

No copyright headers or file-level comments unless legally required.

## Module Organization

### Export Strategy

- **Named Exports Only**: No default exports
- **Barrel Exports**: Use `index.ts` for public API
- **Internal Modules**: Don't export implementation details

```typescript
// index.ts - Public API
export { createTemporal } from "./createTemporal";
export { divide, merge, split } from "./operations";
export type { Period, Temporal, Unit } from "./types";

// operations/index.ts - Operations barrel
export { divide } from "./divide";
export { merge } from "./merge";
export { split } from "./split";
```

### File Size

- **Single Responsibility**: One main export per file
- **Max Lines**: Prefer files under 200 lines
- **Utils**: Group related utilities together

## Error Handling

### Error Types

- **Type Errors**: Use TypeScript's type system
- **Runtime Errors**: Throw descriptive errors
- **Validation**: Fail fast with clear messages

```typescript
export function createPeriod(
  temporal: Temporal,
  date: Date,
  unit: Unit
): Period {
  if (!minuta.adapter) {
    throw new Error("Temporal instance requires an adapter");
  }
  
  if (!isValidDate(date)) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  // Implementation
}
```

## Performance Considerations

### Optimization Guidelines

- **Lazy Evaluation**: Use computed refs for expensive operations
- **Memoization**: Cache results when appropriate
- **Avoid Premature Optimization**: Profile before optimizing

```typescript
// Using Vue reactivity for lazy evaluation
export function usePeriod(adapter: Adapter, unit: Unit) {
  const period = computed(() => 
    createPeriod(temporal, temporal.now.value.date, unit)
  );
  
  return period;
}
```

## Version Control

### Commit Messages

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Build/tooling changes

### Branch Strategy

- `main`/`master`: Production-ready code
- Feature branches: `feature/description`
- Fix branches: `fix/description`

## Security Guidelines

- **No Secrets**: Never commit API keys or credentials
- **Input Validation**: Validate all external inputs
- **Dependency Updates**: Keep dependencies current
- **Type Safety**: Leverage TypeScript for security

## Accessibility

While this is a time manipulation library without UI components, ensure:
- Examples are accessible
- Documentation uses semantic HTML
- Code samples include ARIA attributes where relevant

## Browser/Environment Support

- **Node.js**: 18+ (ESM support)
- **Browsers**: Modern evergreen browsers
- **Module System**: ESM only, no CommonJS
- **Polyfills**: User's responsibility (e.g., Temporal API)

## Review Checklist

Before submitting code:
- [ ] Follows TypeScript conventions
- [ ] Passes all tests
- [ ] Maintains test coverage
- [ ] Includes JSDoc for public APIs
- [ ] No linting errors
- [ ] Follows functional programming principles
- [ ] Adheres to "Calculus for Time" philosophy