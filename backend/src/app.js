const express = require('express');
const cors = require('cors');
const traceId = require('./middleware/traceId');
const errorHandler = require('./middleware/errorHandler');
const { successResponse, errorResponse } = require('./utils/response');
const authRoutes = require('./modules/auth/auth.routes');
const meetingsRoutes = require('./modules/meetings/meetings.routes');
const analysisRoutes = require('./modules/analysis/analysis.routes');
const actionItemsRoutes = require('./modules/actionItems/actionItems.routes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger/swagger.json');

const app = express()

app.use(cors())
app.use(express.json())
app.use(traceId)

app.use('/api/auth', authRoutes)
app.use('/api/meetings', meetingsRoutes)
app.use('/api/meetings', analysisRoutes)
app.use('/api/action-items', actionItemsRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

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

// unknown routes -> unified error response (instead of default HTML 404)
app.use((req, res) => {
  res.status(404).json(errorResponse(req, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`))
})

app.use(errorHandler)

module.exports = app;