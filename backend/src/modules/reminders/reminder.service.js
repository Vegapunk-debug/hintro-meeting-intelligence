const prisma = require('../../config/db');
const logger = require('../../utils/logger');

const sendDiscordReminder = async (actionItem) => {
    const message = {
        embeds: [
            {
                title: '⚠️ Overdue Action Item Reminder',
                color: 0xff0000,
                fields: [
                    { name: 'Task', value: actionItem.task, inline: false },
                    { name: 'Assigned To', value: actionItem.assignee, inline: true },
                    {
                        name: 'Due Date', value: actionItem.dueDate
                            ? new Date(actionItem.dueDate).toDateString()
                            : 'No due date', inline: true
                    },
                    { name: 'Status', value: actionItem.status, inline: true },
                    { name: 'Meeting', value: actionItem.meeting?.title || 'N/A', inline: false }
                ],
                footer: { text: 'Hintro Meeting Intelligence' },
                timestamp: new Date().toISOString()
            }
        ]
    }

    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
    })

    if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.statusText}`);
    }

    // Save to ReminderLog
    await prisma.reminderLog.create({
        data: {
            actionItemId: actionItem.id,
            message: `Reminder sent for task: ${actionItem.task}`
        }
    })

    logger.info('SCHEDULER', 'Discord reminder sent', {
        actionItemId: actionItem.id,
        assignee: actionItem.assignee
    })
}

module.exports = { sendDiscordReminder };