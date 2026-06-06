# Technical Decisions

## 1. Database — PostgreSQL with Prisma ORM

**Chosen:** PostgreSQL (hosted on Neon) with Prisma ORM

**Why:**
- Data is highly relational: Users → Meetings → ActionItems → ReminderLogs
- Prisma ORM abstracts raw SQL completely, making queries clean JavaScript
- Neon provides free PostgreSQL hosting with zero setup
- Strong typing and auto-generated client from schema

**Alternatives Considered:**
- MongoDB — rejected because relational data fits PostgreSQL better
- SQLite — rejected because deployment on Render is complex with SQLite

**Trade-offs:**
- PostgreSQL is slightly more complex to set up than MongoDB
- Prisma adds a build step (prisma generate) but saves significant development time

---

## 2. Authentication — JWT

**Chosen:** JWT (JSON Web Tokens)

**Why:**
- Stateless — no session storage needed
- Works perfectly with REST APIs
- Industry standard for API authentication
- Easy to implement and verify

**Alternatives Considered:**
- Session-based auth — rejected because requires server-side session storage
- API Keys — rejected because less secure for user-facing APIs

**Trade-offs:**
- JWT tokens cannot be invalidated before expiry
- Mitigated by setting short expiry (7d) and using strong secret

---

## 3. AI Provider — Groq

**Chosen:** Groq with llama-3.1-8b-instant model

**Why:**
- Completely free with no credit card required
- Extremely fast inference (low latency)
- Supports JSON mode for structured outputs
- OpenAI-compatible API

**Alternatives Considered:**
- OpenAI — requires paid API key
- Gemini — more complex setup
- Claude — requires paid API key

**Trade-offs:**
- Groq has rate limits on free tier
- llama-3.1-8b-instant is smaller than GPT-4 but sufficient for meeting analysis

---

## 4. External Integration — Discord Webhook

**Chosen:** Discord Webhook

**Why:**
- Zero setup — just a URL, no OAuth or bot configuration
- Free with no limits
- Supports rich embed messages
- Publicly documented API

**Alternatives Considered:**
- Slack Webhook — requires workspace setup
- Resend Email — requires domain verification
- Telegram Bot — requires bot setup and token management

**Trade-offs:**
- Discord requires recipient to have Discord account
- Mitigated because integration is for internal team notifications

---

## 5. Project Structure — Modular by Feature

**Chosen:** Feature-based module structure

\`\`\`
src/modules/auth/
src/modules/meetings/
src/modules/analysis/
src/modules/actionItems/
src/modules/reminders/
\`\`\`

**Why:**
- Each feature is self-contained (routes, controller, service)
- Easy to find and modify specific functionality
- Scales well as features grow
- Industry standard for Express applications

**Alternatives Considered:**
- Layer-based structure (all controllers together, all services together)
- Rejected because it makes it harder to trace a feature end-to-end

**Trade-offs:**
- Slightly more folders than layer-based
- Benefit of cohesion outweighs the extra structure

---

## 6. Scheduler — node-cron

**Chosen:** node-cron

**Why:**
- Lightweight, no external dependencies
- Runs inside the same Node.js process
- Simple cron expression syntax
- Perfect for single-server deployments

**Alternatives Considered:**
- Bull Queue — overkill for this use case, requires Redis
- External cron service — adds external dependency

**Trade-offs:**
- Stops running when server restarts
- Acceptable for this assignment scope