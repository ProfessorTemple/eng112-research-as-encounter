# Accessibility and Analytics Review — November 20, 2026

## Scope and status
Student-facing ENG 112 **Research as Encounter** Version 3.4. This is a **source-level preliminary review**, not a certification that the deployed application or exported DOCX documents satisfy WCAG.

### Legal and technical reference
- U.S. Department of Justice's ADA Title II digital-accessibility rule identifies WCAG **2.1 Level AA** as the required standard for public community-college digital content.
- DOJ April 2026 interim rule moved the covered-entity deadlines to April 26, 2027 (population 50,000+) and April 26, 2028 (smaller public entities/special districts). Confirm the institutional classification with college accessibility staff. Existing effective-communication/accessibility obligations remain.
- Aim to test **WCAG 2.2 AA** as an additional voluntary quality target.
- Primary references: https://www.ada.gov/resources/2024-03-08-web-rule/ and https://www.w3.org/TR/WCAG22/

## Completed in the source (requires browser verification)
- The eight ARIA tabs now have roving `tabindex`, keyboard Arrow/Home/End controls, and focus moves onto the newly activated tab.
- Added a keyboard skip link to main content.
- Added reduced-motion CSS.
- Added accessible editor help text referenced with `aria-describedby`.
- Preserved existing essay contenteditable and hidden textarea, formatting, document export, and local-storage keys.
- Four script blocks parse without JavaScript syntax errors.

## Required hands-on accessibility checks
1. **Keyboard only (Safari and Chrome):** Tab from page start through skip link, all tabs, form controls, editor, backup and download buttons. Test arrows/Home/End within tabs, Shift+Tab, and no keyboard traps. Test add-source and collapsible sections.
2. **Mac VoiceOver (Command+F5):** Listen to tabs, selected state, entry instructions, dynamically generated suggestion cards, saved source lists, field names, status feedback, error messages, and DOCX download links. Confirm focus after changing stages.
3. **Mobile/zoom:** iPhone Safari and 200–400% browser zoom; no clipping, overlapping controls, horizontal overflow, or loss of information. Test Android and assistive mobile navigation if available.
4. **Contrast:** Analyze computed foreground/background contrast for body text, muted hints, selected/unselected buttons, placeholder text, form errors and controls. WCAG requires at least 4.5:1 normal text, 3:1 large text and applicable controls; do not assume colors pass from source alone.
5. **Rich-text editor:** VoiceOver editing, paragraph indentation, formatting buttons, caret retention, paste, selection, undo and autosave; use accessible plain-text editing fallback if any user cannot operate contenteditable reliably.
6. **Exported Word:** Check DOCX title/headings structure, reading order, tables (if any), visual figure alt text/captions, links, document language, accessibility checker results in Word/Pages; manual APA and screen-reader tests.
7. **Dynamic results:** Assert suggestion text and changed state are conveyed clearly (not a stream of overwhelming live announcements). Controls added with JavaScript must receive names, roles and keyboard behavior.
8. **Automated scan:** axe-core or WAVE, then manual tests. Automated scans cannot certify compliance.
9. **Student-centered test:** Invite a student using assistive technology and the college's accessibility services to test with informed choice, not an obligation to disclose disability.
10. **Fallback:** Keep Word/Pages route available and supply equivalent support while barriers are resolved.

## Analytics and bot safety
- GoatCounter site configured: `research-as-encounter.goatcounter.com`. This is a non-secret public site code; no passwords in public GitHub.
- Current integration uses browser-created count-only image requests, not an external analytics script. No field text, essay text, notes, names, search terms, or user-uploaded sources are sent.
- Privacy opt-out is available under privacy details at bottom of page; honors Do Not Track and Global Privacy Control.
- Added **Check anonymous analytics connection** button. Pixel image load means the request reached a responding endpoint, **not necessarily that GoatCounter saved or counted the event**.
- The analytics dashboard had shown **No data received** as of the last user report. A live dashboard confirmation is STILL PENDING.
- GoatCounter explicitly warns pixel traffic may include more bots because it's harder to filter: https://www.goatcounter.com/help/pixel
- **Security distinction:** Public visitors can't change `index.html` on GitHub Pages without GitHub account/repo write permission, but bots can load or interact with the public app and inflate analytics. Local browser projects remain separated. Security relies on GitHub account protection (2FA/passkeys, repo permissions), safe HTML construction and avoiding malicious code from third-party scripts.
- Don't add CAPTCHA to the app unless an actual abusive operation emerges; CAPTCHA can itself introduce accessibility barriers.
- Analytics are aggregate interaction counts, not proof of distinct students, source-reading comprehension, or completed exports.

## Live tests to perform with instructor
1. Visit https://professortemple.github.io/eng112-research-as-encounter/ and hard-refresh to ensure latest deployed code loads.
2. Expand **Privacy and optional anonymous usage statistics**, confirm counts enabled and opt-out currently unchecked.
3. Click **Check anonymous analytics connection**. Note whether image request loads.
4. Open Find Sources, select a curated book, then open Writing Studio.
5. Return to https://research-as-encounter.goatcounter.com; refresh after a short wait and inspect whether the test, stage and book event counts appear.
6. If absent, test browser content blockers/network protection and inspect Safari Develop > Web Inspector > Network for requests to research-as-encounter.goatcounter.com/count. Do not send private writing or a personal data export when troubleshooting.
7. Compare with another browser if Safari blocks tracking. A successful browser event would be enough to verify provider integration; do not expect every visitor to be counted.
8. Run keyboard/VoiceOver tests described above before claiming ADA/WCAG conformance.
