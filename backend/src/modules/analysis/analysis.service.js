const Groq = require('groq-sdk');
const prisma = require('../../config/db');
const createError = require('../../utils/error');
const { validateCitations } = require('../../utils/citations');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analyzeMeeting = async (meetingId, userId) => {
    // Get meeting from DB
    const meeting = await prisma.meeting.findFirst({
        where: { id: meetingId, userId }
    })

    if (!meeting) {
        throw createError('Meeting not found', 404, 'NOT_FOUND')
    }

    // Check if already analyzed
    const existing = await prisma.analysis.findUnique({
        where: { meetingId }
    })

    if (existing) {
        throw createError('Meeting already analyzed', 409, 'ALREADY_ANALYZED')
    }

    // Format transcript for AI
    const transcriptText = meeting.transcript
        .map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
        .join('\n')

    // Get valid timestamps for citation validation
    const validTimestamps = meeting.transcript.map(t => t.timestamp)

    // Call Groq AI with JSON mode enabled
    const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `You are a meeting intelligence assistant. 
                You extract structured insights from meeting transcripts.
                You ONLY use information explicitly stated in the transcript.
                You NEVER invent attendees, tasks, decisions, or outcomes.
                You ALWAYS cite the exact timestamp for every insight.
                You respond ONLY with valid JSON.`
            },
            {
                role: 'user',
                content: `Analyze this transcript and return a JSON object with keys: summary, decisions, actionItems, followUps.

                TRANSCRIPT:
                ${transcriptText}

                RULES:
                - Only use information from the transcript above
                - Every item must cite at least one timestamp from the transcript
                - Valid timestamps are: ${validTimestamps.join(', ')}
                - Only use these exact timestamps in citations
                - If no decisions exist, return empty array
                - If no action items exist, return empty array

                Return this exact JSON structure:
                {
                    "summary": [{ "text": "...", "citations": [{ "timestamp": "00:10" }] }],
                    "decisions": [{ "text": "...", "citations": [{ "timestamp": "00:10" }] }],
                    "actionItems": [{ "task": "...", "assignee": "...", "citations": [{ "timestamp": "00:10" }] }],
                    "followUps": [{ "text": "...", "citations": [{ "timestamp": "00:10" }] }]
                }`
            }
        ]
    })

    // Parse AI response - JSON mode guarantees valid JSON
    let parsed;
    try {
        parsed = JSON.parse(response.choices[0].message.content.trim());
    } catch (err) {
        throw createError('AI returned invalid response', 500, 'AI_PARSE_ERROR');
    }

    // Layer 4 - Validate citations against real transcript timestamps.
    // Per-insight: ungrounded items are dropped, grounded ones are kept.
    const validatedSummary = validateCitations(parsed.summary, 'summary', validTimestamps)
    const validatedDecisions = validateCitations(parsed.decisions, 'decisions', validTimestamps)
    const validatedFollowUps = validateCitations(parsed.followUps, 'followUps', validTimestamps)
    const validatedActionItems = validateCitations(parsed.actionItems, 'actionItems', validTimestamps)

    // Fail-closed floor: if NOTHING grounded across every section, the model
    // returned a fully ungrounded response — reject it rather than store an
    // empty, useless analysis.
    if (
        validatedSummary.length === 0 &&
        validatedDecisions.length === 0 &&
        validatedFollowUps.length === 0 &&
        validatedActionItems.length === 0
    ) {
        throw createError('AI returned no grounded insights', 422, 'HALLUCINATION_DETECTED')
    }

    // Save analysis to DB
    const analysis = await prisma.analysis.create({
        data: {
            meetingId,
            summary: validatedSummary,
            decisions: validatedDecisions,
            followUps: validatedFollowUps
        }
    })

    // Save action items to DB
    if (validatedActionItems.length > 0) {
        await prisma.actionItem.createMany({
            data: validatedActionItems.map(item => ({
                task: item.task,
                assignee: item.assignee,
                citations: item.citations || [],
                meetingId,
                status: 'PENDING'
            }))
        })
    }

    return { analysis, actionItems: validatedActionItems }
}

module.exports = { analyzeMeeting };