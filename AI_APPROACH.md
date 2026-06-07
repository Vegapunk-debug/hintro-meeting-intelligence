# AI Approach

## Provider & Model

| | |
|---|---|
| **Provider** | Groq |
| **Model** | `llama-3.1-8b-instant` |
| **Why** | Free, fast, native JSON mode, OpenAI-compatible API |

---

## Pipeline

```
Transcript
    │
    ▼
Format → "[00:10] John: We should launch next Friday."
    │
    ▼
Groq AI (temp 0.1, json_object mode)
    │
    ▼
validateCitations() ← grounding gate
    │
    ├── valid   → persist Analysis + ActionItems
    └── invalid → 422 HALLUCINATION_DETECTED
```

---

## Prompt Design

Two-message structure:

**System** — sets the role and hard rules:
```
You ONLY use information explicitly stated in the transcript.
You NEVER invent attendees, tasks, decisions, or outcomes.
You ALWAYS cite the exact timestamp for every insight.
```

**User** — provides data + whitelist + schema:
```
Valid timestamps are: 00:10, 00:20, 00:30
If no decisions exist, return empty array.
```

> The "return empty array" instruction is the single most effective
> anti-hallucination prompt — it gives the model a legitimate exit
> instead of forcing it to invent content.

---

## Hallucination Prevention — 4 Layers

| Layer | What it does |
|---|---|
| **1. System prompt** | Explicit "never invent" rules |
| **2. Timestamp whitelist** | Only valid timestamps listed in prompt |
| **3. Temperature 0.1** | Near-deterministic, suppresses creative drift |
| **4. Code validation** | Every citation checked against real transcript — no valid citation = request rejected |

Layer 4 is the guarantee. Prompt engineering *reduces* hallucination. Code *eliminates* it.

```js
// src/utils/citations.js
if (!validCitations || validCitations.length === 0) {
  throw createError('HALLUCINATION_DETECTED', 422, '...')
}
```

**Failing loudly is intentional** — a wrong answer is worse than no answer.

---

## Citation Strategy

Every insight carries citations back to the exact transcript timestamp:

```json
{
  "task": "Prepare release notes",
  "assignee": "Alice",
  "citations": [{ "timestamp": "00:20" }]
}
```

Citations are stored on both `Analysis` and `ActionItem` rows — traceability survives beyond the API response.

---

## Output Validation

| Risk | Mitigation |
|---|---|
| Invalid JSON | `response_format: json_object` + try/catch |
| Invented timestamps | `validateCitations()` filters against real set |
| Uncited insights | Zero valid citations → `HALLUCINATION_DETECTED` |
| Empty sections | Model instructed to return `[]`, not invent filler |
| Duplicate analysis | Hard block — `ALREADY_ANALYZED` (409) |

---

## Known Limitations

- AI action items have no due date — transcripts rarely state explicit deadlines
- One analysis per meeting — re-run/versioning not yet supported
- Strict grounding is conservative — implied insights not explicitly stated are missed by design
- No retry on transient Groq failures
- Groq free-tier rate limits may add latency under load