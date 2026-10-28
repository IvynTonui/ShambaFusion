# Verification — October 28, 2026

## Current results

- 13 focused Node tests passed. Database boundaries and successful-upload filesystem writes are stubbed in these tests.
- 30 live authenticated API checks passed against localhost:3001 and the verified local `shamba_fusion` database. Machine-readable results: `API_VERIFICATION.json`.
- Live checks cover participant login, real registration (attempting an admin role still creates a participant), guest denial, participant admin/metrics/upload denial, categories, two pages of discussions, detail links, comments, like counts/status, category filtering, notifications, resource browsing and contents of all three downloads.
- A new controlled test discussion passed create, owner edit, nonowner edit/delete denial, comment, like/unlike and owner deletion. Only that newly created discussion and its cascaded test comment were deleted. Pre-existing records were not edited or deleted by these checks.
- Browser verified: fictional participant login; populated forum; displayed comments; pagination; category filtering; copy/share URL opening the correct detail; resource library; successful download; logout; protected detail redirecting to login; login returning to that detail.
- Populated screenshots: `images/07-populated-forum.png`, `08-populated-resources.png`, `09-populated-mobile.png`. Desktop 1280×800 and mobile 390×844 inspected. All displayed community activity is fictional.
- Two initial seed runs produced identical counts. Seed transactions verified pre-existing user records unchanged, including password hashes and roles. No new administrators or privileges were introduced.
- Backend startup and live database access succeeded. Backend JavaScript syntax and Git whitespace checks passed. Frontend production build passed.

Final row counts: Users 8; Categories 6; Posts 12; Comments 24; PostLikes 25; Resources 3; Notifications 3. The initial seed inserted 24 likes; the final database includes a subsequent demo interaction. A final rerun preserved current records and interactions.

## Remaining limits

- Successful administrator upload/deletion, user administration and reports were not tested through an administrator session. No administrator was created, promoted or impersonated. Participant denial is tested.
- Browser registration and browser post editing/deletion were not exercised; their live API paths are tested.
- Fresh schema import/setup remains unverified. Earlier isolated MySQL initialization crashed; the existing live database is healthy. The reconstruction differs from live types and foreign-key deletion rules; see `DEMO_DATA.md`. No migration/import/reset occurred.
- Final backend audit reported zero vulnerabilities. Final frontend audit reported two moderate React Router / React Router DOM findings requiring a major upgrade. SSR hydration is unused; destinations are internal and login return URLs reject backslashes and protocol-relative URLs. These mitigations are not a patched-dependency claim. Resolve or explicitly accept remaining advisories before public deployment; local portfolio review is distinct from deployment approval.
- Build warns about a JavaScript chunk over 500 kB. Media remain large. Existing lint debt remains.
- Likes still use multiple queries and are not guaranteed consistent under concurrent requests. The demo seed only initializes likes for newly inserted demo posts; it does not overwrite user interactions on reruns.
- No commit, push or deployment performed.

## Runtime

The shell's Homebrew Node previously failed due to a missing simdjson library.
Checks used the desktop app's bundled Node. If needed:

```sh
export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH"
```

Use `http://localhost:5173` with API `http://localhost:3001` to match default CORS.
Both local services responded during these checks. Restart the backend after source changes.
