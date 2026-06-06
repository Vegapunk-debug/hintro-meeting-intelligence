const actionItemsService = require('./actionItems.service')
const { successResponse } = require('../../utils/response')
const logger = require('../../utils/logger')

const createActionItem = async (req, res, next) => {
    try {
        const actionItem = await actionItemsService.createActionItem(
            req.user.userId,
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
            req.user.userId,
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
        const items = await actionItemsService.getActionItems(req.user.userId, req.query)
        res.status(200).json(successResponse(req, items))
    } catch (err) {
        next(err)
    }
}

const getOverdueItems = async (req, res, next) => {
    try {
        const items = await actionItemsService.getOverdueItems(req.user.userId)
        res.status(200).json(successResponse(req, items))
    } catch (err) {
        next(err)
    }
}

module.exports = { createActionItem, updateStatus, getActionItems, getOverdueItems };