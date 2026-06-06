const prisma = require('../../config/db')
const createError = require('../../utils/error')

const createActionItem = async (userId, meetingId, { task, assignee, dueDate }) => {
    // verify meeting exists AND belongs to the requesting user
    const meeting = await prisma.meeting.findFirst({
        where: { id: meetingId, userId }
    })

    if (!meeting) {
        throw createError('Meeting not found', 404, 'NOT_FOUND')
    }

    const actionItem = await prisma.actionItem.create({
        data: {
            task,
            assignee,
            dueDate: dueDate ? new Date(dueDate) : null,
            citations: [],
            meetingId
        }
    })

    return actionItem
}

const updateStatus = async (userId, id, status) => {
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED']

    if (!validStatuses.includes(status)) {
        throw createError(
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            400,
            'INVALID_STATUS'
        )
    }

    // only find the item if it belongs to one of the user's meetings
    const actionItem = await prisma.actionItem.findFirst({
        where: { id, meeting: { userId } }
    })

    if (!actionItem) {
        throw createError('Action item not found', 404, 'NOT_FOUND')
    }

    return await prisma.actionItem.update({
        where: { id },
        data: { status }
    })
}

const getActionItems = async (userId, { status, assignee, meetingId }) => {
    const where = { meeting: { userId } }

    if (status) where.status = status
    if (assignee) where.assignee = { contains: assignee, mode: 'insensitive' }
    if (meetingId) where.meetingId = meetingId

    return await prisma.actionItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { meeting: { select: { title: true } } }
    })
}

const getOverdueItems = async (userId) => {
    return await prisma.actionItem.findMany({
        where: {
            meeting: { userId },
            status: { not: 'COMPLETED' },
            dueDate: { lt: new Date() }
        },
        include: {
            meeting: { select: { title: true } }
        }
    })
}

module.exports = { createActionItem, updateStatus, getActionItems, getOverdueItems };