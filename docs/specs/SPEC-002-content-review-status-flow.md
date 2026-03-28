# SPEC-002 — ContentReview status flow and data integrity on PUT

## Status
Done

## Problem
Two bugs in ContentReview:
1. Clicking ✅ (mark as done) was sending `{ status: "DONE" }` to the PUT endpoint, which wiped all other fields (title, category, etc.) because the backend does a full replace. After the call, the row lost its title and could no longer be expanded.
2. Changing pagination or page size triggered a `load()` that returned partial fields from the server, again wiping locally-known data on rows that were already rendered.

Additionally, there was no way to revert a `DONE` item back, and `CANCELLED` status was not styled or filterable.

## Goal
Status transitions work correctly, row data is never lost on PUT or pagination change, and the full status lifecycle (PENDING → DONE → CANCELLED → DONE) is supported.

## Requirements

1. PUT requests for status changes must send the full row: `{ ...row, status: newStatus }`
2. After `load()`, new server data must be merged with existing local state — server data wins for shared fields, but local-only fields are preserved
3. ✅ button is visible when `status !== 'DONE'` (covers PENDING, ERROR, CANCELLED)
4. 🚫 button is visible only when `status === 'DONE'`
5. ✅ sets status to `DONE`; 🚫 sets status to `CANCELLED`
6. `CANCELLED` status renders with red badge (same as ERROR/FAILED)
7. Filter dropdown includes `CANCELLED` as an option
8. `saveEdit` must also preserve row data: update local state with `{ ...row, ...editForm }` not with the server response

## Out of scope
- Undo / history of status changes
- Bulk status update
- Status change confirmation dialog (except delete which already has one)

## Design notes

Unified status update function:
```js
const updateStatus = async (row, status) => {
  await fetch(`${API}/content-reviews/${row.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...row, status })
  })
  setRows(prev => prev.map(r => (r.id === row.id ? { ...r, status } : r)))
}
```

Merge strategy in `load()`:
```js
setRows(prev => {
  const prevMap = new Map(prev.map(r => [r.id, r]))
  return (json.data || []).map(r => ({ ...prevMap.get(r.id), ...r }))
})
```

Status badge — `statusClass` function must include cancelled in red group:
```js
if (['error', 'failed', 'cancelled'].includes(s)) return 'status status-red'
```

Button rendering:
```jsx
{row.status !== 'DONE' && (
  <button className="btn-icon success" onClick={() => updateStatus(row, 'DONE')}>✅</button>
)}
{row.status === 'DONE' && (
  <button className="btn-icon danger" onClick={() => updateStatus(row, 'CANCELLED')}>🚫</button>
)}
```

## Acceptance criteria

- [x] Clicking ✅ on a PENDING row sets status to DONE without losing title or category
- [x] Expanding a row after ✅ still shows the detail panel
- [x] Changing page size does not wipe row titles
- [x] Clicking 🚫 on a DONE row sets status to CANCELLED (red badge)
- [x] Clicking ✅ on a CANCELLED row sets status back to DONE
- [x] CANCELLED appears in the filter dropdown and filters correctly
- [x] No `{ status }` -only PUT calls anywhere in ContentReview
