const express = require('express');
const cors = require('cors');
const traceId = require('./middleware/traceId');
const errorHandler = require('./middleware/errorHandler');
const { successResponse } = require('./utils/response');

const app = express()

app.use(cors())
app.use(express.json())
app.use(traceId)

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