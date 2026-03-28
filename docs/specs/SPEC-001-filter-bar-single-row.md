# SPEC-001 — Filter bar always renders in a single row

## Status
Done

## Problem
Filter bars on Executions and ContentReview pages were wrapping onto a second row at normal viewport widths, making the UI look broken and wasting vertical space above the table.

## Goal
All filter and pagination controls on every page render in a single horizontal row regardless of how many filters are visible.

## Requirements

1. The `.steps-header` container must never wrap its children (`flex-wrap: nowrap`)
2. If controls overflow, the row scrolls horizontally (`overflow-x: auto`) — it does not wrap
3. All filter controls (selects, inputs, date pickers) have a max height of `34px`
4. Selects used as filters have `min-width: 130px` — not wider
5. The pagination group (`pagination-box`) is always right-aligned via `margin-left: auto`
6. Adding a new filter to any page must not cause the row to wrap — new filters must fit within the existing row width

## Out of scope
- Responsive / mobile layout
- Collapsible filter panels
- Persisting filter state across sessions

## Design notes

CSS rules that enforce this:
```css
.steps-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.select-primary {
  min-width: 130px;
  height: 30px;
}

.filter-input {
  height: 30px;
}

.pagination-box {
  margin-left: auto;
  flex-shrink: 0;
}
```

## Acceptance criteria

- [x] ContentReview filter bar (status, execution ID, category, dates, pagination) fits in one row at 1280px
- [x] Executions filter bar (expand/collapse, status, workflow, execution ID, dates, pagination) fits in one row at 1280px
- [x] No `flex-wrap: wrap` on `.steps-header` in `style.css`
- [x] Adding a new `<input>` to the filter bar does not trigger wrapping
