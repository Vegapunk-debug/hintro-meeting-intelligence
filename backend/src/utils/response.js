const successResponse = (req, data) => ({
    traceId: req.traceId,
    success: true,
    data: data
})

const errorResponse = (req, code, message) => ({
    traceId: req.traceId,
    success: false,
    error: { code, message }
})

module.exports = { successResponse, errorResponse }