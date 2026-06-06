const createError = require('../src/utils/error')

describe('createError', () => {
    it('builds an Error with status and code attached', () => {
        const err = createError('Invalid status', 400, 'INVALID_STATUS')

        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe('Invalid status')
        expect(err.status).toBe(400)
        expect(err.code).toBe('INVALID_STATUS')
    })
})
