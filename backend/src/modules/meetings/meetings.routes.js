const express = require('express');
const authenticate = require('../../middleware/auth');
const router = express.Router()
const meetingsController = require('./meetings.controller');

router.post('/', authenticate, meetingsController.createMeeting)
router.get('/', authenticate, meetingsController.getAllMeetings)
router.get('/:id', authenticate, meetingsController.getMeetingById)

module.exports = router;