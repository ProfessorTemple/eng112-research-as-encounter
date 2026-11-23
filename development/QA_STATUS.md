# ENG 112 Field Notebook · Next Preview QA and Release Gate

**Branch:** `development/field-notebook-guided-pathways-20261123`  
**Test entry point:** `field-notebook-next-preview.html` (not yet hosted; GitHub source link is not a runnable preview)  
**Live entry points:** unchanged. The development branch adds files only and does not modify existing pages.

## Implemented in the separate test page

- Expanded interdisciplinary concept lens collection: **44 lenses in eight families**, each with a plain-language definition, exploratory question, and local matching signals.
- Small, diversified lens suggestions based on the student's entered language, with explanations; browse-all view; a local “Not my direction” correction; an option to create the student's own lens.
- Better direct freewrite-to-concept suggestions for uncertainty, sensory worlds, time, and appearance versus evidence. This is a deterministic local prompt system, **not** external or self-training generative AI.
- Contextual “One possible next move” hints, alternative return navigation, and improved focus when changing notebook panels.
- PCC source-access routes for books and databases, course-reserve “library use only” warnings, and more specific ProQuest Ebook Central descriptions.
- Expanded FAQs and optional one-minute guide.
- Separate `localStorage` key for this test page; separate IndexedDB for article PDFs; separate feedback state; GoatCounter disabled on this preview so tests do not contaminate production analytics.
- Reduced-motion CSS and focus-visible support. Accessibility target is WCAG 2.2 AA; this is a **target, not yet an audited compliance claim**.

## Checks performed

- All 15 inline script blocks in the test HTML compile without JavaScript syntax errors.
- All eight referenced external JavaScript dependencies exist on the development branch and parse successfully.
- Five simulated idea-matching scenarios were checked: Maximo's long relationship with a horse, grandmother's garden, urban heat and shade inequity, neurodivergent sensory experience, and an unseen human relationship. All produce relevant non-identical lens sets.
- Branch comparison shows **only additive files**. `field-notebook-preview.html` in development matches `main` exactly.
- Save, import, export and thesis code are present; separate test storage keys are wired. **Actual data migration and browser behavior have not yet been tested.**
- PCC library book search and A-Z database entry pages were checked publicly. Individual catalog holdings, subscription access and original essay availability remain unverified as detailed in `source-access-audit.md`.

## Explicit remaining work before student release

1. **Runtime testing** on desktop and mobile, including Safari and a second browser, with data entry, saving, refresh, backup export, import, and PDF shelf actions.
2. **Accessible interaction testing** with keyboard-only navigation, VoiceOver or NVDA, 200%/400% zoom, contrast checks, error announcements and reduced-motion preferences.
3. **Source-by-source verification** of individual catalog and database holdings and article URLs. Verify course-reserve locations and restrictions with PCC Library.
4. **Instructor review** of the writing prompts and lens suggestions for broad topics, false matches and course alignment.
5. **Shared learning/instructor dashboard** remains a separate, unimplemented feature requiring an approved privacy design and service. Only immediate local adjustment exists in this test version.
6. **Instructor approval** before publishing an instructor-only working test URL or merging any changes into the student-facing notebook. Do not merge this branch as a shortcut to production.
7. Test new pages and backups without exposing actual student writing. Use synthetic or redacted test material.

## Release policy

Protect existing students' saved data and avoid changes to live routes, document schemas, analytics settings, and local storage. Make additive updates in a separate test location, conduct compatibility checks, then consider a controlled release only after approval.
