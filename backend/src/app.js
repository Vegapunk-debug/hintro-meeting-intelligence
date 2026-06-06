const express = require('express');
const cors = require('cors');
const traceId = require('./middleware/traceId');
const errorHandler = require('./middleware/errorHandler');
const { successResponse } = require('./utils/response');
const authRoutes = require('./modules/auth/auth.routes');
const meetingsRoutes = require('./modules/meetings/meetings.routes');
const analysisRoutes = require('./modules/analysis/analysis.routes');
const actionItemsRoutes = require('./modules/actionItems/actionItems.routes');

const app = express()

app.use(cors())
app.use(express.json())
app.use(traceId)

app.use('/api/auth', authRoutes)
app.use('/api/meetings', meetingsRoutes)
app.use('/api/meetings', analysisRoutes)
app.use('/api/action-items', actionItemsRoutes)

// TEMPORARY - test discord
// app.get('/test-discord', async (req, res) => {
//   const { sendDiscordReminder } = require('./modules/reminders/reminder.service');
//   await sendDiscordReminder({
//     id: '2fc3ff92-e0d0-4c80-a06c-c4b9f7a7f19e',
//     task: 'Prepare release notes',
//     assignee: 'Alice',
//     dueDate: '2026-05-01T10:00:00.000Z',
//     status: 'PENDING',
//     meeting: { title: 'Sprint Planning' }
//   });
//   res.json({ success: true });
// });

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' })
});

app.get('/api/evaluation', (req, res) => {
  res.json(successResponse(req, {
    candidateName: 'Rohit Nair P',
    email: 'rohitnairmuttathethu@gmail.com',
    repositoryUrl: 'https://github.com/Vegapunk-debug/hintro-meeting-intelligence',
    deployedUrl: '',
    externalIntegration: 'Discord Webhook',
    features: [
      'Authentication',
      'AI Analysis',
      'Citation Grounding',
      'Action Item Management',
      'Overdue Detection',
      'Reminder Scheduler',
      'Discord Integration'
    ]
  }))
})

app.use(errorHandler)

module.exports = app;