# ENG 112 Living Field Notebook · Accessibility and sharing QA

**Updated:** November 22, 2026
**Preview:** https://professortemple.github.io/eng112-research-as-encounter/field-notebook-preview.html
**Status:** Accessibility-aware prototype. **Not certified ADA/WCAG compliant.** Student-wide deployment requires manual and automated validation, including assistive technology.

## Regulatory and design basis
The U.S. Department of Justice ADA Title II web rule applies to public community colleges and adopts **WCAG 2.1 Level AA** as the technical standard. DOJ's April 2026 interim final rule extended the population-based compliance dates to **April 26, 2027** for public entities of 50,000+ and **April 26, 2028** for smaller or qualifying special-district entities. The institution's governing-entity facts and other obligations require institutional review. WCAG 2.2 AA is used here as an additional design target, particularly focus visibility and target sizing.

Primary sources:
- https://www.ada.gov/resources/2024-03-08-web-rule/
- https://www.w3.org/TR/WCAG21/
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/tutorials/forms/grouping/

## Changes implemented in this preview
- **Save backup · Share journey · Return** quick-action bar; buttons have visible and accessible names and at least 44 CSS px minimum height.
- Sharing report grouped with HTML `fieldset` and `legend`; all choices have clickable labels.
- Selection privacy: only explicitly selected sections enter the report. Full opening freewriting, current essay, and earlier draft snapshots are **off by default**. A complete JSON project backup is a separate control and is not shared automatically.
- Preview before export, real semantic HTML headings, feedback instructions, escape-safe text rendering, and a labeled live-status message.
- Editable `.docx` export using Word paragraph heading styles (Title, Heading 1, Heading 2); accessible standalone HTML export with `lang="en"`, headings, and main landmark; print option to Save as PDF. **A PDF printed from a browser must be checked for tags and reading order before it is called accessible.**
- Keyboard focus returns to the Share button on Close or Escape; active notebook pages are programmatically focused when navigating.
- Selection change invalidates the previously generated preview and disables export until reviewed again.
- The original full research app, including the Writing Studio's existing rubric-related structural prompts, is preserved. No upload, email, peer synchronization, or remote tracking was added.

## Automated and source-level checks completed
1. All preview JavaScript modules and inline scripts parse without syntax errors.
2. All new input groups have legends, checkbox labels, and radio button labels.
3. All 252 IDs in the preview HTML are unique; there is one `lang="en"` root and a skip link.
4. Share report selection tested with scripted browser-DOM simulation; sections not selected do not appear in the generated HTML or Word XML.
5. Malicious-looking user text is XML/HTML-escaped rather than injected into the report.
6. DOCX ZIP container generated with expected `PK` signature and ZIP end record; heading styles are in the Word XML. **Opening the generated file in Word and running Accessibility Checker is still required.**
7. The Save backup and Return actions were exercised in DOM simulation; Return navigated to the previous visited page; the report preview enabled export after student review.
8. New text colors were sampled for contrast: examples #3c5a48 on #f6f9f3 (7.19:1), #203d2b on #fbfdf9 (11.63:1), #25583f on white (8.25:1), #3d6548 on #fbfdf9 (6.51:1). **This is not a complete automated contrast audit of the original application's inherited styles.**
9. The production `index.html` and its regular saved-work key were not modified.

## Mandatory manual acceptance tests before class-wide use

### Keyboard and focus
- Starting from the address bar, use only Tab, Shift+Tab, Enter, Space, and arrow keys. Verify Skip to content, Discover/Research/Write, subpages, Save, Share, Return, source links, forms, and exports are reachable and usable.
- Confirm a visible keyboard focus indicator that is not covered by the sticky Save/Share/Return toolbar.
- Confirm opening Share takes focus to its heading, Close and Escape restore focus to Share, and no keyboard trap exists.
- Confirm Return restores the previous notebook page and focus goes to a relevant heading.
- Confirm editing selections invalidates the report preview and disabled export controls.

### Screen readers
- Safari + VoiceOver on macOS and, where practicable, NVDA + Firefox or Chrome on Windows.
- Verify heading hierarchy, navigation landmarks, fieldset group names, individual checkbox/radio labels, meaningful page titles, source links, and save/error/preview status announcements.
- Pay particular attention to the **original** freewriting interface, interactive discovery map, reading journal, and **rich-text Writing Studio editor**, which were inherited from earlier versions and have not had a full assistive-technology audit.
- Verify the report and Word file have heading navigation and logical reading order.

### Vision, zoom, and interaction
- Test 200% text zoom, 400% page zoom, 320 CSS-pixel viewport reflow, Safari iPhone, high-contrast settings, reduced motion, keyboard focus size, and contrast across the *entire original application*.
- Confirm no content or control is clipped or requires horizontal scrolling except genuinely two-dimensional diagrams.
- Check 24px minimum pointer target recommendations from WCAG 2.2, and avoid relying only on color to indicate selected states.

### Save and sharing
- Write in the original Freewriting Studio and Writing Studio. Save and download a full backup; reload; restore from the file on a different browser.
- Export peer report with only concepts and thesis. Verify freewriting and essay do not appear.
- Export instructor report including sources, thesis versions, and dated discoveries. Verify only opted-in content appears.
- Explicitly select essay snapshots and check dates, full draft content, and that the files open and remain editable.
- Open generated Word report in Microsoft Word and run **Review → Check Accessibility**. Inspect heading style structure, file properties, and reading order.
- Open standalone HTML in a browser and perform keyboard + screen-reader checks.
- Print to PDF; check tags, title, reading order, content extraction, text accessibility, and any need for remediation using an appropriate PDF accessibility tool. Do not treat “looks correct” as accessible.
- Verify Moodle / Canvas upload and download with student permissions; peers should receive a file only if the student chooses to share it.
- Validate the existing source database links through authenticated PCC access.

## Important boundaries
**Share journey** downloads files for the student to choose how to distribute (Moodle, Canvas, email, or a writing conference). There is **no automatic submission** and no public share link. A full `.json` backup contains more information than the selected share report and should not be used as a default peer-review attachment.

Thesis timestamps and essay snapshots are a useful self-documented intellectual trail, **not tamper-proof evidence of participation or authorship**. The existing Review my draft feature provides structural checks and questions, not a verified interpretive grade against the entire course rubric.

## Release gate
Request review by the college's accessibility/ADA support staff and a short student usability pilot, including assistive technology users when feasible. Fix any findings, then retest. Only then consider replacing the original student-facing homepage or declaring formal conformance.
