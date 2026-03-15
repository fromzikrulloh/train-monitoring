# Technology Stack

## Core
- **Language**: JavaScript (Node.js)
- **Runtime**: Node.js 18+
- **Framework**: None — single-file polling script

## Data
- **Primary DB**: None
- **Cache**: None
- **Storage**: None — stateless

## Infrastructure
- **Container**: Docker (optional, for deployment)
- **CI/CD**: None (manual run)
- **Hosting**: Any VPS or local machine

## Integrations
| Service | Purpose | Protocol |
|---------|---------|---------|
| eticket.railway.uz | Source of train/seat data | HTTPS REST API |
| Telegram Bot API | Send notifications to user | HTTPS REST API |

## Key Libraries
| Library | Purpose | Version |
|---------|---------|---------|
| dotenv | Load `.env` config into `process.env` | 16.4.7 |

## Dev Tools
| Tool | Purpose |
|------|---------|
| node --check | Syntax validation |
| node:test | Built-in test runner |

## Constraints
- No external database — stateless polling
- Must run on ARM64 (Mac) and AMD64 (VPS)
- Single process, no clustering needed
- Keep dependencies minimal
