# Contributing

Thanks for your interest in contributing to wFirma MCP Server!

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/gohyperdev/wfirma-mcp-server.git
   cd wfirma-mcp-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and add your wFirma API credentials (needed for integration testing):

   ```bash
   cp .env.example .env
   ```

4. Build and run tests:

   ```bash
   npm run build
   npm test
   ```

## Running in Development

```bash
npm run dev       # Runs with tsx, no build step needed
```

## Testing

Tests use [vitest](https://vitest.dev/). Run them with:

```bash
npm test              # Watch mode
npx vitest run        # Single run
```

All new features should include tests. Unit tests live alongside the source files (`*.test.ts`).

## Code Style

- TypeScript with strict mode enabled
- No `any` types -- use proper typing or `unknown`
- All wFirma API calls go through `WFirmaClient` -- never call `fetch` directly
- Tool handlers use `errorResult()` / `jsonResult()` helpers
- API credentials come from environment variables, never hardcoded

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes with tests
3. Ensure `npm run build` and `npm test` pass
4. Open a pull request with a clear description of the change

## Reporting Issues

Open an issue on GitHub with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Node.js version and OS
