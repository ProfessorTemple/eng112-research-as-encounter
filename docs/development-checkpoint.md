# Living Field Notebook | Development checkpoint

**Updated: November 27, 2026 (conceptual integration implemented; latest fully verified baseline 54/54 including discernment).** This is an instructor/developer roadmap, not a student assessment or a promise of a release date.

[Stable classroom notebook](https://professortemple.github.io/eng112-research-as-encounter/field-notebook-preview.html) · [Experimental notebook](https://professortemple.github.io/eng112-research-as-encounter/field-notebook-next-preview.html) · [Commit history](https://github.com/ProfessorTemple/eng112-research-as-encounter/commits/main/) · [Actions](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions)

## How to read this tracker

- **Implemented:** code is committed, not necessarily browser-verified.
- **Targeted checks:** syntax or isolated logic checks have been executed; not a substitute for end-to-end testing.
- **Research only:** isolated experiments on synthetic data; no student-facing AI deployment.
- **Release gate:** evidence required before changing the stable classroom notebook.

No single percentage is assigned to an open-ended pedagogical project. Development readiness and intellectual ambition are different dimensions.

## Latest verification evidence

- [Expanded conceptual discernment browser audit](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46028502524): **54/54 passed**, including the nine conceptual comparisons at both 390px and 1440px Chromium viewports. This is the latest verified baseline before the conceptual fluency extension.

- [Browser audit of concept implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46026879086): 52/52 Chromium tests passed, across 390px and 1440px viewports.
- [Browser audit with the new concept-specific test](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46026899762): 52/54 passed. The two failures occur while importing the synthetic fixture, before concept selection. The test omitted acceptance of the backup confirmation; [test setup corrected](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/76be30c10541ed0a8841146577a89c684bf8eb73). [Rerun](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46027805181) succeeded; [subsequent full audit](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46027894419) confirmed **54/54 passed** at both viewports.
- The four curated concept resource destinations were checked against the actual article, publishers and professional ethics statement. Source reading and citation verification still belong to the student.
- [Relational semantic experiment](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46023750147): both model jobs completed successfully. Actual development results below. No model is approved for live student text.

| Retrieval approach | Intended links retrieved (of 9) | Unwanted invitations (of 3) | Missed intended links | Incorrect links among 9 |
|---|---:|---:|---:|---:|
| Existing lexical | 0 | 0 | 9 | 0 |
| MiniLM direct | 1 | 3 | 0 | 8 |
| E5 direct | 3 | 3 | 0 | 6 |
| MiniLM concept bridge | 8 | 3 | 0 | 1 |
| E5 concept bridge | 9 | 3 | 0 | 0 |
| MiniLM agreement-only | 1 | 2 | 8 | 0 |
| E5 agreement-only | 3 | 2 | 6 | 0 |

Development examples are deliberately challenging, small and synthetic. A correct candidate ID does not establish that a question is pedagogically useful, and top-1 approaches without abstention necessarily intervene in negative cases. Explicit restraint is now evaluated separately, and a second [12-case transfer suite](../tests/relational-semantic-transfer-cases.json) covers practical skill, naming, labor, autonomy, positionality, consent, quoted voice and independent direction. It was authored after the first results, so it is not a blinded independent holdout. [Updated four-job experiment](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46027908964) completed successfully. Seven isolated restraint checks passed. The actual concept-bridge-plus-explicit-restraint results were:

| Model and suite | Acceptable (of 12) | Intended links retrieved | Unwanted invitations | Incorrect links | Missed opportunities |
|---|---:|---:|---:|---:|---:|
| MiniLM development | 10 | 8/9 | 1 | 1 | 0 |
| E5 development | 11 | 9/9 | 1 | 0 | 0 |
| MiniLM transfer | 11 | 7/7 | 1 | 0 | 0 |
| E5 transfer | 10 | 6/7 | 1 | 1 | 0 |

Both models still propose unrelated administrative passages. E5 selected an oar-material distractor instead of practical knowing in the tidal-skill transfer case; MiniLM selected a superficial forest-related distractor in the shared-word trap development case. A restraint gate for explicit student direction is valuable but not a general relevance gate. No automatic semantic retrieval is ready for deployment. Do not tune on these cases and claim independent validation.

## Roadmap and current position

| Workstream | Status | Evidence / next gate |
|---|---|---|
| Classroom foundation: Discover, Research, Write; sources, thesis, local backups and exports | Existing stable classroom version | Keep stable preview untouched; confirm current assignment fit and backup recovery before any migration. |
| Student-centered writing session: draft-first order, return-to-draft, remembered navigation, selected-passage reflection | Implemented in experimental notebook | [Session implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/cb10a923cbe309df2fde6a8223906ea447b0d214) ; writing-session regression passed at both viewports in the 52/54 run. |
| Intellectual continuity: pick up an open question, saved discovery or unfinished reflection | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/0944f6cae5923731354ac45a3dc24a651f474d37); reload, import and focus regression passed. |
| Developmental memory: compare original records, thesis versions and discoveries | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/f5b89a95783bbe2e65b22f95083814591bc5046a); comparison browser regression passed; full accessibility review remains open. |
| Metacognition and intellectual flexibility: student-selected inquiry practices | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/1598185cd7f198cefc88246a3cd5e00807b4bb50); no learner classification; practice bridge browser regression passed. |
| Adaptive companionship: keep one invitation, explore transfer, withdraw it | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/47a02c2ce707d5be6ac4aad4d8a7f8b398fc2385); invitation retirement and cross-session regression passed; targeted storage failure still to verify. |
| Attentive paragraph review: bounded language cues and restraint | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/c37a618596c48cca4ab01c8ef0a0b305fab3ee42); attentiveness browser regression passed; not general semantic understanding. |
| Relational discovery: one transparent, optional shared-word suggestion | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/5ac991d0fba5b0306b7fc7664046eec77ebca3c0); student rejection browser regression passed. |
| Deeper relational semantic retrieval | Research only | [Twelve synthetic cases](../tests/relational-semantic-development-cases.json), [experiment](../tests/relational-embedding-experiment.mjs), [validator](../tests/relational-semantic-review.cjs). Lexical baseline: three appropriate abstentions, nine missed opportunities, zero incorrect suggestions on deliberately difficult examples. Both model jobs completed; concept bridging shows promise but failed abstention cases. Both transfer and restraint experiments executed; results above. Unrelated-passage suggestions remain a deployment blocker. |
| Conceptual emergence: experience-to-concept encounter | First student-directed implementation committed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/1f9386d5f529529e6d7b340e837cceba0367a2c6); four curated resources with source, caution and optional research term. Concept-specific browser test passed at both viewports in 54/54 audit. Automatic concept recognition is not implemented. |
| Conceptual discernment: nine working distinctions across four curated concept encounters | Implemented; syntax and registry checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/5741ce3c12d56adfbb806432d27010bc4209d); [expanded regression](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/d07d76aa13525105f3f5836b6caa0faae7bb2a51) passed at both viewports (54/54 audit linked above). No automatic concept selection or score. Working distinctions are illustrative and require discipline-specific source reading. |
| Conceptual fluency: applying a chosen concept in another context and exploring limits of fit | Implemented; syntax and eight-case registry checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/92402a4319392acdfba505d32b3b38d30fe5ad2d); [expanded regression](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/2e7717796da4fb7d2e1a6d00453933ab74477962) execution in progress at checkpoint ([audit](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46031301534)). Four concepts, eight contrasting illustrative situations plus a student-chosen encounter, optional support and an existing-trail handoff. No scores, automatic answers or auto-insertion. |
| Conceptual integration: one chosen conceptual question at an existing thesis or essay field | Implemented; syntax and five-target registry checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/9fb28a1ac983dc9fd100d1ac839117945da2db30); [expanded regression](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/1d5cc2019547891c3e6d621b3f16ef5514dd2bf9). Routes to observation, interpretation, significance, working thesis or essay; optional selected distinction; no auto-insertion or new draft. Invitation is session-only and dismissible. [Audit](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions/runs/46031576238) queued at checkpoint. |
| Classroom release readiness | Not yet established | Full browser regression, mobile and keyboard testing, screen-reader review, real-device Safari, backup/restore and export compatibility, instructor-led pilot and consent/privacy review. |

## Current development frontier

1. Verify the expanded conceptual fluency and integration regressions, targeted storage failure and keyboard/focus behavior; review real-device Safari, screen-reader and export compatibility.
2. Investigate the remaining unrelated-passage abstention and topical distractor problems using independently authored examples and an evidence/relevance gate. Require independently authored, adjudicated evaluation before deployment. Report unwanted invitations separately from missed opportunities.
3. Develop evidence-grounded concept retrieval on synthetic records; compare it against the existing curated question-led experience. Do not expose automatic semantic suggestions until evidence and restraint gates are satisfied.
4. Audit the entire student writing session again, reduce duplicate guidance, and conduct an instructor-led pilot before any classroom promotion. Next pedagogical frontier: student-owned accounts of what changed after a conceptual encounter, comparing existing thesis versions and intellectual-trail discoveries without duplicate reflection requirements or claims of mastery.

## Non-negotiable release gates

- Student authorship, privacy, explicit choices and permission boundaries remain intact.
- No mandatory intellectual profile, mastery score, hidden learner classification, auto-written essay, automatic transmission of student prose, or automatic publication.
- Suggested concepts and relationships remain provisional, grounded in actual words and accurately attributed resources; students can decline or continue independently.
- No promotion from experimental to stable solely because code exists or isolated checks pass. End-to-end verification and instructor approval are required.
- Maintain a safe way back to the stable notebook and a locally exportable backup.

## Updating this checkpoint

Update after each substantive development block: commit links, evidence obtained, current limitation, and next meaningful advancement. Do not mark browser or model checks passed without observed results. Review this file before resuming development in another chat.
