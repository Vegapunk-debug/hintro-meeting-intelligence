const { validateCitations } = require('../src/utils/citations')

const validTimestamps = ['00:10', '00:20']

describe('validateCitations (grounding guarantee)', () => {
    it('keeps items whose citations point to real transcript timestamps', () => {
        const items = [
            { text: 'Launch on Friday', citations: [{ timestamp: '00:10' }] }
        ]

        const result = validateCitations(items, 'summary', validTimestamps)

        expect(result).toEqual([
            { text: 'Launch on Friday', citations: [{ timestamp: '00:10' }] }
        ])
    })

    it('drops citations that reference timestamps not in the transcript', () => {
        const items = [
            {
                text: 'Launch on Friday',
                citations: [{ timestamp: '00:10' }, { timestamp: '99:99' }]
            }
        ]

        const result = validateCitations(items, 'summary', validTimestamps)

        // only the real timestamp survives
        expect(result[0].citations).toEqual([{ timestamp: '00:10' }])
    })

    it('drops an ungrounded item but keeps the grounded ones', () => {
        const items = [
            { text: 'Made up insight', citations: [{ timestamp: '99:99' }] },
            { text: 'Real insight', citations: [{ timestamp: '00:10' }] }
        ]

        const result = validateCitations(items, 'summary', validTimestamps)

        // the ungrounded item is discarded, the grounded one survives
        expect(result).toEqual([
            { text: 'Real insight', citations: [{ timestamp: '00:10' }] }
        ])
    })

    it('drops an item that is missing citations entirely', () => {
        const items = [{ text: 'No citations here' }]

        expect(validateCitations(items, 'decisions', validTimestamps)).toEqual([])
    })

    it('guarantees every returned item carries at least one real citation', () => {
        const items = [
            { text: 'A', citations: [{ timestamp: '00:10' }, { timestamp: '99:99' }] },
            { text: 'B', citations: [{ timestamp: '88:88' }] },
            { text: 'C', citations: [{ timestamp: '00:20' }] }
        ]

        const result = validateCitations(items, 'summary', validTimestamps)

        expect(result).toHaveLength(2) // B (ungrounded) dropped
        result.forEach(item => {
            expect(item.citations.length).toBeGreaterThan(0)
            item.citations.forEach(c => expect(validTimestamps).toContain(c.timestamp))
        })
    })

    it('returns an empty array for empty or missing input', () => {
        expect(validateCitations([], 'summary', validTimestamps)).toEqual([])
        expect(validateCitations(undefined, 'summary', validTimestamps)).toEqual([])
    })
})
