const cron = require('node-cron')
const prisma = require('../config/db')
const { sendDiscordReminder } = require('../modules/reminders/reminder.service')
const logger = require('../utils/logger')

const startOverdueChecker = () => {
    // runs every hour
    cron.schedule('0 * * * *', async () => {
        logger.info('SCHEDULER', 'Running overdue check')

        try {
            // find all overdue items
            const overdueItems = await prisma.actionItem.findMany({
                where: {
                    status: { not: 'COMPLETED' },
                    dueDate: { lt: new Date() }
                },
                include: {
                    meeting: { select: { title: true } }
                }
            })

            logger.info('SCHEDULER', `Found ${overdueItems.length} overdue items`)

            // send reminder for each
            for (const item of overdueItems) {
                try {
                    await sendDiscordReminder(item)
                } catch (err) {
                    logger.error('SCHEDULER', `Failed to send reminder for ${item.id}`, {
                        error: err.message
                    })
                }
            }
        } catch (err) {
            logger.error('SCHEDULER', 'Overdue check failed', { error: err.message })
        }
    })
    
    logger.info('SCHEDULER', 'Overdue checker started - runs every hour')
}

module.exports = { startOverdueChecker };