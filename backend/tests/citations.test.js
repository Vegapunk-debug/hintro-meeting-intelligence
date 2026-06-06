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

    it('rejects an item with no valid citation as a hallucination', () => {
        const items = [
            { text: 'Made up insight', citations: [{ timestamp: '99:99' }] }
        ]

        expect(() => validateCitations(items, 'summary', validTimestamps))
            .toThrow('AI generated summary without valid transcript citation')
    })

    it('rejects an item that is missing citations entirely', () => {
        const items = [{ text: 'No citations here' }]

        expect(() => validateCitations(items, 'decisions', validTimestamps))
            .toThrow('AI generated decisions without valid transcript citation')
    })

    it('returns an empty array for empty or missing input', () => {
        expect(validateCitations([], 'summary', validTimestamps)).toEqual([])
        expect(validateCitations(undefined, 'summary', validTimestamps)).toEqual([])
    })
})
