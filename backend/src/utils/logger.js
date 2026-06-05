const logger = {
    info: (traceId, message, meta = {}) => {
        console.log(JSON.stringify({
            level: 'INFO',
            timestamp: new Date().toISOString(),
            traceId,
            message,
            ...meta
        }))
    },
    error: (traceId, message, meta = {}) => {
        console.error(JSON.stringify({
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            traceId,
            message,
            ...meta
        }))
    }
}

module.exports = logger;