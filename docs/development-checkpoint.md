# Living Field Notebook | Development checkpoint

**Updated: November 27, 2026.** This is an instructor/developer roadmap, not a student assessment or a promise of a release date.

[Stable classroom notebook](https://professortemple.github.io/eng112-research-as-encounter/field-notebook-preview.html) · [Experimental notebook](https://professortemple.github.io/eng112-research-as-encounter/field-notebook-next-preview.html) · [Commit history](https://github.com/ProfessorTemple/eng112-research-as-encounter/commits/main/) · [Actions](https://github.com/ProfessorTemple/eng112-research-as-encounter/actions)

## How to read this tracker

- **Implemented:** code is committed, not necessarily browser-verified.
- **Targeted checks:** syntax or isolated logic checks have been executed; not a substitute for end-to-end testing.
- **Research only:** isolated experiments on synthetic data; no student-facing AI deployment.
- **Release gate:** evidence required before changing the stable classroom notebook.

No single percentage is assigned to an open-ended pedagogical project. Development readiness and intellectual ambition are different dimensions.

## Roadmap and current position

| Workstream | Status | Evidence / next gate |
|---|---|---|
| Classroom foundation: Discover, Research, Write; sources, thesis, local backups and exports | Existing stable classroom version | Keep stable preview untouched; confirm current assignment fit and backup recovery before any migration. |
| Student-centered writing session: draft-first order, return-to-draft, remembered navigation, selected-passage reflection | Implemented in experimental notebook | [Session implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/cb10a923cbe309df2fde6a8223906ea447b0d214) and browser regression added; execution not verified. |
| Intellectual continuity: pick up an open question, saved discovery or unfinished reflection | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/0944f6cae5923731354ac45a3dc24a651f474d37); verify reload, import and focus. |
| Developmental memory: compare original records, thesis versions and discoveries | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/f5b89a95783bbe2e65b22f95083814591bc5046a); browser and accessibility verification open. |
| Metacognition and intellectual flexibility: student-selected inquiry practices | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/1598185cd7f198cefc88246a3cd5e00807b4bb50); no learner classification. |
| Adaptive companionship: keep one invitation, explore transfer, withdraw it | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/47a02c2ce707d5be6ac4aad4d8a7f8b398fc2385); verify storage failure and retirement. |
| Attentive paragraph review: bounded language cues and restraint | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/c37a618596c48cca4ab01c8ef0a0b305fab3ee42); not general semantic understanding. |
| Relational discovery: one transparent, optional shared-word suggestion | Implemented; targeted checks passed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/5ac991d0fba5b0306b7fc7664046eec77ebca3c0); preserves student rejection. |
| Deeper relational semantic retrieval | Research only | [Twelve synthetic cases](../tests/relational-semantic-development-cases.json), [experiment](../tests/relational-embedding-experiment.mjs), [validator](../tests/relational-semantic-review.cjs). Lexical baseline: three appropriate abstentions, nine missed opportunities, zero incorrect suggestions on deliberately difficult examples. Two model runs unverified. |
| Conceptual emergence: experience-to-concept encounter | First student-directed implementation committed | [Implementation](https://github.com/ProfessorTemple/eng112-research-as-encounter/commit/1f9386d5f529529e6d7b340e837cceba0367a2c6); four curated resources with source, caution and optional research term. Automatic concept recognition is not implemented. |
| Classroom release readiness | Not yet established | Full browser regression, mobile and keyboard testing, screen-reader review, real-device Safari, backup/restore and export compatibility, instructor-led pilot and consent/privacy review. |

## Current development frontier

1. Verify all outstanding browser regressions on the experimental notebook, including cross-session restoration, focus, storage failure, and rejection of suggestions.
2. Review actual model benchmark outputs. Compare against lexical and abstain-only baselines, then test a genuinely independent holdout set. Report unwanted invitations separately from missed opportunities.
3. Develop evidence-grounded concept retrieval on synthetic records; compare it against the existing curated question-led experience. Do not expose automatic semantic suggestions until evidence and restraint gates are satisfied.
4. Audit the entire student writing session again, reduce duplicate guidance, and conduct an instructor-led pilot before any classroom promotion.

## Non-negotiable release gates

- Student authorship, privacy, explicit choices and permission boundaries remain intact.
- No mandatory intellectual profile, mastery score, hidden learner classification, auto-written essay, automatic transmission of student prose, or automatic publication.
- Suggested concepts and relationships remain provisional, grounded in actual words and accurately attributed resources; students can decline or continue independently.
- No promotion from experimental to stable solely because code exists or isolated checks pass. End-to-end verification and instructor approval are required.
- Maintain a safe way back to the stable notebook and a locally exportable backup.

## Updating this checkpoint

Update after each substantive development block: commit links, evidence obtained, current limitation, and next meaningful advancement. Do not mark browser or model checks passed without observed results. Review this file before resuming development in another chat.
