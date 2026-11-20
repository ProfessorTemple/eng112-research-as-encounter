# The Living Three-Story Thesis Studio — instructional architecture (ENG 112)

## Purpose
The three-story thesis is **one developing interpretive insight**, not a mechanical three-part essay outline, a thesis proved by three reasons, or a generic "What / So What / Now What" worksheet.

**Floor 1: Observed foundation** — a specific lived encounter, relationship, pattern, scene, or verifiable finding. Students must distinguish what they noticed from what they assume.

**Floor 2: Arguable interpretation** — the intellectual turn. What do the observations *mean*? What tension, contradiction, complication, or new relationship do inquiry and other voices suggest? Could a thoughtful reader reasonably question this interpretation? Can evidence address it?

**Floor 3: Earned significance** — the broader human, ecological, cultural, ethical, scientific, or philosophical implication of *that particular interpretation*. Avoid unsupported generalizations and required calls to action. Good third stories develop the insight's implications without overstating knowledge.

**Form:** the thesis can be two to four connected sentences near the end of an opening section, or become legible through a creative nonfiction essay's narrative movement. Do not force students to write isolated What/So What/Now What paragraphs or copy any example.

**Research sequence:** encounter → developing question → first interpretation → research/other voices/keywords → contradiction or discovery → revised interpretation → earned larger meaning. A thesis may become more complex and honestly uncertain rather than simply more confident.

**Technical guardrails:**
- The program never creates an unsupported thesis, claims to have checked sources, or transmits student drafting to an LLM.
- "Bring my three stories together" *only joins the student's own sentences* and is expressly marked as a rough draft, not a finished thesis.
- Students control writing and can save dated versions, load earlier versions with confirmation, and use their own bibliography/essay editing tools independently.
- Data remains in the unchanged browser storage key `eng112-research-encounter-v2`; JSON project backups and research journal include thesis content.
- The existing `what`, `soWhat`, and `nowWhat` fields stay intact and continue to be accessible from the Return Changed space.
- `thesis-studio.js` loads after `keyword-bank.js`, so thesis reflections and keyword bank contributions can both be included in a local journal.

## External pedagogical reference points
- [USC Writing Center, "The Three-Story Thesis"](https://dornsife.usc.edu/writingcenter/wp-content/uploads/sites/119/2023/01/three-story-thesis.pdf) — all floors depend on the first; second floor interprets; third opens broader implications without an unsupported leap.
- [UC Berkeley, "Building a Thesis... From the Ground Up"](https://slc.berkeley.edu/writing-worksheets-and-other-writing-resources/building-thesis) — observation, arguable interpretation, broader significance.
- [Hamilton College Writing Center, "Developing Your Thesis"](https://www.hamilton.edu/academics/centers/writing/writing-resources/developing-your-thesis) — complexity, nuance, evidence and a thesis that may take multiple connected sentences.

## Tests completed on source
- All inline scripts, keyword-bank.js, analytics.js, and thesis-studio.js parse.
- Mocked interaction test confirmed: load most recent saved research question, assemble only student-written story text, store two versions, render history cards, persist thesis fields, preserve journal text, and append thesis writing to journal export.
- Verified original writing editor, analytics opt-out control, storage key, and Word-export button IDs remain present.

## Browser tests still required
1. Load https://professortemple.github.io/eng112-research-as-encounter/ after GitHub Pages publishes.
2. Visit Explore Connections, write a question, optionally use the latest saved question, then click "Explore a working three-story thesis".
3. Add story 1, 2, and 3; assemble; revise. Save a first version. Alter the claim and save a second. Compare and restore an earlier version.
4. Refresh page, check that the question, edited thesis, evidence note and version history remain.
5. Test transfer via backup (download JSON in Return Changed), then restore on a different browser/device after ensuring that other browser has no important unsaved work.
6. Confirm "Return to the Living Thesis Studio" in the Annotated Bibliography and normal Word exports still work.
7. Keyboard and VoiceOver: tab through all thesis fields/buttons, listen to focus labels, status feedback, snapshots; inspect mobile layout and contrast.
8. Optional student-centered check: test whether students recognize the *difference* between a one-story observation and an arguable second-story interpretation, and whether they can explain why their third story is warranted.

**Status:** Source-code and simulated interaction checks passed; do not claim a full live browser / accessibility certification until tested.
