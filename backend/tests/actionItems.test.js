const { updateStatus } = require('../src/modules/actionItems/actionItems.service')

// updateStatus validates the status BEFORE touching the database,
// so the invalid-status path can be tested without a DB connection.
describe('updateStatus validation', () => {
    it('rejects an unknown status with INVALID_STATUS', async () => {
        await expect(updateStatus('some-id', 'DONE')).rejects.toMatchObject({
            status: 400,
            code: 'INVALID_STATUS'
        })
    })

    it('rejects an empty status', async () => {
        await expect(updateStatus('some-id', '')).rejects.toMatchObject({
            code: 'INVALID_STATUS'
        })
    })
})
