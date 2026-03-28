# Framework packages re-export too much from core

**Source:** External review (★★☆ Framework integrations)
**Effort:** Medium

## Problem

Vue, React, Svelte packages re-export core operations (divide, merge, split, etc.). This muddies the import story — users don't know if they should import from `@allystudio/usetemporal` or `@allystudio/usetemporal-vue`.

## Fix

Framework packages should only export framework-specific bindings (hooks, composables, stores, components). Core operations should always come from `@allystudio/usetemporal` directly.
