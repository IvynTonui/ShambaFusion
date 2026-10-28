# Screenshot and demonstration checklist

Use synthetic accounts and a separate demonstration database. Never show `.env`, tokens, private user records or database credentials.

- [x] Desktop landing page: branding, navigation, hero and working entry points.
- [ ] Mobile viewport at 390px: navigation, header, forum and resource cards without horizontal clipping.
- [x] Register a participant (API); verify login and logout (browser).
- [ ] Create a discussion; verify populated card and persistence after refresh.
- [ ] Filter category, edit own discussion, add comment, like/unlike.
- [x] Share a link; open it after login and verify the correct discussion.
- [x] Verify a second participant cannot edit/delete the first participant's post (API).
- [ ] Administrator: upload a reviewed PDF, download it and verify contents, delete only the disposable resource.
- [x] Verify participant upload/metrics API access is forbidden.
- [ ] Verify report charts on the target MySQL version.
- [ ] Capture current forum, resources, admin and mobile screenshots; replace historical images only after review.
- [ ] Record a 60–90 second walkthrough: problem → participant workflow → admin view → architecture/testing.
- [ ] Before GitHub publishing, inspect staged files and ensure no credentials/uploads/build outputs are included.

Keep unfinished checks unchecked. No claim that the entire checklist passed is implied by this file.

Current populated screenshots and exact live API results are in docs/VERIFICATION.md and docs/API_VERIFICATION.json. Unchecked administrator and publishing steps remain outstanding.
