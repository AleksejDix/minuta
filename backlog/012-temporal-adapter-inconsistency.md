# Temporal adapter mixes native Date and Temporal API

**Effort:** Medium (1 hour)
**Savings:** ~0 lines (consistency improvement)

## Problem

Some units use native Date (year.startOf, month.startOf, day, week), others use Temporal API (hour, minute, second, year.endOf). This is confusing and could produce subtle differences.

## Fix

Pick one approach and apply consistently. Since the adapter is called "Temporal", use Temporal API everywhere. Or document why native Date is used for certain units (performance).
