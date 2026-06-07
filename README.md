<div align="center">

#  Hintro Meeting Intelligence

<img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/node-%3E%3D18.0.0-green?style=for-the-badge&logo=node.js" />
<img src="https://img.shields.io/badge/license-ISC-yellow?style=for-the-badge" />
<img src="https://img.shields.io/badge/status-live-brightgreen?style=for-the-badge" />


### AI-powered backend that turns raw meeting transcripts into structured insights, action items, and automated reminders.

[Live API](https://hintro-meeting-intelligence-yq8w.onrender.com) · [Swagger Docs](https://hintro-meeting-intelligence-yq8w.onrender.com/api-docs) · [Evaluation](https://hintro-meeting-intelligence-yq8w.onrender.com/api/evaluation)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [AI Approach](#ai-approach)
- [Documentation](#documentation)
- [Project Structure](#project-structure)

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

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ · Express.js 5 |
| Database | PostgreSQL (Neon) · Prisma ORM v6 |
| AI Provider | Groq · `llama-3.1-8b-instant` |
| Auth | JWT · bcryptjs |
| Notifications | Discord Webhook |
| Scheduler | node-cron |
| Validation | Zod (schema-based request validation) |
| Docs | Swagger UI (`swagger-ui-express`) |
| Container | Docker · docker-compose |
| CI | GitHub Actions |
| Deployment | Render |

---

## Architecture

```mermaid
graph TD;
    Client["API Client / Swagger UI"] -->|HTTPS REST| Express["Express 5 App<br/>(cors · express.json)"];

    subgraph Global["Global Middleware (app.js)"]
        Express --> Trace["TraceID<br/>(unique id per request)"];
        Trace --> Logger["Request Logger<br/>(structured JSON logs)"];
    end

    Logger --> Router{"Route<br/>/api/*"};

    subgraph PerRoute["Per-Route Middleware"]
        Router --> Auth["JWT Authenticate"];
        Auth --> Valid["Zod Validate<br/>(on write routes)"];
    end

    Valid --> Ctrl["Controller<br/>(req / res)"];
    Ctrl --> Svc["Service<br/>(business logic)"];

    subgraph Modules["Feature Modules"]
        Svc --> M1["auth"];
        Svc --> M2["meetings"];
        Svc --> M3["analysis"];
        Svc --> M4["actionItems"];
    end

    M3 -->|"transcript prompt<br/>(JSON mode, temp 0.1)"| Groq["Groq LLM<br/>llama-3.1-8b-instant"];
    Groq -->|raw insights| Cite["validateCitations<br/>(4-layer hallucination guard)"];
    Cite --> Svc;

    Svc -->|Read / Write| Prisma["Prisma ORM v6"];
    Prisma --> DB[("PostgreSQL · Neon<br/>User · Meeting · Analysis<br/>ActionItem · ReminderLog")];

    Ctrl -.->|throws| Err["Error Handler<br/>(unified error response)"];

    subgraph Scheduler["Background Scheduler"]
        Cron["node-cron<br/>(every hour)"] --> Overdue["Overdue Checker<br/>(status ≠ COMPLETED & dueDate &lt; now)"];
    end

    Overdue -->|query overdue items| Prisma;
    Overdue -->|rich embed POST| Discord["Discord Webhook"];
    Overdue -->|record history| Prisma;
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
git clone https://github.com/Vegapunk-debug/hintro-meeting-intelligence.git
cd hintro-meeting-intelligence/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

From the `backend/` directory (where you are after step 1), copy the example file and fill in your values:

```bash
cp .env.example .env   # copies backend/.env.example -> backend/.env
```

See [Environment Variables](#environment-variables) for what each value means.

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

### Run with Docker (alternative)

Spin up the API and a PostgreSQL database together:

```bash
cd backend
# GROQ_API_KEY / DISCORD_WEBHOOK_URL are read from your shell or a .env file
docker compose up --build
```

The container runs `prisma migrate deploy` on startup, then serves on
`http://localhost:3000`.

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

## Deployment

The API is deployed on **Render** and auto-deploys on every push to `main`. It is live at
[`https://hintro-meeting-intelligence-yq8w.onrender.com`](https://hintro-meeting-intelligence-yq8w.onrender.com).

### Render (current setup)

Render builds and runs the service directly from the `Dockerfile` — no build/start commands
are configured in the dashboard; they come from the image.

| Setting | Value |
|---|---|
| Environment | Docker |
| Root Directory | `backend` |
| Dockerfile Path | `backend/Dockerfile` |
| Health Check Path | `/health` |

On start the container runs `npx prisma migrate deploy && node server.js`, so the database
schema is applied automatically on every deploy. Set the values from
[Environment Variables](#environment-variables) in the Render dashboard under
**Settings → Environment**.

### Deploy with Docker (any host)

The same `Dockerfile` (`backend/Dockerfile`) runs anywhere — it applies migrations, then
boots the server:

```bash
cd backend
docker build -t hintro-meeting-intelligence .
docker run -p 3000:3000 --env-file .env hintro-meeting-intelligence
```

On start the container runs `npx prisma migrate deploy && node server.js`.

---

## API Reference

### Base URL
```
Local:      http://localhost:3000
Production: https://hintro-meeting-intelligence-yq8w.onrender.com
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

## Documentation

| Document | What's inside |
|---|---|
| [AI_APPROACH.md](./AI_APPROACH.md) | Provider/model choice, prompt design, and the 4-layer hallucination-prevention strategy |
| [DECISIONS.md](./DECISIONS.md) | Technical decisions and trade-offs (database, ORM, auth, scheduler, etc.) |
| [TESTING.md](./TESTING.md) | Test scenarios executed and how to run the suite |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [CHECKLIST.md](./CHECKLIST.md) | Submission checklist against the assignment requirements |

---

## Project Structure

<details>
<summary>Click to expand the full directory tree</summary>

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
├── tests/                     # Jest unit tests
├── Dockerfile                 # Container build
├── docker-compose.yml         # Local API + PostgreSQL
├── .dockerignore
├── server.js                  # Entry point
├── .env.example
└── package.json

.github/workflows/ci.yml       # GitHub Actions: install, prisma generate, test
```

> Each module also has a `*.schema.js` (Zod) used by the `validate` middleware.

</details>

---

<div align="center">

**[Rohit Nair P](https://github.com/Vegapunk-debug)** · [rohitnairmuttathethu@gmail.com](mailto:rohitnairmuttathethu@gmail.com)

</div>