const validate = require('../src/middleware/validate')
const { registerSchema } = require('../src/modules/auth/auth.schema')
const { createMeetingSchema } = require('../src/modules/meetings/meetings.schema')

// Minimal harness: run the validate middleware and capture next(err)
const run = (schema, body) =>
    new Promise((resolve) => {
        const req = { body }
        validate(schema)(req, {}, (err) => resolve({ err, req }))
    })

describe('validate middleware', () => {
    it('rejects an invalid email with VALIDATION_ERROR', async () => {
        const { err } = await run(registerSchema, {
            name: 'Rohit',
            email: 'not-an-email',
            password: 'password123'
        })
        expect(err).toMatchObject({ status: 400, code: 'VALIDATION_ERROR' })
        expect(err.message).toMatch(/email/i)
    })

    it('rejects missing required fields', async () => {
        const { err } = await run(registerSchema, { name: 'Rohit' })
        expect(err).toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('passes valid input and forwards no error', async () => {
        const { err } = await run(registerSchema, {
            name: 'Rohit',
            email: 'rohit@example.com',
            password: 'password123'
        })
        expect(err).toBeUndefined()
    })

    it('rejects an invalid meeting date', async () => {
        const { err } = await run(createMeetingSchema, {
            title: 'Sprint Planning',
            participants: ['alice@example.com'],
            meetingDate: 'not-a-date',
            transcript: [{ timestamp: '00:10', speaker: 'John', text: 'Hi' }]
        })
        expect(err).toMatchObject({ code: 'VALIDATION_ERROR' })
        expect(err.message).toMatch(/meetingDate/i)
    })

    it('rejects an empty transcript', async () => {
        const { err } = await run(createMeetingSchema, {
            title: 'Sprint Planning',
            participants: ['alice@example.com'],
            meetingDate: '2026-05-20T10:00:00Z',
            transcript: []
        })
        expect(err).toMatchObject({ code: 'VALIDATION_ERROR' })
    })
})
