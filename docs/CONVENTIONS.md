# Code Conventions

## Language: JavaScript (Node.js, CommonJS)

## Naming

### Files
- `kebab-case.js` for multi-word files
- Test files: `*.test.js`

### Variables & Functions
- `camelCase` for local variables and function names
- `UPPER_SNAKE_CASE` for module-level constants (config, thresholds)

### Constants
- `UPPER_SNAKE_CASE` — e.g., `TELEGRAM_BOT_TOKEN`, `POLL_INTERVAL_MS`

### Modules
- CommonJS only: `require()` / `module.exports`
- No ESM (`import`/`export`)

## Code Style

### Functions
- Max ~50 lines per function — extract helpers if longer
- Single responsibility — one function does one thing
- Early return / guard clauses for error conditions
- Async functions use `async/await`, not `.then()` chains

### Error Handling
- Wrap async poll body in `try/catch`; log errors with context
- Never swallow errors silently
- Use `.catch()` only at integration boundaries (e.g., `sendTelegram` fire-and-forget)

### Comments
- Only for non-obvious logic
- No TODO without task ID: `// TODO(T-042): description`

### Imports
- Order: Node.js builtins, then npm packages, then local files
- No unused requires

## Testing

### Framework
- Node.js built-in `node:test`

### Structure
- Test files alongside source: `*.test.js`
- Naming: `describe('functionName') → it('should ... when ...')`
- Arrange → Act → Assert pattern

### Coverage
- Aim for 80%+ on business logic (filtering, formatting)
- No coverage required for I/O wrappers

## Git

### Branch Naming
- `feature/T[NNN]-[short-description]`
- `fix/T[NNN]-[short-description]`

### Commit Messages
- Format: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Example: `feat(config): add env validation on startup`
- Reference task: `Refs: T-042`

## Project-Specific Rules
- All config via `.env` — no hardcoded tokens or chat IDs
- Route and date currently hardcoded in `REQUEST_BODY` — document when changing
- Telegram messages use HTML parse mode — escape user-controlled strings with `<` `>` `&`
