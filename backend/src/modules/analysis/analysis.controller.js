const analysisService = require('./analysis.service')
const { successResponse } = require('../../utils/response')
const logger = require('../../utils/logger')

const analyzeMeeting = async (req, res, next) => {
    try {
        const result = await analysisService.analyzeMeeting(
            req.params.id,
            req.user.userId
        )
        logger.info(req.traceId, 'Meeting analyzed', { meetingId: req.params.id })
        res.status(200).json(successResponse(req, result))
    } catch (err) {
        next(err)
    }
}

module.exports = { analyzeMeeting };