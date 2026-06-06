const express = require('express')
const router = express.Router()
const analysisController = require('./analysis.controller')
const authenticate = require('../../middleware/auth')

router.post('/:id/analyze', authenticate, analysisController.analyzeMeeting)

module.exports = router;