const { z } = require('zod')

const transcriptEntrySchema = z.object({
    timestamp: z.string().min(1, 'timestamp is required'),
    speaker: z.string().min(1, 'speaker is required'),
    text: z.string().min(1, 'text is required')
})

const createMeetingSchema = z.object({
    title: z.string().min(1, 'Meeting title is required'),
    participants: z
        .array(z.string().email('Each participant must be a valid email'))
        .min(1, 'At least one participant is required'),
    meetingDate: z
        .string()
        .datetime({ offset: true }, { message: 'meetingDate must be a valid ISO 8601 date' }),
    transcript: z
        .array(transcriptEntrySchema)
        .min(1, 'Transcript must contain at least one entry')
})

module.exports = { createMeetingSchema }
