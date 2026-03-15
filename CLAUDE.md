# train-monitor

Помощник для мониторинга доступных мест в поезде. Polls eticket.railway.uz every 5 minutes and sends Telegram notifications when seats become available in the target price range.

## Commands

```bash
# Run the monitor
node index.js

# Install dependencies
npm install
```

## Key Directories

- `index.js` — main polling loop and Telegram notification logic
- `docs/` — project artifacts (AI DE): tech stack, architecture, conventions, epics, tasks
- `.claude/` — AI DE configuration

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `TELEGRAM_BOT_TOKEN` — Telegram bot token from @BotFather
- `TELEGRAM_CHAT_ID` — Target chat ID to receive notifications

## Architecture

Single-file Node.js polling bot. No database. Reads config from `.env`, polls the train API on a timer, sends Telegram messages on findings.

## AI DE

Project artifacts live in `docs/`. Use `/plan-epic`, `/start-task`, `/status` to manage development.
