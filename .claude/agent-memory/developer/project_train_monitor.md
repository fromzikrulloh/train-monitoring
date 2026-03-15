---
name: train-monitor project context
description: Core facts about the train-monitor project — stack, structure, and current state
type: project
---

train-monitor is a single-file Node.js (CommonJS) polling bot at `/Users/zikrulloh/Projects/train-monitor/index.js`. It polls eticket.railway.uz every 5 minutes for available train seats on a hardcoded Tashkent → Margilon route (2026-03-18) and sends Telegram notifications.

**Why:** Personal utility to catch affordable tickets (150k–350k UZS) before they sell out.

**How to apply:** All tasks in this project operate on the single `index.js` entry point and the AI DE docs in `docs/`. No framework, no database, no build step — keep it simple.

Key facts:
- Runtime: Node.js 18+, CommonJS only (`require`/`module.exports`)
- Only dependency: `dotenv` 16.4.7 (pinned, no `^` or `~`)
- Config: `.env` with `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
- Tests: `node:test` built-in, files named `*.test.js`
- Git remote exists on `main` branch
- AI DE scaffold committed 2026-03-15 (commit b39e38c)
- Route and date are hardcoded in `REQUEST_BODY` — E002 epic will make them configurable
