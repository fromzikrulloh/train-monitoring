# Node.js Rules

## Style
- CommonJS modules (`require`/`module.exports`) — this project does not use ESM
- `camelCase` for variables and functions
- `UPPER_SNAKE_CASE` for top-level constants (config values)
- `PascalCase` is not used — no classes in this project
- No semicolons at end of object properties, but semicolons at end of statements

## Error Handling
- Use `try/catch` in async functions at boundary level (poll loop)
- Always log errors with context: `console.error('context:', err.message)`
- Never swallow errors silently

## Async
- Prefer `async/await` over `.then()/.catch()` chains
- Use `Promise`-based wrappers for callback APIs (see `httpsRequest` pattern)

## Dependencies
- Only add dependencies that are listed in `docs/TECH_STACK.md`
- Pin all versions in `package.json`
- Do not use `^` or `~` for version ranges — use exact versions

## Testing
- Framework: Node.js built-in `node:test` (no extra deps)
- Test files: `*.test.js`
- Pattern: Arrange → Act → Assert
