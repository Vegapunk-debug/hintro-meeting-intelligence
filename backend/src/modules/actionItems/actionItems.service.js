const prisma = require('../../config/db')
const createError = require('../../utils/error')

const createActionItem = async (meetingId, { task, assignee, dueDate }) => {
    // verify meeting exists
    const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId }
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

const updateStatus = async (id, status) => {
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED']

    if (!validStatuses.includes(status)) {
        throw createError(
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            400,
            'INVALID_STATUS'
        )
    }

    const actionItem = await prisma.actionItem.findUnique({
        where: { id }
    })

    if (!actionItem) {
        throw createError('Action item not found', 404, 'NOT_FOUND')
    }

    return await prisma.actionItem.update({
        where: { id },
        data: { status }
    })
}

const getActionItems = async ({ status, assignee, meetingId }) => {
    const where = {}

    if (status) where.status = status
    if (assignee) where.assignee = { contains: assignee, mode: 'insensitive' }
    if (meetingId) where.meetingId = meetingId

    return await prisma.actionItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { meeting: { select: { title: true } } }
    })
}

const getOverdueItems = async () => {
    return await prisma.actionItem.findMany({
        where: {
            status: { not: 'COMPLETED' },
            dueDate: { lt: new Date() }
        },
        include: {
            meeting: { select: { title: true } }
        }
    })
}

module.exports = { createActionItem, updateStatus, getActionItems, getOverdueItems };