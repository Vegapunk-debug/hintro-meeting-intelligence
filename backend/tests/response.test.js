const { successResponse, errorResponse } = require('../src/utils/response')

// fake request object carrying a trace id
const req = { traceId: 'trace-123' }

describe('successResponse', () => {
    it('wraps data in the unified success envelope', () => {
        const result = successResponse(req, { id: 1 })

        expect(result).toEqual({
            traceId: 'trace-123',
            success: true,
            data: { id: 1 }
        })
    })
})

describe('errorResponse', () => {
    it('wraps code and message in the unified error envelope', () => {
        const result = errorResponse(req, 'NOT_FOUND', 'Meeting not found')

        expect(result).toEqual({
            traceId: 'trace-123',
            success: false,
            error: { code: 'NOT_FOUND', message: 'Meeting not found' }
        })
    })
})
