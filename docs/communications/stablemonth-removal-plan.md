# Communication Plan: StableMonth Removal from Core

## Overview
This plan outlines how we'll communicate the removal of `stableMonth` from the core library and its future availability in the `minuta/calendar` package.

## Key Messages

### Primary Message
"We're improving Minuta's architecture by moving calendar-specific units like `stableMonth` to a dedicated package, keeping the core library focused on fundamental time operations."

### Supporting Messages
1. **No functionality lost** - stableMonth will be available in minuta/calendar
2. **Better architecture** - Separation of concerns between time math and display
3. **Smaller core** - Users who don't need calendar features get a smaller bundle
4. **Future-ready** - Calendar package can grow without affecting core

## Stakeholder Communication

### 1. Internal Team Communication

**When**: Sprint Day 1 (Before Implementation)
**Channel**: Team Slack/Discord
**Message Template**:
```
🔧 Technical Debt Sprint Update

Starting today, we're removing the unimplemented `stableMonth` type from core as part of our technical debt reduction. This aligns with our "Calculus for Time" philosophy.

Key points:
- stableMonth was defined but never implemented in core
- Will be properly implemented in new minuta/calendar package
- Improves separation of concerns
- No impact on existing functionality

See architecture decision: /docs/architecture/decision-calendar-units-separation.md
```

### 2. GitHub Release Notes

**When**: With next release
**Where**: GitHub Releases, CHANGELOG.md
**Content**:
```markdown
## Breaking Changes

- **Removed `stableMonth` from core types**: The `stableMonth` unit has been removed from the core package. It will be available in the upcoming `minuta/calendar` package for calendar-specific functionality.

### Migration Guide

If you were using the `stableMonth` type (note: it was never implemented):

```typescript
// Before (type only, no implementation)
import { STABLE_MONTH } from 'minuta'

// After (coming soon)
import { stableMonth } from 'minuta/calendar'
```

For now, continue using the manual stable month pattern shown in our documentation.
```

### 3. Documentation Updates

**When**: Sprint Day 1-2
**Where**: VitePress docs
**Updates Required**:

1. **API Reference** - Remove stableMonth from unit types
2. **Stable Month Example** - Add migration notice
3. **Architecture Guide** - Explain package separation
4. **FAQ** - Add "Where is stableMonth?" question

**Migration Notice for Docs**:
```markdown
::: tip Coming Soon
The `stableMonth` unit is moving to the `minuta/calendar` package 
to better separate display concerns from core time operations. 

Until the package is released, use the pattern shown below.
:::
```

### 4. Community Announcement

**When**: After implementation (Sprint Day 3-4)
**Channels**: Discord, Twitter, Reddit (if applicable)
**Message**:
```
📢 Minuta Architecture Update

We're improving our library structure! Calendar-specific units like stableMonth 
are moving to a dedicated minuta/calendar package.

Why?
✅ Cleaner separation of concerns
✅ Smaller core bundle
✅ Better for tree-shaking
✅ Room for more calendar features

The core remains focused on fundamental time operations - our "Calculus for Time" philosophy in action! 

Learn more: [link to blog post/docs]
```

### 5. Direct User Communication

**For users who might be affected** (search GitHub for stableMonth usage):
- Open issues mentioning stableMonth
- PRs referencing stableMonth
- Discussions about calendar functionality

**Template for Direct Response**:
```
Hi [username],

Heads up that we're moving `stableMonth` to a dedicated calendar package as part of our architecture improvements. Since you've shown interest in this functionality, wanted to let you know:

1. stableMonth is being removed from core (it was never implemented)
2. It will be properly implemented in minuta/calendar
3. This provides better separation of concerns and smaller bundles

The calendar package will be released soon with full stableMonth support plus other calendar-specific utilities.

See our architecture decision here: [link]
```

## Timeline

| Day | Communication Activity |
|-----|----------------------|
| Sprint Day 1 AM | Internal team notification |
| Sprint Day 1 PM | Update documentation with notices |
| Sprint Day 3 | Prepare release notes |
| Sprint Day 4 | Community announcement draft |
| Post-Sprint | Publish announcements |
| Next Release | Include in release notes |

## FAQ Preparation

### Q: Why remove stableMonth?
A: It was never implemented and belongs in a calendar-specific package, not core time operations.

### Q: When will the calendar package be available?
A: Development is planned for the next sprint cycle.

### Q: Will this break my code?
A: Only if you were importing the STABLE_MONTH constant, which had no implementation.

### Q: What about other calendar features?
A: They'll be added to minuta/calendar, keeping core minimal.

## Success Metrics

- [ ] No confused users posting issues
- [ ] Clear understanding in community
- [ ] Positive reception to architecture improvement
- [ ] Smooth migration for any affected users

## Response Plan

If users react negatively:
1. Emphasize no functionality was actually removed (wasn't implemented)
2. Show commitment to calendar package development
3. Highlight benefits of cleaner architecture
4. Provide timeline for calendar package release