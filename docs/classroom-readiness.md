# Classroom readiness: Living Field Notebook

Decision: **development candidate only; not approved for classroom promotion.** Keep the current student-facing version and URLs unchanged. The experimental URL is for instructor review using invented work: https://professortemple.github.io/eng112-research-as-encounter/field-notebook-next-preview.html

## Readiness checks and evidence

| Gate | Current evidence / action |
| --- | --- |
| Core functional regression | Last clean 76/76 (46042452334). Independence audit 46042796457: 74 passed, two failures of the older focus assertion after intentionally changing dismissal to return to the active writing field. Corrected assertion in d1b7ea9ff53721b20e28e4b110e6d1a694752a01; rerun required. |
| Automated accessibility | 18 configurations, zero automated violations/no document overflow (46042773965); decorative glyph contrast remains a manual check. |
| Other browser engines | New WebKit and Firefox smoke workflow; inspect results before marking gate complete. Linux WebKit is not actual macOS/iOS Safari. |
| Actual device, keyboard, assistive technology | Not yet conducted. Use the checklist below; don't infer compliance from axe. |
| Privacy and student authorship | Local-only assistance; verify request payloads and privacy disclosures with synthetic text; no live AI, automatic essay writing or submission. |
| Pedagogical validation | Protocol prepared; human outcomes unknown. |
| Instructor approval and voluntary pilot | Not yet conducted/approved. |

## Instructor dry run (use a fresh browser profile and synthetic content)

1. Begin with a fictional observation, build a search, save a note with a locator, work on a thesis and draft a paragraph. Decline optional help; check the draft remains intact and focus returns to writing.
2. Stop at the third thesis floor, close/reopen, and confirm the same stage and wording return. Save a full JSON backup; verify a fresh browser can import it. Import replaces the active project, so use only invented material here.
3. Download the final essay Word file, open it in Word, inspect headings, formatting, figures and references. Confirm private reflections aren't unexpectedly included. Download research journal separately. Save a synthetic PDF on the shelf and verify it is not in the JSON backup.
4. Test actual Safari on Mac and if available iPhone/iPad, plus Chrome/Edge or Firefox. Use Tab/Shift+Tab, Enter/Space, visible focus, screen-reader names/roles/states (VoiceOver/NVDA), 200%/400% zoom, narrow viewport, reduced motion and forced colors. Check entry, navigation, editor, optional help, errors, exports and restoration. Inspect contrast of decorative glyphs. 
5. With developer tools in a clean profile, inspect network requests while entering a unique synthetic phrase; it must not be transmitted. Confirm any aggregate visit analytics are separate from prose. Test interrupted network, blocked storage, and explicit backup recovery. Do not assume a page can reload offline.
6. Confirm course instructions (word count, source requirements, deadlines, APA and grading expectations) with the instructor. Do not change assignment expectations through a software update.

Use [student journey walkthrough](student-journey-walkthrough.md) for uncoached usability and [pedagogical validation](pedagogical-validation.md) for optional formative evaluation. Record build, device/browser, issue, severity, reproduction steps, workaround, and reviewer decision. No student names or private writing in issue records.

## Suggested student message (hold until instructor approval)

Hello, everyone!

I am continuing to develop My Living Field Notebook, our optional research and writing companion. If we try the updated version in class, you will be able to explore it using a short practice encounter rather than risking your current essay. The notebook offers questions and ways to organize your own thinking; it does not write your essay or submit your work. You can decline its suggestions, use your usual writing tools, or ask me for help.

Your writing is saved in the browser you use. Keep a separate JSON backup of your notebook and an editable Word copy of your essay. Article PDFs are separate. Do not clear browser data or switch devices without a backup. If you already have work in the current notebook, keep using that version unless I give you migration instructions.

Your feedback about what feels useful or confusing is welcome and voluntary. Trying the experimental version is not a new graded requirement. Our existing assignment instructions and deadlines remain the same.

## Pilot boundaries and recovery

- Proposed scope: one optional low-stakes practice session, with instructor present or an equivalent accessible alternative; do not move an active final essay into an experimental build before verification.
- No new graded requirements, no student tracking or mandatory upload. No individual research data or linked before/after records without the appropriate institutional determination/approval and consent.
- Before promotion, pin a reviewed commit, retain the known-good stable revision and URLs, confirm storage compatibility with synthetic copies, and verify deployment. Preview and stable stores can differ; use exported backups for migration, not assumptions about local storage.
- If work loss, a blocked core task, privacy exposure, inaccessible operation, or export corruption occurs, pause the pilot. Keep the student's existing browser data untouched, export what remains if possible, and offer the stable notebook, Word or paper. Do not tell a student to clear browser data.
- Instructor approval is required after all blocking issues are resolved. Document any residual limitations and available alternatives. Neither a passing automated suite nor a small formative pilot establishes ADA/WCAG compliance or educational effectiveness.
