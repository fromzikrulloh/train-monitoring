# Architecture Decision Records

This file documents significant architecture and technology decisions for the project.

Format: Each decision is an ADR (Architecture Decision Record) numbered sequentially.

---

## ADR-001: Single-file Node.js script (no framework)

**Date**: 2026-03-15
**Status**: Accepted

**Context**: The monitor is a simple polling script with two external integrations (railway API + Telegram). No HTTP server, no database, no complex routing needed.

**Decision**: Implement as a single `index.js` file using Node.js built-ins (`https`) and `dotenv`. No frameworks, no bundlers.

**Consequences**:
- (+) Zero-friction start, minimal dependencies
- (+) Easy to deploy anywhere Node.js is available
- (-) Will need to be split into modules if complexity grows significantly

---

## ADR-002: No database / stateless polling

**Date**: 2026-03-15
**Status**: Accepted

**Context**: The only goal is to notify when cheap seats appear. No history, no deduplication across restarts, no user state needed for MVP.

**Decision**: Stateless — every poll fetches fresh data and sends a Telegram message with results. Restart = silent gap in polling.

**Consequences**:
- (+) No infrastructure to manage
- (-) Duplicate loud alerts possible if cheap seats persist across polls (acceptable for MVP)

---

<!-- Add new ADRs below this line -->
