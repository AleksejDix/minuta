# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the VitePress documentation site for Minuta - a revolutionary time library featuring the divide() pattern for hierarchical time management. The documentation follows the library's "Calculus for Time" philosophy, focusing on fundamental operations that compose into powerful solutions.

## Commands

```bash
# Development server with hot reload
npm run docs:dev

# Build documentation for production
npm run docs:build

# Preview production build locally
npm run docs:preview

# Install dependencies (if needed)
npm install
```

## Documentation Structure

The documentation is organized into several main sections:

### `/guide/` - User Guide
Progressive documentation from beginner to advanced:
- **Introduction**: What is Minuta, Getting Started, Installation, First App
- **Core Concepts**: divide() Pattern, Reactive Time Units, Adapters, Framework Agnostic
- **Patterns & Recipes**: Common patterns for divide(), navigation, time analysis, business logic
- **Framework Integration**: Examples for Vue, React, and other frameworks
- **Advanced Topics**: Performance optimization, testing, TypeScript, migration guides
- **Reference**: Performance tips, troubleshooting

### `/api/` - API Reference
Complete API documentation organized by function category:
- **Factory Functions**: `createTemporal()`
- **Operations**: Time division (`divide`, `split`, `merge`), Navigation (`period`, `next`, `previous`, `go`), Comparison (`isSame`, `contains`)
- **Utilities**: `isWeekend`, `isWeekday`, `isToday`
- **Types**: Period, Unit, Temporal, Adapter, UnitRegistry
- **Composables**: `usePeriod`
- **Unit System**: `defineUnit`, constants, getters

### `/examples/` - Code Examples
Working examples showing real-world usage:
- **Getting Started**: Basic usage, simple calendar
- **Calendar Examples**: Month calendar, year overview, mini calendar
- **Framework Examples**: Vue and React integrations
- **Recipes**: Business days, time slots, date range picker

### `/extensions/` - Extensions Documentation
Documentation for official extensions like Calendar Units

### `/resources/` - Educational Resources
Background information about time, dates, and calendars:
- JavaScript Date quirks
- Calendar systems history
- Date formats worldwide
- Timezones in browsers
- Week start days

## VitePress Configuration

The site is configured in `.vitepress/config.ts`:
- Navigation structure
- Sidebar organization
- Theme customization
- Search configuration (local search)
- Markdown options (line numbers, syntax highlighting)
- Social links and footer

## Writing Documentation

### Content Guidelines

1. **Follow the "Calculus for Time" Philosophy**
   - Emphasize fundamental operations over convenience methods
   - Show how complex operations compose from simple ones
   - Avoid documenting trivial wrappers or non-essential functions

2. **Code Examples**
   - Always show complete, working examples
   - Use TypeScript for type safety demonstration
   - Show both Vue and React examples where relevant
   - Include import statements

3. **Markdown Features**
   - Use code groups for package manager alternatives (npm/yarn/pnpm/bun)
   - Use tip/warning/danger containers for callouts
   - Enable line numbers in code blocks (configured globally)
   - Use proper heading hierarchy (h2, h3, h4)

### Example Code Block Patterns

```markdown
::: code-group

```bash [npm]
npm install minuta
```

```bash [yarn]
yarn add minuta
```

:::
```

```markdown
::: tip
The divide() pattern is unique to Minuta and enables hierarchical time subdivision.
:::
```

## Important Implementation Notes

1. **VitePress Version**: Using VitePress 1.6.3
2. **Vue Version**: 3.5.18 (for VitePress theme components)
3. **Type**: ES Module (`"type": "module"`)
4. **Theme**: Default VitePress theme with custom styling
5. **Search**: Local search provider (no external dependencies)

## Content Organization Principles

1. **Progressive Disclosure**: Start simple, gradually introduce complexity
2. **Composition Examples**: Always show how to compose operations
3. **Framework Agnostic**: Emphasize that the library works everywhere
4. **Minimal API Surface**: Document only fundamental operations
5. **Real-World Examples**: Show practical use cases, not toy examples

## Common Documentation Tasks

### Adding a New Guide Page

1. Create markdown file in appropriate `/guide/` subdirectory
2. Add entry to sidebar in `.vitepress/config.ts` under `/guide/` sidebar section
3. Follow existing page structure (frontmatter, headings, code examples)
4. Link from related pages

### Adding a New API Reference Page

1. Create markdown file in appropriate `/api/` subdirectory
2. Add entry to sidebar in `.vitepress/config.ts` under `/api/` sidebar section
3. Include: function signature, parameters, return type, examples, related functions
4. Show TypeScript types

### Adding a New Example

1. Create markdown file in appropriate `/examples/` subdirectory
2. Add entry to sidebar in `.vitepress/config.ts` under `/examples/` sidebar section
3. Include complete, runnable code
4. Show both the code and expected output/behavior

## Documentation Philosophy

This documentation follows the same minimalist philosophy as the library itself:

- **Fundamental over Convenient**: Document core operations, not wrapper functions
- **Composition over Configuration**: Show how to compose, not every possible use case
- **Trust the User**: Users can create their own abstractions
- **Quality over Quantity**: Better to have fewer, excellent examples than many mediocre ones

## Notes for AI Agents

When working on documentation:
- Check if a feature is truly fundamental before documenting it extensively
- Question whether a convenience function should exist at all (per library philosophy)
- Prefer showing composition patterns over adding new convenience methods
- Keep the API surface minimal - every addition must justify its existence
- Remember: the library aims to be like "calculus for time" - fundamental operations only
