const logger = require("../utils/logger")
const { errorResponse } = require("../utils/response")

const errorHandler = (err, req, res, next) => {
    logger.error(req.traceId, err.message, {
        method: req.method,
        path: req.path,
        stack: err.stack
    })

    const status = err.status || 500
    const code = err.code || 'INTERNAL_ERROR'
    const message = err.message || 'Something went wrong'

    res.status(status).json(errorResponse(req, code, message))
}

module.exports = errorHandler;