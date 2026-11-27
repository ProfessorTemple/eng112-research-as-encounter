# Semantic intelligence: feasibility and release gates

Status: proposal, not implemented. Preserve stable student-facing notebook.

## Architecture
Keep curated pedagogical lenses and local inquiry memory. Add an optional embedding adapter only after testing. Candidate: Transformers.js with a pinned quantized sentence embedding model such as MiniLM; verify license, actual download size, runtime dependencies, WASM support and Safari compatibility before selection. No generative model or remote inference API. Similarity is not entailment, agreement, contradiction, truth or student intent.

## Privacy and resilience
Explicit opt-in before downloading model assets; explain download size and hosting. No student passages in URLs, telemetry, remote inference or logs. Audit network requests with synthetic text. Prefer self-hosted pinned assets after license review. Do not require model download to use any assignment feature. Handle offline, low-memory, unsupported browsers and interrupted downloads; retain existing lexical fallback. Do not cache student embeddings persistently by default. No new analytics.

## Evaluation
Build a synthetic paired-passage benchmark: firefly perception vs defense; gardening and autonomy; silence and attention; ecological reciprocity; unrelated hard negatives; negation and disagreement; shared vocabulary with unrelated meanings. Compare lexical baseline and embedding ranking, record top-2 relevance and false positives. Instructor review determines pedagogical usefulness. Test latency, memory, download, keyboard navigation and mobile Safari on actual devices before release. Never infer authorship or grade from similarity.

## Integration
Start with Attentive Reader optional candidate ranking. Show actual student excerpts and source provenance; label connections tentative. Limit to two suggestions. Keep source relationships student-selected. Expand to lens ranking only after evidence of benefit. No automatic rewriting.

## Release
Resolve dedicated source synthesis and writing integration audits first. Prototype separately from production. Record model version, license, test results, known limitations and rollback. Do not claim semantic understanding or release readiness from regression tests alone.
