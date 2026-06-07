const { z } = require('zod')

const createActionItemSchema = z.object({
    meetingId: z.string().uuid('meetingId must be a valid UUID'),
    task: z.string().min(1, 'task is required'),
    assignee: z.string().min(1, 'assignee is required'),
    dueDate: z
        .string()
        .datetime({ offset: true }, { message: 'dueDate must be a valid ISO 8601 date' })
        .optional()
})

module.exports = { createActionItemSchema }
