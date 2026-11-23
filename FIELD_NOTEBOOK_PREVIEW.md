# Living Field Notebook · ENG 112 · preview v1

**Preview:** https://professortemple.github.io/eng112-research-as-encounter/field-notebook-preview.html

## Central design decision
This is **the original Research as Encounter application**, with all eight existing panels preserved, reorganized beneath three welcoming spaces. It is not a new platform with a separate bibliography or essay editor.

- **Discover**: Freewrite, Explore concepts (original Discovery Clearing/Keyword Bank)
- **Research**: Build a search, Find sources (Reading Grove), Reading Journal, Living thesis (original Return Changed and Living Thesis Studio)
- **Write**: Annotated bibliography, Writing Studio (including existing **Review my draft** and DOCX export)

The student is free to move between them. A single next-move invitation appears within the notebook compass; the very first action, with an empty notebook, is **Begin my freewriting**.

## Growing notebook trail
A collapsible **Notes from my journey** pane reads the *actual* saved project state and summarizes the student's original encounter, chosen ideas, saved searches, source shelf/reading notes, thesis work, and draft progress. It provides a student-controlled *What do I understand differently now?* prompt. The student's dated responses live in `state.fieldNotebook.discoveries` in the **same project backup**. The six summaries are links back to the original writing stages, not extra assignments.

## Extended source catalog within the original Reading Grove
The optional **Explore the extended Research Connections Library** panel loads the sibling repo's shared `data/sources.js` (currently 128 records) from the same GitHub Pages origin. Curated leads appear by default, and the student can search or include all records. The *Save to Reading Journal* action writes selected titles as entries in the app's established `state.customSources` shelf. *Take reading notes* opens the original existing journal with that source selected, preserving locators, source engagement, and source-conversation notes. No separate Discovery Bridge is required. The original 24 PCC books and curated course media remain available.

Suggestions are **search leads**, not verified evidence. The extended panel does not query PCC databases. Reserve titles use known direct records or prefilled title searches; e-book authentication may be needed. Citation details still require checking against the original source.

## Pilot storage safety
Only this preview changes `STORAGE` and `WKEY` to the unique key `eng112-living-field-notebook-preview-v1`. The original `index.html` and live `eng112-research-encounter-v2` storage key remain untouched. Anonymous analytics script is not loaded in this preview.

Students can **Back up my notebook**, or use **Import an existing Research as Encounter backup**, with an explicit warning that importing replaces **preview** work. Imported work triggers a reload so the original Writing Studio can restore its fields. Backups remain local to the browser; do not enter sensitive interview details.

## What is preserved, what is still planned
Preserved: the eight original panels; Freewriting Studio; keyword discovery; Boolean searches; Reading Grove; Reading Journal; Research Discovery Map; original Living Thesis Studio and saved versions; Annotated Bibliography; existing Writing Studio, DOCX export, and rule-based **Review my draft** checks.

Not yet merged: the separate Version 3.5 experimental thesis self-review features. The current *Review my draft* is a **limited structural/reflection checklist**, not a genuine essay-quality interpretation or a validated ENG 112 rubric score. This pilot does not run AI semantic analysis and must not imply that it can adjudicate authorial voice, credible synthesis, or authenticity.

## Review checklist
1. Open in a fresh Safari private tab or separate browser. Confirm the first visible path is **Discover**, with **Begin my freewriting** as the next invitation.
2. Freewrite, select concepts, build a search, choose a course source, and make one Reading Journal note with a locator.
3. In **Research → Find sources**, expand the extended library and search for `dogs AND communication`, save a result, then **Take reading notes**. Confirm the record appears in the existing journal shelf.
4. Visit **Research → Living thesis**; make Observation, Interpretation, Significance, and save a thesis version.
5. Visit **Write → Writing Studio**; draft a paragraph, click the existing **Review my draft**, and export a backup. Reopen the pilot and verify work persists.
6. Expand **Notes from my journey**, add a dated discovery, and reload. Verify it survives and remains present in the JSON backup.
7. Import an existing backup and confirm the real site's saved work remains untouched.
8. Keyboard and VoiceOver checks: buttons/labels, space controls, compact navigation, stage changes from existing buttons, title search links, and 320px mobile reflow.

The GitHub source and JavaScript have been inspected and basic static / simulated interaction tests performed, but **live Safari, VoiceOver, and PCC authentication tests still need human verification before requiring class-wide use**.

## Release discipline
Do not replace `index.html` or change existing student-facing source links until a brief student usability pilot confirms the new hierarchy is easier to understand. If migrating the preview to production later, plan an explicit storage migration / compatibility path so existing student notebooks are not lost.

## Save, Share, Return controls (November 22 accessibility-aware update)
The persistent notebook bar now offers **Save backup** (full project JSON), **Share journey** (opt-in student-selected report), and **Return** (previous notebook page). The share report offers native selection controls, preview, editable Word (.docx), semantic standalone HTML, and browser Print/Save as PDF. No direct sharing or submission is performed. Sources, thesis versions, dated discoveries, and draft snapshots can be included selectively; freewriting and all essay content default to excluded. Reports explicitly warn that dates/versions are not independent proof of authorship.

The accessibility QA record is in [FIELD_NOTEBOOK_ACCESSIBILITY_QA.md](FIELD_NOTEBOOK_ACCESSIBILITY_QA.md). WCAG 2.1 AA is the applicable ADA Title II technical benchmark for public entities, and WCAG 2.2 AA was used for additional design choices. The code and mock interaction tests passed; **live Safari, VoiceOver, zoom/reflow, and exported PDF/Word accessibility validation are still required** before any compliance claim or required classroom deployment.

## Privacy-conscious usage measurement (November 22, 2026)
This preview now includes `field-notebook-analytics.js`, which sends count-only GoatCounter pixel requests using the same `research-as-encounter` site code as the original application. Counts for the preview use a distinct `/eng112/living-field-notebook-preview` path and fixed event names for high-level notebook navigation, backup, and sharing report requests. Student writing, notes, keywords, sources, drafts, and identifying information are **not** included. Existing opt-out, DNT, and Global Privacy Control are respected. See [FIELD_NOTEBOOK_GOATCOUNTER.md](FIELD_NOTEBOOK_GOATCOUNTER.md). The original production application remains untouched; **live dashboard receipt has not been independently confirmed**.
