# AI Approach

## Overview

The AI analysis pipeline uses Groq's llama-3.1-8b-instant model to extract
structured insights from meeting transcripts with zero hallucination tolerance.

## Prompt Design

The prompt uses a two-message structure:

**System message** — defines the AI's role and hard constraints:
- Only extract information explicitly stated in transcript
- Never invent attendees, tasks, or decisions
- Always cite exact timestamps
- Respond only with valid JSON

**User message** — provides transcript and output schema:
- Formatted transcript with timestamps
- List of valid timestamps explicitly included
- Exact JSON structure required
- Empty array instructions for missing data

## Citation Strategy

Every generated insight must include at least one citation:

```json
{
  "task": "Prepare release notes",
  "assignee": "Alice",
  "citations": [{ "timestamp": "00:20" }]
}
```

Citations reference exact transcript timestamps so every insight
can be traced back to its source.

## Hallucination Prevention — 4 Layers

**Layer 1 — System Prompt Rules**
Explicit instructions telling the AI what it must never do.

**Layer 2 — Valid Timestamps in Prompt**
The prompt includes the list of valid timestamps. AI can only
cite timestamps that actually exist.

**Layer 3 — Temperature 0.1**
Low temperature makes the model deterministic and factual,
reducing creative hallucination.

**Layer 4 — Programmatic Citation Validation**
After AI responds, every citation is validated against real
transcript timestamps programmatically:

```js
const validCitations = item.citations?.filter(c =>
  validTimestamps.includes(c.timestamp)
);
if (!validCitations || validCitations.length === 0) {
  throw createError('HALLUCINATION_DETECTED', 422, '...');
}
```

If AI invents a timestamp → request fails with HALLUCINATION_DETECTED error.

## Output Validation Strategy

- JSON mode enabled (response_format: json_object) → guarantees valid JSON
- Schema validated after parsing
- Empty arrays returned when no data found (not invented data)
- Each section validated independently

## Known Limitations

- Very short transcripts may produce minimal insights
- AI may miss implied decisions not explicitly stated
- Rate limits on Groq free tier may cause delays under heavy load
- Model may struggle with highly technical domain-specific transcripts