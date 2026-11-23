# Living Field Notebook · GoatCounter Analytics Pilot (November 22, 2026)

## Goal
Estimate whether students are **opening and exploring** the new ENG 112 Field Notebook, not identify who they are or collect what they write.

**Preview:** https://professortemple.github.io/eng112-research-as-encounter/field-notebook-preview.html

## Configuration
- Reuses the GoatCounter **site code** already present in the original Research as Encounter `analytics.js`: `research-as-encounter`.
- Uses count-only 1×1 GIF requests to `https://research-as-encounter.goatcounter.com/count`; does **not** load third-party JavaScript.
- Fixed canonical preview path sent to GoatCounter: `/eng112/living-field-notebook-preview`. This distinguishes preview visits from original-app visits (`/research-as-encounter`).
- The regular `index.html` and its existing analytics.js are **unchanged**.
- GoatCounter account availability, dashboard access, and receipt of *live student counts* have **not** been independently confirmed. The presence of a site code in source is not proof that it is connected to a live account.

## Aggregate activity names

| Group | Paths sent to GoatCounter | Interpreting the data |
| --- | --- | --- |
| Opening preview | `/eng112/living-field-notebook-preview` | Approximate visiting sessions, not distinct enrolled students |
| 3 spaces | `field-notebook-space-discover`; `field-notebook-space-research`; `field-notebook-space-write` | Which main area gets opened |
| 8 sections | `field-notebook-stage-begin`; `field-notebook-stage-explore`; `field-notebook-stage-search`; `field-notebook-stage-read`; `field-notebook-stage-journal`; `field-notebook-stage-return`; `field-notebook-stage-biblio`; `field-notebook-stage-writing` | Section navigation events |
| Backup | `field-notebook-backup-requested` | Clicks, not proof of a successful file download |
| Sharing | `field-notebook-share-opened`, `field-notebook-share-preview-requested`, `field-notebook-share-word-requested`, `field-notebook-share-html-requested`, `field-notebook-share-pdf-requested` | Student clicks, not proof of submission or receipt |
| Return | `field-notebook-return-used` | Clicks to go back to previous notebook page |
| Optional diagnostics | `field-notebook-diagnostic` | Teacher/test count, not a real student |

## Privacy protections
- Strict allowlist of fixed event names. **No** student name, ID, freewriting, search term, personal research question, source title, interview details, selected report, filename, URL query parameter, or essay content is transmitted in pixel URLs.
- Sends `r=` (no referrer); `rnd` is a cache-buster, **not** a visitor identifier.
- Respects browser Do Not Track and Global Privacy Control signals.
- Uses existing local opt-out key `rae-anonymous-usage-optout-v1`, shared with original Research as Encounter.
- If browser storage cannot be read, collection is disabled (fail closed).
- The in-app **Privacy and optional anonymous usage statistics** section documents what is counted and has a switch and diagnostic button.
- GoatCounter's standard aggregate statistics do not store IP addresses or unique tracking IDs; it temporarily uses IP and browser agent to approximate an eight-hour session. Institutional review is still recommended for third-party analytics in student-facing software.
- No individual student, author, course section, assignment grade, or proof of software use can be inferred from aggregate visit data.

## Test results
Source-level JS compilation and mocked browser interaction passed:
- Visit sent once with canonical path and without referrer.
- Broad Research and Journal navigation events sent with approved fixed names.
- Open Share was counted once, not when closed.
- Turning opt-out on stopped outgoing requests; turning it off allowed new event requests.
- No student content was present in the generated pixel URLs.

**Still needed:** Open preview in Safari and click **Privacy and optional anonymous usage statistics → Check anonymous analytics connection**. Verify that the diagnostic event appears in the appropriate GoatCounter dashboard. Disable your own counts with the opt-out checkbox afterward to avoid skewing student adoption statistics. Check normal students' browsers for ad/content blockers, which can suppress requests. The reporting dashboard needs actual account access.

## Reading the results
GoatCounter counts *visits* rather than true unique students. It uses an approximate session keyed temporarily by site, browser agent, and IP for up to 8 hours, as described in https://www.goatcounter.com/help/sessions. Shared classroom networks, multiple devices, blocking extensions, opt-outs, and page reloads can change the counts. Interpret these as **relative adoption signals**. Use an anonymous student survey or course poll if exact student adoption is essential.

**Privacy documentation:** https://www.goatcounter.com/help/privacy
**Count-only pixel documentation:** https://www.goatcounter.com/help/pixel
