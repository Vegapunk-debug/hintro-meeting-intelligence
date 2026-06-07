# Technical Decisions

## 1. Database — PostgreSQL + Prisma ORM v6

**Chosen:** PostgreSQL hosted on Neon + Prisma ORM

**Why:**
The data is highly relational — `User → Meeting → ActionItem → ReminderLog`. MongoDB with nested documents would get messy fast here. Prisma ORM eliminates raw SQL entirely — queries are plain JavaScript objects.

**Alternatives considered:**
- MongoDB — rejected. Relational data with foreign keys fits PostgreSQL better. Fighting schema design with Mongo would cost more time than it saves.
- SQLite — rejected. Deployment on Render is problematic with SQLite file storage.
- MySQL — no advantage over PostgreSQL for this use case.

**Trade-offs:**
- Prisma adds a build step (`prisma generate`) but saves significant development time
- Neon free tier has connection limits — acceptable for internship scale
- Chose Prisma v6 over v7 specifically because v7 introduced breaking `prisma.config.ts` changes that add unnecessary complexity

---

## 2. Authentication — JWT

**Chosen:** JWT (JSON Web Tokens) with bcryptjs password hashing

**Why:**
Stateless — no session storage needed. Works perfectly with REST APIs. `req.user.userId` is available in every protected route after middleware runs. Industry standard for API authentication.

**Alternatives considered:**
- Session-based auth — requires server-side session store, adds Redis dependency
- API Keys — less secure for user-facing APIs, no expiry mechanism

**Trade-offs:**
- JWT tokens cannot be invalidated before expiry
- Mitigated by 7-day expiry and strong secret
- `bcrypt` salt rounds set to 10 — industry standard balance between security and performance

---

## 3. AI Provider — Groq

**Chosen:** Groq with `llama-3.1-8b-instant`

**Why:**
Completely free with no credit card required. Extremely fast inference. Supports `response_format: { type: "json_object" }` which guarantees valid JSON output — eliminates parse errors entirely. OpenAI-compatible API.

> Note: Initially tried `llama3-8b-8192` but it was deprecated May 2025. Switched to `llama-3.1-8b-instant`.

**Alternatives considered:**
- OpenAI GPT-4 — requires paid API key
- Gemini — more complex setup, less predictable JSON mode
- Claude API — requires paid API key

**Trade-offs:**
- 8B model is smaller than frontier models
- Compensated by strict 4-layer grounding gate — even a weaker model physically cannot store uncited content
- Groq free-tier rate limits may add latency under heavy load

---

## 4. External Integration — Discord Webhook

**Chosen:** Discord Webhook

**Why:**
Zero setup — just a URL. No OAuth, no bot configuration, no account linking. Done in under 5 minutes. Supports rich embed messages with fields, colors, and timestamps. Publicly documented API. Free with no limits.

**Alternatives considered:**
- Slack Webhook — requires workspace admin access
- Resend/SendGrid — requires domain verification, DKIM setup
- Telegram Bot — requires bot creation, token management, chat ID setup
- Google Calendar — OAuth nightmare, overkill for reminders

**Trade-offs:**
- Requires recipient to have Discord
- Acceptable because the integration is for internal team notifications, not end-user communication
- Evaluators verify the integration works via code and ReminderLog DB records — not by receiving the message themselves

---

## 5. Hallucination Prevention — Code Over Prompt

**Chosen:** Programmatic citation validation as the primary guarantee

**Why:**
Prompt engineering alone cannot guarantee correctness. Model behavior, model version, or provider can change. Moving the guarantee into deterministic code (`validateCitations` in `src/utils/citations.js`) means the integrity property holds regardless of what the model does.

**The design decision:**
```
Prompt   → reduces hallucination probability
Code     → eliminates it deterministically
```

**Trade-offs:**
- Strict validation can be conservative — a valid insight the model fails to cite is rejected rather than stored
- This is a deliberate bias toward precision over recall
- Failing with `422 HALLUCINATION_DETECTED` is intentional — a wrong answer is worse than no answer

---

## 6. Project Structure — Feature-Based Modules

**Chosen:**
```
src/modules/auth/
src/modules/meetings/
src/modules/analysis/
src/modules/actionItems/
src/modules/reminders/
```

Each module contains its own `routes.js`, `controller.js`, `service.js`, `schema.js`.

**Why:**
Every feature is self-contained. Easy to find, modify, and test specific functionality end-to-end without jumping across folders. Scales cleanly as features grow.

**Alternatives considered:**
- Layer-based structure (all controllers together, all services together) — harder to trace a single feature end-to-end. Opening `meetings` means touching 3 different top-level folders.

**Trade-offs:**
- Slightly more folders than layer-based
- Benefit of cohesion and navigability outweighs the extra structure
- `server.js` + `app.js` separated intentionally — `app.js` can be imported in tests without starting a real server port

---

## 7. Scheduler — node-cron

**Chosen:** node-cron running inside the Express process

**Why:**
Lightweight, zero external dependencies, simple cron syntax. Runs inside the same Node.js process — no separate worker needed. Perfect for single-server deployments on Render free tier.

**Alternatives considered:**
- Bull Queue — requires Redis, overkill for hourly reminders
- External cron service — adds external dependency and cost
- Render Cron Jobs — separate service, harder to share DB connection

**Trade-offs:**
- Stops running if the server restarts — acceptable for this scale
- No job queue — if a Discord send fails, reminder is logged as error and skipped until next hourly run
- Every overdue item gets a reminder every hour — no deduplication yet (known limitation)
- On a free-tier host that sleeps when idle, the hourly job may not fire reliably — documented as a known limitation

---

## 8. Input Validation — Zod

**Chosen:** Zod schemas applied via a reusable `validate()` middleware

**Why:**
Schema-first validation keeps rules declarative and colocated with each feature (`*.schema.js` next to the module). A single `validate(schema)` middleware keeps controllers thin and consistent. Produces clean, field-aware `400 VALIDATION_ERROR` responses in the unified format. Action-item status keeps an additional enum guard in the service layer — defense in depth, covered by unit tests.

**Alternatives considered:**
- express-validator — more imperative, rules scattered across route definitions
- Manual `if` checks in controllers — repetitive and easy to drift out of sync

**Trade-offs:**
- Adds a dependency, but eliminates hand-rolled validation and inconsistent errors entirely

---

## 9. Containerization & CI

**Chosen:** Dockerfile + docker-compose, GitHub Actions CI

**Why:**
Dockerfile gives a reproducible runtime — anyone can run `docker compose up --build` and get a working API + PostgreSQL stack locally without installing anything. CI runs `prisma generate` + the full unit test suite on every push, catching regressions before they reach Render.

**Trade-offs:**
- Render deploys from the native Node build (`npm install && npx prisma generate`) — Docker is provided as a portable local alternative, not the production deploy mechanism