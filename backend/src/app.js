const express = require('express');
const path = require('path');
const cors = require('cors');
const traceId = require('./middleware/traceId');
const requestLogger = require('./middleware/requestLogger');
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

// Serve the static demo UI (single-page client) from /public at the root URL.
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(traceId)
app.use(requestLogger)

app.use('/api/auth', authRoutes)
app.use('/api/meetings', meetingsRoutes)
app.use('/api/meetings', analysisRoutes)
app.use('/api/action-items', actionItemsRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Machine-readable service info (the root URL "/" now serves the demo UI).
app.get('/api', (req, res) => {
  res.json(successResponse(req, {
    service: 'Hintro Meeting Intelligence API',
    status: 'running',
    ui: '/',
    documentation: '/api-docs',
    health: '/health',
    evaluation: '/api/evaluation'
  }))
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' })
});

app.get('/api/evaluation', (req, res) => {
  res.json(successResponse(req, {
    candidateName: 'Rohit Nair P',
    email: 'rohitnairmuttathethu@gmail.com',
    repositoryUrl: 'https://github.com/Vegapunk-debug/hintro-meeting-intelligence',
    deployedUrl: 'https://hintro-meeting-intelligence-yq8w.onrender.com',
    externalIntegration: 'Discord Webhook',
    features: [
      'Authentication',
      'Demo Web UI',
      'AI Analysis',
      'Citation Grounding',
      'Action Item Management',
      'Overdue Detection',
      'Reminder Scheduler',
      'Discord Integration',
      'Input Validation',
      'Structured Logging',
      'Swagger/OpenAPI Docs',
      'Docker',
      'CI/CD Pipeline'
    ]
  }))
})

// unknown routes -> unified error response (instead of default HTML 404)
app.use((req, res) => {
  res.status(404).json(errorResponse(req, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`))
})

app.use(errorHandler)

module.exports = app;