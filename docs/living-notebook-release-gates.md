# Living Field Notebook 1.0 release gates

Keep the current student-facing notebook unchanged until instructor approval. Experimental work belongs in field-notebook-next-preview.html.

1. Persistence: browser tests at mobile and desktop verify saving, refresh, reload, removal and blank input. Existing audit 45924707292 passed 22 tests.
2. Portability: test JSON round trip in a fresh browser context, older backups, malformed trail entries, readable TXT, and removal. Keep private trail out of final essay exports by default. Explicitly label full backups and journals as containing personal reflections.
3. Writing integration: offer an optional student-selected reflection in thesis revision and conclusion planning. Never insert text automatically or infer intellectual growth from activity counts. Test empty trail, changed thesis, removal and keyboard operation.
4. AI evaluation: use docs/ai-inquiry-comparative-protocol.md and the scorecard. No live service until consent, institutional approval, authenticated backend, limits and retention policy are established. Local-only release is permitted. Compare actual outputs on fresh held-out cases; require human review and zero critical failures.
5. UX: test a first-time student journey from encounter to export, returning student recovery, and mobile navigation. Keep optional features collapsed; measure completion, confusion and unnecessary steps rather than feature count.
6. Accessibility/privacy/reliability: automated axe checks plus keyboard and screen reader manual review, zoom/reflow, focus, labels, status announcements, contrast, offline behavior, storage failure and backup recovery. No claim of compliance from automation alone. Verify no student text leaves the browser.
7. Pilot: instructor approves scope and student-facing instructions. Invite voluntary feedback without collecting private writing or grading participation. Ask whether students found sources, understood thesis movement, retained control, and experienced less confusion. Record accessibility issues and regressions. Instructor signs off before stable promotion; keep rollback copy.

For every cycle record commit, actual audit result, unresolved failures, and release decision. Do not treat a pending run as a pass. No live AI or stable deployment is authorized by this document.
