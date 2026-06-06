<div align="center">

#  Hintro Meeting Intelligence

<img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/node-%3E%3D18.0.0-green?style=for-the-badge&logo=node.js" />
<img src="https://img.shields.io/badge/license-ISC-yellow?style=for-the-badge" />
<img src="https://img.shields.io/badge/status-live-brightgreen?style=for-the-badge" />


### AI-powered backend that turns raw meeting transcripts into structured insights, action items, and automated reminders.

[Live API](https://your-render-url.onrender.com) · [Swagger Docs](https://your-render-url.onrender.com/api-docs) · [GitHub](https://github.com/Vegapunk-debug/hintro-meeting-intelligence)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [AI Approach](#-ai-approach)
- [Project Structure](#-project-structure)

---

## Overview

Hintro Meeting Intelligence is a production-grade REST API that:

- **Stores** meeting information and full transcripts
- **Analyzes** transcripts using Groq AI to extract insights
- **Citations** every AI-generated insight to the exact transcript timestamp
- **Tracks** action items through their lifecycle
- **Detects** overdue tasks automatically
- **Notifies** teams via Discord when items are overdue

---

## Features

| Feature | Description | Status |
|---|---|---|
| JWT Authentication | Secure register & login | ✅ Done |
| Meeting Management | Create, list, get meetings with pagination | ✅ Done |
| AI Analysis | Groq-powered insights with citation grounding | ✅ Done |
| Hallucination Prevention | 4-layer validation strategy | ✅ Done |
| Action Items | Create, update, filter tasks | ✅ Done |
| Overdue Detection | Auto-detects past-due incomplete tasks | ✅ Done |
| Discord Reminders | Automated webhook notifications | ✅ Done |
| Cron Scheduler | Runs overdue check every hour | ✅ Done |
| Swagger Docs | Full OpenAPI 3.0 documentation | ✅ Done |
| Trace IDs | Every request tracked end-to-end | ✅ Done |
| Structured Logging | JSON logs with timestamp & context | ✅ Done |

---

## Tech Stack

```
Runtime       →  Node.js v18+ + Express.js
Database      →  PostgreSQL (Neon) + Prisma ORM v6
AI Provider   →  Groq (llama-3.1-8b-instant)
Auth          →  JWT + bcryptjs
Notifications →  Discord Webhook
Scheduler     →  node-cron
Validation    →  Zod
Docs          →  Swagger UI (swagger-ui-express)
Deployment    →  Render
```

---

## Architecture

```
Client Request
      │
      ▼
  TraceID Middleware      ← generates unique ID per request
      │
      ▼
  Auth Middleware         ← verifies JWT token
      │
      ▼
  Validation Middleware   ← validates request body (Zod)
      │
      ▼
  Controller              ← handles req/res
      │
      ▼
  Service                 ← business logic + DB queries
      │
      ▼
  Prisma ORM             ← talks to PostgreSQL
      │
      ▼
  PostgreSQL (Neon)      ← stores all data

  ─────────────────────────────────────

  node-cron (every hour)
      │
      ▼
  Find overdue items
      │
      ▼
  Discord Webhook        ← sends rich embed notification
      │
      ▼
  ReminderLog            ← records reminder history
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database ([Neon](https://neon.tech) recommended — free)
- [Groq API Key](https://console.groq.com) — free
- Discord Webhook URL

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hintro-meeting-intelligence.git
cd hintro-meeting-intelligence/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
# Fill in your values
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start the server

```bash
# Development
npm run dev

# Production
npm start
```

### 6. Open Swagger docs

```
http://localhost:3000/api-docs
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI
GROQ_API_KEY=your-groq-api-key

# Notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

---

## API Reference

### Base URL
```
Local:      http://localhost:3000
Production: https://your-render-url.onrender.com
```

### Authentication

All protected routes require:
```
Authorization: Bearer <your-jwt-token>
```

---

### Auth Endpoints

#### Register
```http
POST /api/auth/register
```
```json
{
  "name": "Rohit",
  "email": "rohit@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
```
```json
{
  "email": "rohit@example.com",
  "password": "password123"
}
```
> Returns a JWT token — use it in all protected requests.

---

### Meeting Endpoints

#### Create Meeting
```http
POST /api/meetings
Authorization: Bearer <token>
```
```json
{
  "title": "Sprint Planning",
  "participants": ["alice@example.com", "bob@example.com"],
  "meetingDate": "2026-05-20T10:00:00Z",
  "transcript": [
    { "timestamp": "00:10", "speaker": "John", "text": "We should launch next Friday." },
    { "timestamp": "00:20", "speaker": "Alice", "text": "I will prepare release notes." }
  ]
}
```

#### List Meetings (paginated)
```http
GET /api/meetings?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Meeting by ID
```http
GET /api/meetings/:id
Authorization: Bearer <token>
```

---

### AI Analysis

#### Analyze Meeting
```http
POST /api/meetings/:id/analyze
Authorization: Bearer <token>
```

**Response:**
```json
{
  "traceId": "abc-123",
  "success": true,
  "data": {
    "analysis": {
      "summary": [
        {
          "text": "Team agreed to launch on Friday the 27th.",
          "citations": [{ "timestamp": "00:10" }]
        }
      ],
      "decisions": [...],
      "followUps": [...]
    },
    "actionItems": [
      {
        "task": "Prepare release notes",
        "assignee": "Alice",
        "citations": [{ "timestamp": "00:20" }]
      }
    ]
  }
}
```

---

### Action Item Endpoints

#### Create Action Item
```http
POST /api/action-items
Authorization: Bearer <token>
```
```json
{
  "meetingId": "uuid-here",
  "task": "Prepare release notes",
  "assignee": "Alice",
  "dueDate": "2026-05-25T10:00:00Z"
}
```

#### Update Status
```http
PATCH /api/action-items/:id/status
Authorization: Bearer <token>
```
```json
{
  "status": "IN_PROGRESS"
}
```
> Valid statuses: `PENDING` | `IN_PROGRESS` | `COMPLETED`

#### List Action Items (with filters)
```http
GET /api/action-items?status=PENDING&assignee=Alice&meetingId=uuid
Authorization: Bearer <token>
```

#### Get Overdue Items
```http
GET /api/action-items/overdue
Authorization: Bearer <token>
```

---

### System Endpoints

```http
GET /health          → { "status": "UP" }
GET /api/evaluation  → candidate info
GET /api-docs        → Swagger UI
```

---

## AI Approach

### Hallucination Prevention — 4 Layers

```
Layer 1 → System prompt with strict rules
          "Only use information explicitly stated in transcript"

Layer 2 → Valid timestamps listed in prompt
          AI can only cite timestamps that actually exist

Layer 3 → Temperature 0.1
          Keeps model factual and deterministic

Layer 4 → Programmatic citation validation
          Every citation verified against real transcript timestamps
          HALLUCINATION_DETECTED error thrown if invalid citation found
```

### JSON Mode

Groq's `response_format: { type: "json_object" }` guarantees valid JSON output — eliminating parse errors entirely.

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # DB models
│   └── migrations/            # Migration history
├── src/
│   ├── config/
│   │   └── db.js              # Prisma client
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── traceId.js         # Trace ID injector
│   │   ├── validate.js        # Zod validation
│   │   └── errorHandler.js    # Global error handler
│   ├── modules/
│   │   ├── auth/              # Register & login
│   │   ├── meetings/          # Meeting CRUD
│   │   ├── analysis/          # AI analysis
│   │   ├── actionItems/       # Task management
│   │   └── reminders/         # Discord service
│   ├── utils/
│   │   ├── response.js        # Unified response format
│   │   ├── logger.js          # Structured logger
│   │   └── error.js           # Error helper
│   ├── jobs/
│   │   └── overdueChecker.js  # Cron job
│   └── app.js                 # Express app
├── swagger/
│   └── swagger.json           # OpenAPI spec
├── tests/
├── server.js                  # Entry point
├── .env.example
└── package.json
```

---


### Live URLs

| Resource | URL |
|---|---|
| API Base | `https://your-render-url.onrender.com` |
| Swagger Docs | `https://your-render-url.onrender.com/api-docs` |
| Health Check | `https://your-render-url.onrender.com/health` |
| Evaluation | `https://your-render-url.onrender.com/api/evaluation` |

---

## Database Schema

```
User
 └── Meeting (one-to-many)
      ├── Analysis (one-to-one)
      └── ActionItem (one-to-many)
           └── ReminderLog (one-to-many)
```

---

<div align="center">

**[Rohit Nair P](https://github.com/Vegapunk-debug)** · [rohitnairmuttathethu@gmail.com](mailto:rohitnairmuttathethu@gmail.com)

</div>