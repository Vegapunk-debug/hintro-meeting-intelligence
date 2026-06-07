const express = require('express')
const router = express.Router()
const actionItemsController = require('./actionItems.controller')
const authenticate = require('../../middleware/auth')
const validate = require('../../middleware/validate')
const { createActionItemSchema } = require('./actionItems.schema')

router.post('/', authenticate, validate(createActionItemSchema), actionItemsController.createActionItem)
router.patch('/:id/status', authenticate, actionItemsController.updateStatus)
router.get('/overdue', authenticate, actionItemsController.getOverdueItems)
router.get('/', authenticate, actionItemsController.getActionItems)

module.exports = router;