# Testing

## Test Scenarios Executed

### Authentication
| Scenario | Expected | Result |
|---|---|---|
| Register with valid data | 201 + user object | ✅ Pass |
| Register with duplicate email | 409 EMAIL_EXISTS | ✅ Pass |
| Login with valid credentials | 200 + JWT token | ✅ Pass |
| Login with wrong password | 401 INVALID_CREDENTIALS | ✅ Pass |
| Access protected route without token | 401 UNAUTHORIZED | ✅ Pass |
| Access protected route with expired token | 401 INVALID_TOKEN | ✅ Pass |

### Meeting Management
| Scenario | Expected | Result |
|---|---|---|
| Create meeting with valid data | 201 + meeting object | ✅ Pass |
| Get meeting by valid ID | 200 + meeting details | ✅ Pass |
| Get meeting by invalid ID | 404 NOT_FOUND | ✅ Pass |
| List meetings with pagination | 200 + pagination meta | ✅ Pass |

### AI Analysis
| Scenario | Expected | Result |
|---|---|---|
| Analyze meeting with transcript | 200 + insights with citations | ✅ Pass |
| Analyze already analyzed meeting | 409 ALREADY_ANALYZED | ✅ Pass |
| Citations reference real timestamps | Valid timestamps only | ✅ Pass |

### Action Items
| Scenario | Expected | Result |
|---|---|---|
| Create action item manually | 201 + action item | ✅ Pass |
| Update status to IN_PROGRESS | 200 + updated item | ✅ Pass |
| Update status to COMPLETED | 200 + updated item | ✅ Pass |
| Update with invalid status | 400 INVALID_STATUS | ✅ Pass |
| Get overdue items | 200 + overdue list | ✅ Pass |
| Filter by assignee | 200 + filtered list | ✅ Pass |

### Discord Integration
| Scenario | Expected | Result |
|---|---|---|
| Send reminder for overdue item | Discord message received | ✅ Pass |
| Reminder logged in DB | ReminderLog created | ✅ Pass |
| Cron job runs automatically | Runs every hour | ✅ Pass |

### Input Validation
| Scenario | Expected | Result |
|---|---|---|
| Register with invalid email | 400 VALIDATION_ERROR | ✅ Pass |
| Register with missing fields | 400 VALIDATION_ERROR | ✅ Pass |
| Register with short password (<6) | 400 VALIDATION_ERROR | ✅ Pass |
| Create meeting with invalid date | 400 VALIDATION_ERROR | ✅ Pass |
| Create meeting with empty transcript | 400 VALIDATION_ERROR | ✅ Pass |
| Create action item with non-UUID meetingId | 400 VALIDATION_ERROR | ✅ Pass |
| Malformed JSON body | 400 VALIDATION_ERROR | ✅ Pass |

## Automated Unit Tests

Run with `npm test` (also runs in CI on every push/PR). Current suite: **16 tests across 5 files**

- `validation.test.js` — Zod validate middleware (email, missing fields, dates, transcript)
- `citations.test.js` — citation grounding / hallucination detection
- `actionItems.test.js` — status enum guard (INVALID_STATUS)
- `error.test.js` — error helper
- `response.test.js` — unified response format

## Edge Cases Considered

- Transcript with single entry
- Meeting with no decisions or follow-ups
- Action item with no due date
- Multiple overdue items in one cron run
- Duplicate email registration
- Invalid JWT token format
- Empty transcript array

## Limitations Discovered

- No retry mechanism if Discord webhook fails
- Cron job sends duplicate reminders every hour for same overdue item
- No pagination on action items endpoint
- Analysis cannot be re-run after first analysis