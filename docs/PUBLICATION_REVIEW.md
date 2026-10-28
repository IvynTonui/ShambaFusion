# GitHub publication review — October 28, 2026

Feature development is frozen. This preparation stages the existing implementation,
security changes, tests, reconstructed schema, guarded seed and verification scripts,
documentation, environment examples, dependency lockfiles, branding and current
populated screenshots. No commit, push, deployment or database operation is part
of this publication review.

Intended fetch/push remote: `https://github.com/IvynTonui/ShambaFusion.git`.

## Excluded

Private `.env` files, `backend/.demo-credentials.json`, runtime uploads,
`node_modules`, build outputs and database dumps are ignored and excluded from
the index. The only SQL included is `backend/database/schema.sql`, a structure-only
reconstruction containing no user records or credentials. Demo resources are
re-created by the seed; private runtime files are not shipped.

Screenshots 07, 08 and 09 show fictional demo participants and are included.
Superseded captures 05 and 06 remain local and unstaged; README uses the current
populated screenshots. Earlier academic images remain in existing Git history.

## Sensitive-data review

Publication candidates were compared against private local database/JWT values
and generated demo passwords without printing those values. No matches were found.
Text patterns for private keys, common provider tokens and literal JWTs produced
no candidate findings. A literal secret in `backend/tests/security.test.js` is a
synthetic test-only value and is never used by the application configuration.
This is a targeted review, not a guarantee that every possible secret format is detected.

The former `backend/hash-password.js` contained a hardcoded password in the
initial application commit (`557d5a8`), still reachable in Git history. The staged
version removes that literal and uses an environment variable instead. No current
private local credential matched the scanned historical text blobs. If that old
password was ever used for a real account or reused elsewhere, rotate the affected
credential before publication. History was deliberately not rewritten; removing
historical material would require a separate approved operation.

## Remaining concerns

- Last verified audit: backend zero known dependency findings; frontend two moderate
  React Router findings remain. Repository publication does not authorize deployment.
- Fresh database initialization remains unverified and the reconstructed schema
  differs from the live schema. Documentation states these limits explicitly.
- Administrator success paths are not verified with a live administrator session.
- Large media/bundle sizes and legacy lint debt remain documented.

## Final approval workflow

Review `git diff --cached --stat`, `git diff --cached`, and `git status --short`.
Confirm no private paths appear in `git diff --cached --name-only`. Only after final
approval, create the commit and push to the verified origin. Do not force-push or
rewrite history as part of the normal publication step.
