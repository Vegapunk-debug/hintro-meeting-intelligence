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
validateCitations() ← grounding gate (per-insight)
    │
    ├── grounded item   → kept
    ├── ungrounded item → dropped (never faked)
    │
    ├── something grounded → persist Analysis + ActionItems
    └── nothing grounded   → 422 HALLUCINATION_DETECTED (fail-closed floor)
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
| **4. Code validation** | Every citation checked against the real transcript — ungrounded insights are **dropped**; the analysis is rejected only if *nothing* grounds |

Layer 4 is the guarantee. Prompt engineering *reduces* hallucination. Code *eliminates* it.

```js
// src/utils/citations.js — keep grounded insights, drop ungrounded ones
const validCitations = (item.citations || []).filter(c =>
  validTimestamps.includes(c.timestamp)
)
return validCitations.length ? { ...item, citations: validCitations } : null  // drop if none
```

**Every returned insight is grounded** — ungrounded output is discarded rather than faked. If the model grounds *nothing at all*, the request fails closed with `422 HALLUCINATION_DETECTED` (a wrong answer is worse than no answer).

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
| Uncited insight | Dropped per-insight — never returned, never faked |
| Fully ungrounded response | Zero grounded insights anywhere → `422 HALLUCINATION_DETECTED` |
| Empty sections | Model instructed to return `[]`, not invent filler |
| Duplicate analysis | Hard block — `ALREADY_ANALYZED` (409) |

---

## Known Limitations

- AI action items have no due date — transcripts rarely state explicit deadlines
- One analysis per meeting — re-run/versioning not yet supported
- Strict grounding is conservative — implied insights not explicitly stated are missed by design
- No retry on transient Groq failures
- Groq free-tier rate limits may add latency under load