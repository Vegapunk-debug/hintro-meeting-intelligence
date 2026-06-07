const createError = require('../utils/error')

// Factory: validate(schema) returns middleware that validates req[source]
// against a Zod schema. On failure it forwards a 400 VALIDATION_ERROR with a
// readable, field-aware message to the global error handler.
const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
        const message = result.error.issues
            .map((issue) => {
                const field = issue.path.join('.') || '(body)'
                return `${field}: ${issue.message}`
            })
            .join('; ')

        return next(createError(message, 400, 'VALIDATION_ERROR'))
    }

    req[source] = result.data
    next()
}

module.exports = validate
