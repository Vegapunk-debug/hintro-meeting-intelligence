const logger = require("../utils/logger")
const { errorResponse } = require("../utils/response")

const errorHandler = (err, req, res, next) => {
    logger.error(req.traceId, err.message, {
        method: req.method,
        path: req.originalUrl,
        status: err.status || 500,
        code: err.code || 'INTERNAL_ERROR',
        stack: err.stack
    })

    // Malformed JSON body (thrown by express.json) -> clean validation error
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json(errorResponse(req, 'VALIDATION_ERROR', 'Malformed JSON in request body'))
    }

    const status = err.status || 500
    const code = err.code || 'INTERNAL_ERROR'
    const message = err.message || 'Something went wrong'

    res.status(status).json(errorResponse(req, code, message))
}

module.exports = errorHandler;