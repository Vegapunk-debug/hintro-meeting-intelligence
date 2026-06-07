const express = require('express');
const authenticate = require('../../middleware/auth');
const router = express.Router()
const meetingsController = require('./meetings.controller');
const validate = require('../../middleware/validate');
const { createMeetingSchema } = require('./meetings.schema');

router.post('/', authenticate, validate(createMeetingSchema), meetingsController.createMeeting)
router.get('/', authenticate, meetingsController.getAllMeetings)
router.get('/:id', authenticate, meetingsController.getMeetingById)

module.exports = router;