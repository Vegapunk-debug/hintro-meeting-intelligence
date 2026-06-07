// Grounding guarantee (per-insight): keep only the citations that point to a
// real transcript timestamp, and DROP any insight we can't ground at all.
// Every insight that survives carries at least one real citation — so the
// returned analysis is always grounded, while the model's ungrounded output is
// silently discarded rather than faked. The "reject the whole analysis" floor
// (when nothing grounds) lives in analysis.service.
const validateCitations = (items, fieldName, validTimestamps) => {
    if (!items || items.length === 0) return []

    return items
        .map(item => {
            const validCitations = (item.citations || []).filter(c =>
                validTimestamps.includes(c.timestamp)
            )
            // No real citation -> ungrounded -> drop it (return everything else).
            return validCitations.length ? { ...item, citations: validCitations } : null
        })
        .filter(Boolean)
}

module.exports = { validateCitations }
