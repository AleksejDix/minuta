# Getting Started

Welcome to Minuta! This guide provides a quick overview to get you up and running.

## What is Minuta?

Minuta is a revolutionary time library featuring the unique `divide()` pattern for hierarchical time management. It provides a **single pure functional API** optimized for maximum tree-shaking and portability.

## Quick Start Path

Follow these steps to get started:

1. **[Installation](#installation)** - Add Minuta to your project
2. **[Learn the Core Operations](#core-operations)** - Understand the primitives
3. **[Basic Example](#basic-example)** - See it in action
4. **[Examples](/examples/)** - Explore complete implementations

## Installation

::: code-group

```bash [npm]
npm install minuta
```

```bash [yarn]
yarn add minuta
```

```bash [pnpm]
pnpm add minuta
```

```bash [bun]
bun add minuta
```

:::

## Core Operations

All functionality is exposed through pure functions for maximum flexibility and tiny bundles.

| Operation | Description |
|-----------|-------------|
| [`period()`](/api/operations/period) | Create periods from dates or ranges |
| [`divide()`](/api/operations/divide) | Split periods into smaller units |
| [`next()` / `previous()`](/api/operations/next) | Navigate between periods |
| [`go()`](/api/operations/go) | Jump multiple periods at once |
| [`contains()` / `isSame()`](/api/operations/is-same) | Compare and analyze periods |
| [`split()` / `merge()`](/api/operations/split) | Reshape periods as needed |

## Key Features

✨ **Revolutionary divide() Pattern**
```typescript
// Split any period into smaller units
const months = temporal.divide(year, 'month')
const days = temporal.divide(month, 'day')
```

🎯 **Single, Tree-Shakable API**
- Pure functions imported directly
- Works in any runtime (Node, browser, serverless)

⚡ **Zero Core Dependencies**
- Native adapter requires no external libraries
- Optional adapters for date-fns, Luxon, Temporal

🔄 **Reactive by Design**
- Built on `@vue/reactivity`
- Works with Vue, React, and vanilla JS

## Basic Example

Here's a quick example using the pure operations:

```typescript
import { period, divide, next } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date(), 'month')
const days = divide(adapter, month, 'day')
const nextMonth = next(adapter, month)

console.log(`${month.start.toDateString()} has ${days.length} days`)
console.log(`Next month: ${nextMonth.start.toDateString()}`)
```

## Framework Integrations

- [Vue 3 composables](/frameworks/vue) ship today via `minuta-vue`, complete with provide/inject helpers.
- [React hooks](/frameworks/react) live in `minuta-react`, exposing `Minuta()` and `usePeriod()`.
- [Svelte](/frameworks/svelte) and [Angular](/frameworks/angular) integrations are already scoped and will follow the same pattern so every major framework feels native.

## Learn More

### Concepts & Patterns
- [divide() Pattern](/guide/divide-pattern) - Hierarchical breakdowns
- [Operations](/guide/operations) - Navigation, comparison, and more

### Reference
- [API Reference](/api/) - Complete operation listing

## Ready to Start?

→ Install `minuta`, copy the basic example above, and expand it using the divide() pattern.
