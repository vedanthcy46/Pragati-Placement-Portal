# Nomination Data Strategy — Source of Truth

## Decision

The **drive-scoped system is the source of truth** for the College Student
Nomination UI:

| Concern | Storage | API |
|---|---|---|
| Drive eligibility | `drive_eligibility` (CGPA cutoff, allowed branches) applied over `eligible_students` view | `GET /api/placement-drives/:id/eligible` |
| Nominations | `drive_nominations` | `GET /api/placement-drives/:id/nominations` |
| Nominate (single + bulk) | `drive_nominations` | `POST /api/placement-drives/:id/nominate` `{ studentIds }` |
| Shortlist (bulk) | `drive_nominations.status='Shortlisted'` + `drive_shortlists` | `PUT /api/placement-drives/:id/shortlist` `{ studentIds }` |
| Mark selected | `drive_nominations.status='Selected'` | `PUT /api/placement-drives/:id/select` `{ studentId }` |
| Withdraw / remove | `drive_nominations.status='Withdrawn'` | `DELETE /api/placement-drives/:id/nominations/:studentId` |

Every request carries the selected drive id in the URL; the Drive Selector
controls real data retrieval and mutations, and cross-drive isolation is
guaranteed by the `drive_id` key on every row.

Re-nomination of a previously withdrawn student reinstates the row
(`ON CONFLICT ... DO UPDATE SET status='Nominated' WHERE status='Withdrawn'`).

## Legacy system (`/api/college/*`) — deprecated

Tables `student_nominations` / `shortlisted_students` and endpoints under
`/api/college/nominations*`, `/api/college/shortlists*` are **retained only** for:

1. Aggregate statistics views (`NominationStatistics`,
   `/college/nominations/statistics`, company/department statistics).
2. The legacy `ShortlistedStudents` panel until it is migrated to
   `drive_shortlists`.
3. Backward compatibility for any external consumers.

They are marked `@deprecated` in
`services/studentNominationService.js`. **Do not use them for new nomination
mutations.**

## Migration / cleanup notes

- No legacy rows are deleted. Existing `student_nominations` data remains in
  place; where a drive relationship can be determined, rows can be backfilled
  into `drive_nominations` with a one-off script (not yet required — no
  production data depends on reconciliation).
- The former manual nomination form (`StudentNominationForm.jsx`) was removed
  from the flow because nominations now require a selected drive; the file
  itself is kept unused and can be deleted later.
- Bulk endpoints previously added to the legacy router
  (`POST /college/nominations/bulk`, `/bulk-shortlist`) were removed so bulk
  operations exist only in the drive-scoped API.
