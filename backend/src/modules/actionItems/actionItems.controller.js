const actionItemsService = require('./actionItems.service')
const { successResponse } = require('../../utils/response')
const logger = require('../../utils/logger')

const createActionItem = async (req, res, next) => {
    try {
        const actionItem = await actionItemsService.createActionItem(
            req.body.meetingId,
            req.body
        )
        logger.info(req.traceId, 'Action item created', { actionItemId: actionItem.id })
        res.status(201).json(successResponse(req, actionItem))
    } catch (err) {
        next(err)
    }
}

const updateStatus = async (req, res, next) => {
    try {
        const actionItem = await actionItemsService.updateStatus(
            req.params.id,
            req.body.status
        )
        logger.info(req.traceId, 'Action item status updated', {
            actionItemId: req.params.id,
            status: req.body.status
        })
        res.status(200).json(successResponse(req, actionItem))
    } catch (err) {
        next(err)
    }
}

const getActionItems = async (req, res, next) => {
    try {
        const items = await actionItemsService.getActionItems(req.query)
        res.status(200).json(successResponse(req, items))
    } catch (err) {
        next(err)
    }
}

const getOverdueItems = async (req, res, next) => {
    try {
        const items = await actionItemsService.getOverdueItems()
        res.status(200).json(successResponse(req, items))
    } catch (err) {
        next(err)
    }
}

module.exports = { createActionItem, updateStatus, getActionItems, getOverdueItems };