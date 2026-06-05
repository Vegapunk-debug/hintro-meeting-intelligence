const uuid = require('uuid');

const traceId = (req, res, next) => {
    req.traceId = req.headers['x-trace-id'] || uuid.v4()
    res.setHeader('x-trace-id', req.traceId)
    next()
}

module.exports = traceId;