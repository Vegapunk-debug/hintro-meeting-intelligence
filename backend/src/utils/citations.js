const createError = require('./error')

// Grounding guarantee: keep only the citations that point to a real
// transcript timestamp. If an item has no valid citation left, it is
// treated as hallucinated and rejected with HALLUCINATION_DETECTED.
const validateCitations = (items, fieldName, validTimestamps) => {
    if (!items || items.length === 0) return []

    return items.map(item => {
        const validCitations = item.citations?.filter(c =>
            validTimestamps.includes(c.timestamp)
        )

        if (!validCitations || validCitations.length === 0) {
            throw createError(
                `AI generated ${fieldName} without valid transcript citation`,
                422,
                'HALLUCINATION_DETECTED'
            )
        }

        return { ...item, citations: validCitations }
    })
}

module.exports = { validateCitations }
