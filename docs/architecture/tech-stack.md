# Technology Stack

This document provides a comprehensive overview of the technology stack used in the Minuta project, including runtime environments, frameworks, build tools, and dependencies.

## Core Technologies

### Runtime Environment

| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| Node.js | 18+ | Development runtime | ESM module support required |
| TypeScript | ^5.7.3 | Type system | Strict mode enabled |
| ESM | Native | Module system | `"type": "module"` in all packages |

### Core Dependencies

| Package | Version | Purpose | Usage |
|---------|---------|---------|-------|
| @vue/reactivity | ^3.5.18 | Reactive system | Core reactivity without Vue framework |

### Build Tools

| Tool | Version | Purpose | Configuration |
|------|---------|---------|---------------|
| Vite | ^6.0.7 | Build system | Fast HMR, ESM-first |
| vite-plugin-dts | ^4.4.0 | TypeScript declarations | Generates .d.ts files |
| npm workspaces | Built-in | Monorepo management | Native npm feature |

### Testing Stack

| Tool | Version | Purpose | Features |
|------|---------|---------|----------|
| Vitest | ^3.2.4 | Test runner | Vite-powered, Jest-compatible |
| @vitest/coverage-v8 | ^3.2.4 | Code coverage | V8-based coverage |
| jsdom | ^26.0.0 | DOM environment | For testing browser-like behavior |

### Development Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| Prettier | Code formatting | .prettierrc.json |
| TypeScript | Type checking | tsconfig.json |
| Changesets | Release management | For versioning |

## Package Architecture

### Core Package (minuta)

The heart of the library providing:
- Factory function (`createTemporal`)
- Period operations (`divide`, `merge`, `split`)
- Reactive composables (`usePeriod`)
- Type definitions
- Unit registry system

**Dependencies**: Minimal - only @vue/reactivity

### Adapter Packages

Adapters integrate different date libraries:

| Adapter | External Dependency | Version | Notes |
|---------|-------------------|---------|-------|
| adapter-native | None | - | Uses native JS Date |
| adapter-date-fns | date-fns | ^4.2.0 | Popular FP date library |
| adapter-luxon | luxon | ^3.5.0 | Immutable date library |
| adapter-temporal | @js-temporal/polyfill | ^0.5.1 | Future TC39 standard |

### Meta Package (minuta)

Single consolidated package including:
- Core functionality
- Native adapter
- All adapter integrations
- Calendar units

For users who want to get started quickly.

### Documentation Stack

| Tool | Version | Purpose | Location |
|------|---------|---------|----------|
| VitePress | Latest | User documentation | /vitepress |
| Markdown | - | All documentation | .md files |
| Shiki | Built-in | Syntax highlighting | Via VitePress |

## Development Dependencies

### TypeScript Configuration

Shared TypeScript configs via `@minuta/tsconfig`:
- Base configuration
- Strict type checking
- ESM module resolution
- Path mappings for monorepo

### Testing Utilities

| Utility | Purpose | Location |
|---------|---------|----------|
| Multi-adapter tests | Ensure adapter compliance | core/test/multi-adapter-test-template.ts |
| Mock adapter | Testing without real dates | core/test/functionalMockAdapter.ts |
| Shared test utilities | Common test helpers | core/test/ |

## External Integrations

### Version Control

| System | Purpose | Configuration |
|--------|---------|---------------|
| Git | Source control | .gitignore |
| GitHub | Repository hosting | Actions for CI/CD |

### Package Registry

| Registry | Purpose | Scope |
|----------|---------|-------|
| npm | Package distribution | @minuta/* |

### Continuous Integration

| Service | Purpose | Triggers |
|---------|---------|----------|
| GitHub Actions | CI/CD | On push, PR |

## Framework Support

While the core is framework-agnostic, examples exist for:

| Framework | Example Location | Integration Method |
|-----------|-----------------|-------------------|
| Vue.js | /packages/minuta-vue/examples | Direct reactivity integration |
| React | /packages/minuta-react/examples | Via wrapper hooks |
| Svelte | /packages/minuta-svelte/examples | Via stores adapter |

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | Latest | Full support |
| Firefox | Latest | Full support |
| Safari | Latest | Full support |
| Edge | Latest | Full support |

**Note**: Library is ESM-only. Legacy browser support requires bundler transformation.

## Performance Considerations

### Bundle Size Targets

| Package | Target | Current | Notes |
|---------|--------|---------|-------|
| minuta | <6KB | ~5KB | Minified + gzipped |
| Adapters | <2KB each | Varies | Excluding dependencies |

### Optimization Tools

- Tree-shaking via ESM
- Vite's rollup optimization
- No side effects (`"sideEffects": false`)

## Security Considerations

### Dependency Management

- Regular updates via Dependabot
- Security audits with `npm audit`
- Minimal dependency footprint
- No runtime dependencies except @vue/reactivity

### Type Safety

- Strict TypeScript configuration
- No `any` types in public API
- Runtime validation for critical paths

## Future Technology Considerations

### Potential Additions

1. **Bun Support**: As Bun matures, ensure compatibility
2. **Deno Support**: Evaluate Deno module resolution
3. **Native Temporal API**: Remove polyfill when standard is adopted
4. **WASM**: For performance-critical operations

### Deprecated/Avoided Technologies

1. **CommonJS**: ESM-only going forward
2. **Class-based APIs**: Functional approach only
3. **Moment.js patterns**: Avoid mutable API design
4. **Global modifications**: No Date prototype extensions

## Development Environment Setup

### Prerequisites

```bash
# Required
node >= 18.0.0
npm >= 8.0.0

# Recommended
VS Code with extensions:
- ESLint
- Prettier
- TypeScript
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/AleksejDix/minuta.git

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start development
npm run dev
```

## Technology Decision Rationale

### Why @vue/reactivity?

1. **Framework-agnostic**: Works without Vue
2. **Proven reactivity**: Battle-tested system
3. **Small footprint**: ~10KB for reactivity
4. **Excellent TypeScript support**

### Why Vite?

1. **ESM-first**: Aligns with our module strategy
2. **Fast HMR**: Better developer experience
3. **Unified tooling**: Build and test with same tool
4. **Active ecosystem**: Well-maintained

### Why Monorepo?

1. **Coordinated releases**: Version packages together
2. **Shared tooling**: One set of configs
3. **Easier testing**: Test adapters against core
4. **Better DX**: Everything in one place
