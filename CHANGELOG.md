# Changelog

<!-- ## [1.0.0] -->

### Phase 1 — Project Setup
- Initialized Node.js + Express project
- Created modular folder structure
- Implemented unified API response format
- Added trace ID middleware
- Added global error handler
- Added structured logging

### Phase 2 — Database + Authentication
- Set up PostgreSQL with Prisma ORM on Neon
- Designed 5-model schema (User, Meeting, Analysis, ActionItem, ReminderLog)
- Implemented JWT authentication
- Added register and login endpoints
- Added password hashing with bcryptjs

### Phase 3 — Meeting Management
- Implemented create meeting endpoint
- Implemented get meeting by ID
- Implemented list meetings with pagination
- Added user-scoped data access (users see only their meetings)

### Phase 4 — AI Analysis
- Integrated Groq AI (llama-3.1-8b-instant)
- Implemented meeting analysis endpoint
- Added 4-layer hallucination prevention strategy
- Added programmatic citation validation
- Auto-saves action items from AI analysis

### Phase 5 — Action Items + Scheduler
- Implemented action item CRUD
- Added status management (PENDING, IN_PROGRESS, COMPLETED)
- Added filtering by status, assignee, meetingId
- Implemented overdue detection
- Added Discord webhook integration
- Implemented node-cron scheduler (runs every hour)
- Added ReminderLog tracking

### Phase 6 — Docs + Deployment
- Added Swagger UI documentation
- Added input validation with Zod
- Configured Render deployment (Prisma generate + migrate deploy build steps)
- Added evaluation and health endpoints

### Phase 7 — Validation, Containerization + CI
- Added Zod request-validation middleware with per-module schemas
  (register, login, create meeting, create action item)
- Normalized malformed-JSON errors to VALIDATION_ERROR
- Added Dockerfile and .dockerignore for the backend
- Added docker-compose for local API + PostgreSQL stack
- Added GitHub Actions CI pipeline (install, prisma generate, unit tests)