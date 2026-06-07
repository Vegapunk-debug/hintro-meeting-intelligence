const logger = require('../utils/logger')

// Emits one structured log line per request once the response is sent,
// capturing the fields required for traceability:
// timestamp + traceId (added by the logger) and method, path, status, durationMs.
const requestLogger = (req, res, next) => {
    // Skip noisy health-check pings from platform/uptime monitors
    if (req.path === '/health') return next()

    const start = Date.now()

    res.on('finish', () => {
        const meta = {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - start
        }

        const level = res.statusCode >= 500 ? 'error' : 'info'
        logger[level](req.traceId, 'request completed', meta)
    })

    next()
}

module.exports = requestLogger
