---
layout: home

hero:
  name: "Minuta"
  text: "The divide() Pattern"
  tagline: Treat time as a hierarchy of periods with a tiny set of pure functions.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/AleksejDix/minuta

features:
  - icon: ∞
    title: Infinite Subdivision
    details: Divide any period (year, month, week, day, hour, etc.) into smaller units with a single call.
    link: /guide/divide-pattern

  - icon: ⚙️
    title: Pure Operations
    details: No builders or classes—just plain functions returning plain objects. Perfect for any framework.
    link: /guide/operations

  - icon: 📦
    title: Tiny Footprint
    details: Core operations plus the native adapter stay under 6 KB gzipped with flawless tree-shaking.
    link: /guide/bundle-size-optimization
---

## Quick Start

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

:::

```ts
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter({ weekStartsOn: 1 })

const year = period(adapter, new Date(), 'year')
const months = divide(adapter, year, 'month')
const days = divide(adapter, months[0], 'day')
```

## Why Minuta?

- **Better mental model** – think in terms of years, months, weeks, and days instead of brittle date arithmetic.
- **Plain data structures** – everything is a simple object, so rendering in any UI is straightforward.
- **Composable** – extend the hierarchy as far as you need by repeatedly calling `divide()`.

## Ready?

- Read the [Getting Started guide](/guide/getting-started)
- Explore the [divide() pattern](/guide/divide-pattern)
- Browse the [API reference](/api/)
