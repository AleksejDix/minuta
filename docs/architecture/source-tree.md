# Source Tree

This document provides a detailed overview of the Minuta project structure, explaining the purpose of each directory and key files.

## Project Root Structure

```
pickle/                              # Project root (monorepo)
├── packages/                        # All npm packages
├── docs/                           # Developer documentation (BMad)
├── vitepress/                      # User-facing documentation
├── examples/                       # Example applications
├── .bmad-core/                     # BMad method configuration
├── node_modules/                   # Dependencies (git-ignored)
├── CLAUDE.md                       # AI agent guidance
├── package.json                    # Root package configuration
├── package-lock.json              # Dependency lock file
├── CHANGELOG.md                    # Project changelog
├── LICENSE                         # Apache 2.0 license
├── README.md                       # Project readme
├── .prettierrc.json               # Code formatting config
├── .gitignore                     # Git ignore patterns
├── vitest.setup.ts                # Global test setup
├── vitest.config.ts               # Root test configuration
└── tsconfig.json                  # Root TypeScript config
```

## Packages Directory

The monorepo has been consolidated to a single main package with integrated adapters:

```
packages/
├── minuta/                   # Main library with all functionality
└── tsconfig/                      # Shared TypeScript configs
```

### Minuta Package Structure

```
packages/minuta/
├── src/
│   ├── index.ts                  # Public API exports
│   ├── types.ts                  # Core type definitions
│   ├── createTemporal.ts         # Factory function
│   ├── createTemporal.test.ts    # Factory tests
│   ├── exports.test.ts           # Export verification
│   ├── operations.ts             # Operations re-export
│   ├── reactivity.test.ts        # Reactivity tests
│   ├── unit-registry.ts          # Unit plugin system
│   ├── unit-registry.test.ts     # Unit registry tests
│   ├── units-constant.test.ts    # UNITS constant tests
│   ├── adapters/                 # Integrated date adapters
│   │   ├── date-fns/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts
│   │   │   └── units/
│   │   ├── date-fns-tz/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts
│   │   │   └── units/
│   │   ├── luxon/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts
│   │   │   └── units/
│   │   ├── native/
│   │   │   ├── index.ts
│   │   │   ├── adapter.ts
│   │   │   └── units/
│   │   └── temporal/
│   │       ├── index.ts
│   │       ├── adapter.ts
│   │       └── units/
│   ├── calendar/                 # Calendar units extension
│   │   ├── index.ts
│   │   ├── stableMonth.ts
│   │   ├── stableMonth.test.ts   # Colocated calendar tests
│   │   ├── stableYear.ts
│   │   └── stableYear.test.ts
│   ├── composables/
│   │   ├── usePeriods.ts        # Reactive period composable
│   │   └── reactivity.test.ts    # Reactivity integration tests
│   ├── operations/
│   │   ├── index.ts             # Operations barrel export
│   │   ├── period.ts            # Period creation (renamed from createPeriod)
│   │   ├── period.custom.test.ts # Custom period tests
│   │   ├── divide.ts            # Divide operation
│   │   ├── merge.ts             # Merge operation
│   │   ├── split.ts             # Split operation
│   │   ├── contains.ts          # Contains check
│   │   ├── go.ts                # Navigation
│   │   ├── isSame.ts            # Comparison
│   │   ├── next.ts              # Next period
│   │   ├── previous.ts          # Previous period
│   │   └── utils/
│   │       ├── index.ts         # Utils barrel
│   │       ├── isToday.ts       # Today check
│   │       ├── isWeekday.ts     # Weekday check
│   │       └── isWeekend.ts     # Weekend check
│   ├── units/
│   │   └── definitions.ts       # Core unit definitions
│   ├── test/                    # Test utilities
│   │   ├── adapter-compliance.ts
│   │   ├── functionalMockAdapter.ts
│   │   ├── multi-adapter-test-template.ts
│   │   ├── run-adapter-compliance.test.ts
│   │   └── shared-adapter-tests.ts
│   └── __tests__/               # Integration and regression tests
│       ├── integration/
│       │   ├── exports.test.ts
│       │   ├── integration.test.ts  # Calendar integration
│       │   ├── unit-package-integration.test.ts.skip
│       │   ├── unit-plugin-system.test.ts.skip
│       │   └── unit-type-augmentation.test.ts.skip
│       └── regression/
│           └── regression.test.ts
├── dist/                        # Build output (git-ignored)
├── package.json                 # Package manifest
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite build config
└── vitest.config.ts            # Test configuration
```

### Adapter Structure (Integrated)

Adapters are now integrated within the main package:

```
src/adapters/{name}/
├── index.ts                    # Adapter exports
├── adapter.ts                  # Main adapter implementation
└── units/                      # Adapter-specific unit implementations
    ├── year.ts
    ├── quarter.ts
    ├── month.ts
    ├── week.ts
    ├── day.ts
    ├── hour.ts
    ├── minute.ts
    └── second.ts
```

Available adapters:
- `native` - JavaScript Date object adapter
- `date-fns` - date-fns library adapter
- `date-fns-tz` - date-fns with timezone support
- `luxon` - Luxon DateTime adapter
- `temporal` - TC39 Temporal API adapter

## Documentation Structure

### Developer Documentation (BMad Method)

```
docs/
├── prd/                        # Product Requirements
│   ├── README.md
│   ├── minuta-prd.md
│   └── adapter-consolidation-brownfield-prd.md
├── architecture/               # Technical Architecture
│   ├── README.md
│   ├── minuta-architecture.md
│   ├── coding-standards.md
│   ├── tech-stack.md
│   └── source-tree.md         # This document
├── epics/                      # Feature Epics
│   ├── README.md
│   ├── epic-005-test-architecture-enhancement.md
│   ├── epic-006-adapter-consolidation.md
│   ├── epic-010-allens-temporal-relations.md
│   └── archive/                # Completed epics
├── stories/                    # User Stories
│   ├── README.md
│   ├── {epic}.{story}.{name}.md
│   └── archive/                # Completed stories (009.02, 009.03, etc.)
├── sprints/                    # Sprint Planning
│   ├── quality-sprint-tracking.md
│   ├── sprint-adapter-consolidation-2025-07.md
│   └── archive/
├── communications/             # Team Communications
│   └── *.md
├── brainstorming-session-results.md  # API design philosophy
├── market-research.md          # Competitive analysis
├── front-end-spec.md          # Frontend requirements
└── MIGRATION-ADAPTERS.md      # Adapter consolidation guide
```

### User Documentation (VitePress)

```
vitepress/
├── .vitepress/
│   ├── config.ts               # VitePress configuration
│   ├── theme/                  # Custom theme
│   └── cache/                  # Build cache (git-ignored)
├── api/                        # API Reference
│   ├── index.md                # API overview
│   ├── composables/            # Reactive composables
│   ├── factory-functions/      # Core factory functions
│   ├── operations/             # All operations
│   │   ├── period.md          # Period creation (in navigation section)
│   │   ├── divide.md
│   │   ├── merge.md
│   │   ├── split.md
│   │   └── ...
│   ├── types/                  # TypeScript types
│   ├── unit-system/            # Unit plugin system
│   └── utilities/              # Utility functions
├── guide/                      # User Guide
│   ├── what-is-minuta.md
│   ├── getting-started.md
│   ├── installation.md
│   ├── adapters.md            # Date adapter guide
│   ├── migration.md           # Migration from v1/other libs
│   ├── patterns/              # Usage patterns
│   └── troubleshooting.md
├── examples/                   # Code Examples
│   ├── basic-usage.md
│   ├── calendars/             # Calendar implementations
│   ├── frameworks/            # Framework integrations
│   └── recipes/               # Common patterns
├── resources/                  # Educational content
├── extensions/                 # Extension packages docs
├── public/                     # Static assets
├── index.md                    # Home page
├── documentation-index.md      # Full doc index
└── package.json               # VitePress dependencies
```

## Examples Directory

```
examples/
└── vue/                        # Vue.js example
    ├── src/
    │   ├── App.vue
    │   ├── main.ts
    │   ├── components/        # Example components
    │   ├── composables/       # Example composables
    │   └── router/            # Vue Router setup
    ├── public/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## Configuration Files

### Root Configuration

| File | Purpose | Key Settings |
|------|---------|--------------|
| package.json | Workspace configuration | Workspaces, scripts, devDependencies |
| tsconfig.json | Root TypeScript config | Base settings, references |
| .prettierrc.json | Code formatting | Style rules |
| .gitignore | Git exclusions | node_modules, dist, coverage |

### Package Configuration

Each package includes:

| File | Purpose | Inheritance |
|------|---------|-------------|
| package.json | Package manifest | Independent |
| tsconfig.json | TypeScript config | Extends @minuta/tsconfig |
| vite.config.ts | Build configuration | Shared patterns |
| vitest.config.ts | Test configuration | Coverage, environment |

## Test File Organization

Tests are colocated with source files following modern best practices:

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
│   ├── stableMonth.test.ts               # Colocated with source
│   ├── stableYear.ts
│   └── stableYear.test.ts
├── composables/
│   ├── usePeriods.ts
│   └── reactivity.test.ts                # Integration test
├── __tests__/                            # Non-colocated tests
│   ├── integration/
│   │   ├── exports.test.ts               # Export verification
│   │   └── integration.test.ts           # Calendar integration
│   └── regression/
│       └── regression.test.ts            # Bug prevention tests
└── test/                                 # Test utilities
    └── multi-adapter-test-template.ts
```

**Test Structure (Post Story 005.01):**
- **20 test files** with **722 tests**
- **Unit tests**: Colocated with source (e.g., `divide.test.ts`)
- **Multi-adapter tests**: Colocated (e.g., `divide.multi-adapter.test.ts`)
- **Integration tests**: Centralized in `__tests__/integration/`
- **Regression tests**: Centralized in `__tests__/regression/`
- **Test utilities**: Located in `test/` directory

## Build Outputs

All packages build to:

```
packages/{name}/
└── dist/
    ├── index.js               # ESM entry
    ├── index.d.ts             # Type definitions
    └── {module}/              # Submodules
```

## Special Directories

### .bmad-core/

BMad method configuration:

```
.bmad-core/
├── core-config.yaml           # BMad configuration
├── agents/                    # Agent definitions
├── tasks/                     # Reusable tasks
├── templates/                 # Document templates
└── checklists/               # Process checklists
```

### Research/

Design documents and RFCs:

```
research/
├── rfcs/                     # Request for Comments
├── benchmarks/               # Performance tests
└── prototypes/              # Proof of concepts
```

## Import Resolution

### Package Imports

```typescript
// External package
import { ref } from "@vue/reactivity";

// Main package
import { createTemporal, period, divide } from "minuta";

// Specific adapter
import { createNativeAdapter } from "minuta/native";
import { createDateFnsAdapter } from "minuta/date-fns";

// Submodule imports
import { usePeriod } from "minuta/composables";
import { UNITS } from "minuta/units";
```

### Export Structure

The package provides multiple entry points:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./native": "./src/native.ts",
    "./date-fns": "./src/date-fns.ts",
    "./date-fns-tz": "./src/date-fns-tz.ts",
    "./luxon": "./src/luxon.ts",
    "./temporal": "./src/temporal.ts",
    "./composables": "./src/composables/index.ts",
    "./units": "./src/units/index.ts"
  }
}
```

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Source files | camelCase.ts | period.ts, createTemporal.ts |
| Test files | {name}.test.ts | divide.test.ts, exports.test.ts |
| Multi-adapter tests | {name}.multi-adapter.test.ts | split.multi-adapter.test.ts |
| Type files | types.ts | types.ts |
| Config files | {tool}.config.ts | vite.config.ts, vitest.config.ts |
| Documentation | kebab-case.md | coding-standards.md |
| Story files | {epic}.{story}.{description}.md | 009.02.rename-createPeriod-to-period.md |

## Module Boundaries

### Public API

Only files explicitly exported from index.ts:

```typescript
// packages/minuta/src/index.ts
export { createTemporal } from "./createTemporal";
export { usePeriod } from "./composables";
export { 
  period, divide, merge, split, 
  next, previous, go,
  contains, isSame,
  isToday, isWeekday, isWeekend 
} from "./operations";
export { UNITS } from "./units";
export { defineUnit, hasUnit, getRegisteredUnits } from "./unit-registry";
export type { Period, Unit, Temporal, Adapter } from "./types";
```

### Internal Modules

Not part of public API:
- Test utilities
- Implementation details
- Build artifacts

## Version Control Patterns

### Ignored Patterns

```
# Dependencies
node_modules/
package-lock.json (except root)

# Build outputs
dist/
coverage/
*.tsbuildinfo

# IDE
.vscode/
.idea/

# Environment
.env
.env.local
```

### Tracked Patterns

```
# Source code
src/**/*.ts

# Configuration
*.json
*.config.ts

# Documentation
*.md

# Examples
examples/**/*
```

## Development Workflow Files

| File/Directory | Purpose | Location |
|----------------|---------|----------|
| .ai/debug-log.md | AI agent debug log | Root |
| CHANGELOG.md | Version history | Root |
| TODO.md | Task tracking | Various |

This source tree structure supports:
- Clear separation of concerns
- Efficient monorepo development
- Type-safe module boundaries
- Comprehensive documentation
- Scalable architecture
