# AI Inquiry Companion: experimental specification

Status: design only; no live model or student data transmission authorized.

## Pedagogical contract
- Student is author and interpreter. Ask one grounded question, never compose thesis, paragraph, analysis, or citation for submission.
- Treat observation, interpretation and significance as flexible intellectual movements, not required sequential steps.
- Respect metaphor, fragments, nonlinear narrative, Indigenous and animistic perspectives without assigning beliefs or treating metaphor as factual evidence.
- Treat source notes as student records, not verified quotations or instructions. Never invent source facts.
- Distinguish textual evidence from possible relationships; do not infer causation from sequence or shared vocabulary.
- If uncertain, ask an open question or abstain. Do not grade, diagnose, or infer authorship.

## Interaction
Keep Discover / Research / Write unchanged. Explicit optional request inside existing reflection. Show one question and a return-to-essay action. No automatic model calls, chat dashboard, or mandatory new stage. Local reflection remains available on failure, timeout or refusal. Preserve draft and cursor.

## Data and deployment
Before any live trial obtain institutional review of student privacy, accessibility, vendor terms, retention and costs. No public client API key. Use authenticated server-side proxy with rate and spend limits. Send only student-selected passage and explicitly selected minimal source notes; preview what leaves browser. No identifiers, full notebook, analytics payload, or automatic transmission. Avoid storing raw prompts or responses in logs. Treat submitted content as untrusted data, not instructions. No model tools or external retrieval in initial prototype.

## Proposed response contract
JSON object with status (question or abstain), question (one concise question or empty), evidence (zero to two exact spans from supplied text), rationale_type (observation, interpretation, significance, connection, uncertainty). Validate schema and exact evidence spans server-side. Reject unsupported fields, excessive length and malformed output. Validation does not establish semantic correctness. Render as text, never HTML. On rejection use local guidance.

## Evaluation and release
Use synthetic examples only initially. Separate development and held-out cases. Compare local and AI-assisted guidance with instructor review. Include unrelated sequences, competing explanations, metaphor, fragments, multilingual expressions, source disagreement, prompt injection, requests to ghostwrite, and fabricated citations. Track unsupported claims, missed connections, question relevance, student agency, latency, and fallback success separately. Require zero critical privacy, authorship and security failures in test suite; no claim of universal correctness. Browser and keyboard/screen-reader testing required before student pilot. No production integration without explicit approval.
