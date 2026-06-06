const prisma = require('../../config/db')
const createError = require('../../utils/error')

const createMeeting = async (userId, { title, participants, meetingDate, transcript }) => {
    const meeting = await prisma.meeting.create({
        data: {
            title,
            participants,
            meetingDate: new Date(meetingDate),
            transcript,
            userId
        }
    })
    return meeting
}

const getMeetingById = async (id, userId) => {
    const meeting = await prisma.meeting.findFirst({
        where: { id, userId },
        include: {
            analysis: true,
            actionItems: true
        }
    })

    if (!meeting){
        throw createError('Meeting not found', 404, 'NOT_FOUND');
    }
    return meeting
}

const getAllMeetings = async (userId, { page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit

    const [meetings, total] = await Promise.all([
        prisma.meeting.findMany({
            where: { userId },
            skip: Number(skip),
            take: Number(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                analysis: true,
                actionItems: true   
            }  
        }),
        prisma.meeting.count({ where: { userId }})
    ])

    return { 
        meetings, 
        pagination: { 
            total, 
            page: Number(page), 
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)  
        } 
    }
}
    

module.exports = { createMeeting, getMeetingById, getAllMeetings };