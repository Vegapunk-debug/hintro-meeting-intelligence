const express = require('express')
const router = express.Router()
const actionItemsController = require('./actionItems.controller')
const authenticate = require('../../middleware/auth')

router.post('/', authenticate, actionItemsController.createActionItem)
router.patch('/:id/status', authenticate, actionItemsController.updateStatus)
router.get('/overdue', authenticate, actionItemsController.getOverdueItems)
router.get('/', authenticate, actionItemsController.getActionItems)

module.exports = router;