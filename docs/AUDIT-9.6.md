# Version 9.6 audit — 2026-11-26
Baseline HTML blob: 304a3fb82c38618d1e67072abda22eef9338b829.
## Verified static checks
- All literal ID selectors in initial test file appear in HTML source.
- No duplicate literal double-quoted IDs found; runtime duplicates not assessed.
- Broad-first search and outcome refinement wired in source.
- Reading shelf selects source and focuses note excerpt in source.
- trailReview function and invocation present; normTokens and lookupSource defined.
## Repair priorities
- Lexicon reflection lacks explicit save confirmation; related concepts limited to exact matches against small curated groups; complex phrases need better guidance.
- Saved source fallback goes to general library guide, not verified title-specific record.
- Reading note save message claims browser success without checking persist outcome.
- Source access links need verification; authenticated PCC resources not tested.
- Version marker is in footer and thesis marker still says 9.2.
## Browser audit
Local environment has Playwright but GitHub DNS retrieval failed. GitHub Actions workflow added in commit 211286f547adcada85a4c62cdedbcce4f66ecab2. No completed browser audit observed at time of writing. Initial suite covers search and reading notes at two viewport sizes; thesis, writing, backup, export, visible navigation, accessibility and actual Safari remain untested. Local CI serving does not reproduce sibling repository source-library URL; verify published integration separately.
## Release decision
Not student-ready verified. Freeze feature development. Review Actions results, repair test harness and application failures, expand coverage and rerun. Production HTML unchanged.
## First browser run and repairs
Run 45914434534: four tests timed out, zero passed. Root cause not established. Experimental 9.6.1 commit afca0132ea07cc2c1fe4c2a7eac84242ae139f79 repairs note save confirmation, reflection feedback and version labels. Test harness now uses DOMContentLoaded, bounded action/navigation timeouts, runtime logging and failure traces. Await rerun; no release approval.
