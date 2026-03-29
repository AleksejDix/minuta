# Adapter Migration Guide

## Overview

Starting with Minuta v2.0.0, all adapter packages have been consolidated into the core package for better maintainability and smaller bundle sizes. The individual adapter packages are now deprecated and will be removed in v3.0.0.

## Migration Timeline

- **Now**: Deprecation warnings active in all adapter packages
- **3 months from release**: Legacy packages will be removed
- **v3.0.0**: Complete removal of legacy adapter packages

## Required Changes

### Before (Deprecated)
```typescript
// ❌ Old imports - will stop working in v3.0.0
import { createNativeAdapter } from 'minuta/native';
import { createDateFnsAdapter } from 'minuta/date-fns';
import { createLuxonAdapter } from 'minuta/luxon';
import { createMinutaAdapter } from 'minuta/temporal';
```

### After (Recommended)
```typescript
// ✅ New imports - use these instead
import { createNativeAdapter } from 'minuta/native';
import { createDateFnsAdapter } from 'minuta/date-fns';
import { createLuxonAdapter } from 'minuta/luxon';
import { createMinutaAdapter } from 'minuta/temporal';
```

## Required Changes

### Before (Deprecated)
```typescript
// ❌ Old imports - will stop working in v3.0.0
import { createNativeAdapter } from 'minuta/native';
import { createDateFnsAdapter } from 'minuta/date-fns';
import { createLuxonAdapter } from 'minuta/luxon';
import { createMinutaAdapter } from 'minuta/temporal';
```

### After (Recommended)
```typescript
// ✅ New imports - use these instead
import { createNativeAdapter } from 'minuta/native';
import { createDateFnsAdapter } from 'minuta/date-fns';
import { createLuxonAdapter } from 'minuta/luxon';
import { createMinutaAdapter } from 'minuta/temporal';
```

## Migration to Pure Operations (v2.0.0-alpha.1)

This release introduces significant breaking changes to the core API by removing the global unit registry and refactoring all operations to be pure functions that accept an `Adapter` instance directly. This change enables better tree-shaking and reduces bundle sizes.

### Key Breaking Changes

1.  **Removal of Global Unit Registry**:
    -   The global `unitRegistry` (`src/unit-registry.ts`) has been completely removed.
    -   Functions like `defineUnit()`, `getUnitDefinition()`, `hasUnit()`, and `getRegisteredUnits()` are no longer available.
    -   Any code that relied on registering custom units via `defineUnit()` will break.

2.  **Operation Signature Changes**:
    -   All core operations (e.g., `period`, `divide`, `merge`, `next`, `previous`, `go`, `isSame`, `isToday`) no longer accept a `Temporal` instance as their first argument.
    -   Instead, they now explicitly require an `Adapter` instance as their first argument.
    -   **Before**: `operation(adapter: Adapter, ...)`
    -   **After**: `operation(adapter: Adapter, ...)`

3.  **Calendar Helper Function Signature Changes**:
    -   The `createStableMonth()` and `createStableYear()` helper functions have also been updated.
    -   **Before**: `createStableMonth(adapter: Adapter, date: Date)`
    -   **After**: `createStableMonth(adapter: Adapter, weekStartsOn: number, date: Date)`
    -   The `weekStartsOn` configuration, previously accessed via `temporal.weekStartsOn`, must now be passed explicitly.

### Impact on Custom Units

-   The previous mechanism for defining custom units via `defineUnit()` is no longer supported.
-   If you had custom units, you will need to refactor them.
-   **Recommended Alternatives**:
    -   **Custom Adapter**: Extend an existing adapter (e.g., `createNativeAdapter()`) to include logic for your custom units within its `startOf`, `endOf`, `add`, and `diff` methods.
    -   **Helper Functions**: Create your own helper functions that return `Period` objects for your custom units, similar to how `createStableMonth()` and `createStableYear()` are now implemented. These helper functions will accept an `Adapter` directly.

### Migration Steps

1.  **Update Operation Calls**:
    -   Go through your codebase and replace all instances of `operation(temporal, ...)` with `operation(minuta.adapter, ...)`.
    -   For `createStableMonth()` and `createStableYear()`, you will need to extract `weekStartsOn` from your `Temporal` instance (if you are still using one) and pass it explicitly: `createStableMonth(minuta.adapter, temporal.weekStartsOn, date)`.

2.  **Refactor Custom Units**:
    -   If you had custom units defined using `defineUnit()`, you must rewrite their logic using one of the recommended alternatives above.

3.  **Remove Unit Registry Imports**:
    -   Delete any imports related to `defineUnit`, `getUnitDefinition`, `hasUnit`, or `getRegisteredUnits`.

4.  **Run Tests**:
    -   Thoroughly test your application after these changes to ensure all date operations function as expected.

### Example Migration

#### Before
```typescript
import { createTemporal, period, defineUnit } from 'minuta';
import { createNativeAdapter } from 'minuta/native';

// Old custom unit registration
defineUnit('fiscalYear', {
  period(date, adapter) { /* ... */ },
  // ...
});

const adapter = createNativeAdapter();
const minuta = createTemporal({ adapter, date: new Date() });

const monthPeriod = period(temporal, new Date(), 'month');
const fiscalYearPeriod = period(temporal, new Date(), 'fiscalYear');
```

#### After
```typescript
import { createTemporal, period } from 'minuta';
import { createNativeAdapter } from 'minuta/native';

// New approach: Custom helper function for fiscalYear
function createFiscalYear(adapter: Adapter, date: Date): Period {
  // Implement your fiscal year logic using the adapter
  const start = adapter.startOf(adapter.add(date, -3, 'month'), 'year'); // Example: Fiscal year starts in April
  const end = adapter.endOf(adapter.add(start, 11, 'month'), 'month');
  return { start, end, type: 'fiscalYear', date };
}

const adapter = createNativeAdapter();
const minuta = createTemporal({ adapter, date: new Date() }); // temporal still exists for composables

const monthPeriod = period(adapter, new Date(), 'month'); // Pass adapter directly
const fiscalYearPeriod = createFiscalYear(adapter, new Date()); // Use custom helper
```

## Package Mapping

| Old Package | New Import Path |
|------------|-----------------|
| `minuta/native` | `minuta/native` |
| `minuta/date-fns` | `minuta/date-fns` |
| `minuta/luxon` | `minuta/luxon` |
| `minuta/temporal` | `minuta/temporal` |

## Benefits of Migration

1. **Smaller Bundle Size**: Only import the adapter you need
2. **Faster Installation**: Fewer packages to download
3. **Simpler Dependencies**: One core package instead of multiple
4. **Better Tree-Shaking**: Modern bundlers can optimize better
5. **Easier Version Management**: Single package versioning

## Migration Steps

### 1. Update Your Imports

Find and replace all adapter imports in your codebase:

```bash
# Example using VS Code search/replace or similar tools
# Search: from 'minuta/native'
# Replace: from 'minuta/native'
```

### 2. Update package.json

Remove the individual adapter packages and ensure you have the core package:

```json
{
  "dependencies": {
    // Remove these
    - "minuta/native": "^1.x.x",
    - "minuta/date-fns": "^1.x.x",
    
    // Keep only this
    "minuta": "^2.0.0"
  }
}
```

### 3. Run Tests

After updating imports, run your test suite to ensure everything works correctly.

### 4. Optional: Suppress Deprecation Warnings

If you need more time to migrate, you can temporarily suppress console warnings:

```typescript
// Temporary workaround - remove after migration
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes('@minuta/adapter')) return;
  originalWarn(...args);
};
```

## Troubleshooting

### TypeScript Import Errors

If TypeScript can't find the new imports, try:

1. Restart your TypeScript service
2. Clear node_modules and reinstall
3. Update your tsconfig.json `moduleResolution` to "bundler" or "node16"

### Build Tool Issues

Some older build tools might have issues with subpath exports. Solutions:

1. Update to latest versions of your build tools
2. Configure your bundler to handle package.json exports field
3. For Webpack 4 users, upgrade to Webpack 5

## Need Help?

- Check our [GitHub Discussions](https://github.com/minuta/minuta/discussions)
- Report issues at [GitHub Issues](https://github.com/minuta/minuta/issues)
- See full documentation at [Minuta Docs](https://minuta.dev)

## Example Migration

Here's a complete before/after example:

### Before
```typescript
// old-code.ts
import { createDateFnsAdapter } from 'minuta/date-fns';
import { createTemporal } from 'minuta';

const adapter = createDateFnsAdapter();
const minuta = createTemporal({ adapter });
```

### After
```typescript
// new-code.ts
import { createDateFnsAdapter } from 'minuta/date-fns';
import { createTemporal } from 'minuta';

const adapter = createDateFnsAdapter();
const minuta = createTemporal({ adapter });
```

The API remains exactly the same - only the import path changes!