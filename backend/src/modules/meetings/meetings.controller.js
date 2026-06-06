const meetingsService = require('./meetings.service')
const { successResponse } = require('../../utils/response')
const logger = require('../../utils/logger')

const createMeeting = async (req, res, next) => {
    try {
        const meeting = await meetingsService.createMeeting(req.user.userId, req.body)
        logger.info(req.traceId, 'Meeting created', { meetingId: meeting.id })
        res.status(201).json(successResponse(req, meeting))
    } catch (err) {
        next(err)
    }
};

const getMeetingById = async (req, res, next) => {
    try {
        const meeting = await meetingsService.getMeetingById(req.params.id, req.user.userId)
        res.status(200).json(successResponse(req, meeting))
    } catch (err) {
        next(err)
    }
};

const getAllMeetings = async (req, res, next) => {
    try {
        const result = await meetingsService.getAllMeetings(req.user.userId, req.query)
        res.status(200).json(successResponse(req, result))
    } catch (err) {
        next(err)
    }
};

module.exports = { createMeeting, getMeetingById, getAllMeetings };