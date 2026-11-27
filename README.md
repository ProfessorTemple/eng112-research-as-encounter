# Research as Encounter

A browser-based research and writing companion for Pitt Community College **ENG 112 | Writing the Living World**.

**Launch the app:** https://professortemple.github.io/eng112-research-as-encounter/

## Living Field Notebook development

**[Instructor development checkpoint and roadmap](docs/development-checkpoint.md)**: current implementation, verified evidence, experimental research, release gates, and next steps.

[Stable classroom notebook](https://professortemple.github.io/eng112-research-as-encounter/field-notebook-preview.html) · [Experimental notebook](https://professortemple.github.io/eng112-research-as-encounter/field-notebook-next-preview.html)

The version 3.4 notes below describe the original Research as Encounter app, not the evolving experimental notebook.

## Current version: 3.4

The eight optional, revisitable stages are **Freewrite**, **Explore Connections**, **Build a Search**, **Find Sources**, **Reading Journal**, **Return Changed**, **Annotated Bibliography**, and **Writing Studio**. Students can begin wherever they are in the process and return to earlier stages.

### Annotated Bibliography

Build a separate APA student document with a title page, **Research Path Overview** (200–300 words with living three-story thesis), 5–8 keywords, **five outside-source annotations** (150–200 words each; at least three sources opened through PCC Library databases), **State of the Research Path** (150–200 words), revised question, and AI Use Disclosure. Course readings do not count toward the five outside sources. **No separate abstract or References page** in this assignment. Students author and verify their own annotations; no generative AI writing or source evaluation is provided.

### Final Writing Studio

Build a **1,200–1,500-word** creative nonfiction research essay using separate editable spaces for title, **required course abstract**, main essay, original figures, References, and AI Use Disclosure. A local checklist prompts students to consider the required McAnulty text, an additional course voice, **three outside sources**, **two community interviews**, and **three original visuals**. Draft-version snapshots preserve evolving text. Optional paragraph-level questions encourage scene, source braiding, uncertainty, and significance, without rewriting student prose.

A source-locator hint in the Reading Journal reminds students to cite stable page numbers, **paragraph/section locators for unpaginated online quotations**, and timestamps for video, as appropriate. APA guidance is available through [Purdue OWL](https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/index.html). Citation and source verification remain the student's responsibility.

### Saving and exporting

- Work is autosaved locally in the **same browser and device**, not to a cloud account; local browser storage can be cleared or unavailable.
- Use **Back up all work (.json)** often, especially before switching browsers/devices or clearing browser data. The JSON includes writing, research notes, and reduced-size copies of uploaded original visuals. A backup is restored through the app's existing Restore control.
- Download the bibliography or essay as a **genuine editable .docx** document. It opens in Microsoft Word and can be opened in Apple Pages. The generator supplies an APA-oriented student document with explicit page breaks, page numbers, 1-inch margins, double spacing, first-line paragraph indents, and hanging reference indents.
- Students **must review exported documents** in Word or Pages before submitting: verify page layout, source metadata, italics, figures and credits. Figures not yet uploaded are shown as explicit insert-image reminders.
- Keep the **original full-resolution photographs and drawings** outside the app. The copies kept in the browser are compressed to protect storage.
- No information is automatically submitted to Moodle or the instructor.

### Honest technical and ethical boundaries

Version 3.4 is entirely local and **does not provide live generative AI**, search PCC's library database, check source text against the originals, or run usage analytics. Its feedback is a transparent set of prompts and limited checks, not a grading system. The source note and APA feedback are not substitutes for reading assigned materials or following current Moodle rules.

**Project source:** `index.html`. Earlier versions are preserved in `archive/`, including `prototype-3-3.html`.

**Design principles:** [Design Philosophy](docs/design-philosophy.md).

**Version 3.4 classroom testing:** Chrom(e/ium)-engine interaction tests validated field edits, backup and restore, .docx structure and image embedding, and mobile overflow. Generated .docx files were rendered via LibreOffice for layout review. Safari and native Apple Pages round-trip testing remain appropriate before broad classroom rollout.
