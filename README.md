# wFirma MCP Server

MCP (Model Context Protocol) server for [wFirma.pl](https://wfirma.pl/) -- a Polish invoicing and accounting platform.

[![npm version](https://img.shields.io/npm/v/wfirma-mcp-server)](https://www.npmjs.com/package/wfirma-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

## Features

- Connects AI assistants (Claude Desktop, Claude Code, etc.) to your wFirma account via the [wFirma API](https://doc.wfirma.pl/)
- Search and retrieve expenses, invoices, contractors, payments, and VAT codes
- Count and filter documents using flexible conditions with typed operators
- Get company information for multi-company accounts
- Generic API access for any wFirma module/action not covered by dedicated tools
- Built-in reference resources for expense fields and API module documentation
- Electron testing client for interactive debugging

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/gohyperdev/wfirma-mcp-server.git
cd wfirma-mcp-server
npm install

# 2. Configure credentials
cp .env.example .env
# Edit .env with your wFirma API keys

# 3. Build
npm run build

# 4. Add to your MCP client, including Codex (see below)
```

## Setup

### 1. Get API Credentials

You need three keys from wFirma:

- **accessKey** + **secretKey** -- generate in wFirma: Ustawienia > Bezpieczenstwo > Aplikacje > Klucze API
- **appKey** -- request via the form at [wfirma.pl/kontakt](https://wfirma.pl/kontakt)

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
WFIRMA_ACCESS_KEY=your_access_key
WFIRMA_SECRET_KEY=your_secret_key
WFIRMA_APP_KEY=your_app_key

# Optional: company ID for multi-company accounts
# WFIRMA_COMPANY_ID=your_company_id
```

### 3. Build

```bash
npm install
npm run build
```

## Usage with Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wfirma": {
      "command": "node",
      "args": ["/absolute/path/to/wfirma-mcp-server/dist/index.js"],
      "env": {
        "WFIRMA_ACCESS_KEY": "your_access_key",
        "WFIRMA_SECRET_KEY": "your_secret_key",
        "WFIRMA_APP_KEY": "your_app_key"
      }
    }
  }
}
```

## Usage with Claude Code

```bash
claude mcp add wfirma node /absolute/path/to/wfirma-mcp-server/dist/index.js \
  -e WFIRMA_ACCESS_KEY=your_access_key \
  -e WFIRMA_SECRET_KEY=your_secret_key \
  -e WFIRMA_APP_KEY=your_app_key
```

## Usage with Codex (local Streamable HTTP/HTTPS)

Codex supports both the existing local **stdio** server and a **Streamable HTTP** server. The HTTP(S) mode below is useful when you want Codex to connect to a server that you start and keep running yourself.

The server binds to `127.0.0.1` by default, so it is not reachable from other machines. It exposes MCP at `/mcp`.

### Start with HTTPS

Create or obtain a certificate trusted by your Mac (for example with [mkcert](https://github.com/FiloSottile/mkcert)), then add to `.env`:

```env
MCP_TRANSPORT=https
MCP_HOST=127.0.0.1
MCP_PORT=3333
MCP_PATH=/mcp
MCP_TLS_CERT_FILE=/absolute/path/to/localhost.pem
MCP_TLS_KEY_FILE=/absolute/path/to/localhost-key.pem

# Recommended even on localhost; use a long random value.
MCP_AUTH_TOKEN=replace-with-a-long-random-value
```

Build and start it:

```bash
npm run build
MCP_TRANSPORT=https node dist/index.js
```

In the Codex desktop app: **Settings → MCP servers → Add server → Streamable HTTP**, then use:

```text
https://127.0.0.1:3333/mcp
```

If `MCP_AUTH_TOKEN` is set, add it to Codex as the bearer token for this MCP server. Restart Codex after saving the server.

### Local HTTP without TLS

For a server bound only to your own machine, plain HTTP is also supported and avoids certificate setup:

```bash
MCP_TRANSPORT=http npm run dev
```

Use `http://127.0.0.1:3333/mcp` in Codex. Do not bind this mode to a network interface unless you also configure a trusted HTTPS certificate and `MCP_AUTH_TOKEN`.

## Electron Testing Client

The `client/` directory contains an Electron app for interactive testing and debugging of the MCP server. It connects to the MCP server over stdio and provides a GUI to browse tools, call them with parameters, and inspect responses.

<!-- ![Electron client screenshot](docs/screenshot.png) -->

### Running the client

```bash
cd client
npm install
npm start
```

The client supports multi-company management -- you can configure multiple wFirma accounts and switch between them.

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `expenses_find` | Search expenses with filters (accounting_effect, date, type, etc.) |
| `expenses_get` | Get expense by ID with full details |
| `expenses_count` | Count expenses matching conditions |
| `contractors_find` | Search contractors with filters (name, NIP, etc.) |
| `contractors_get` | Get contractor by ID |
| `invoices_find` | Search invoices with filters |
| `invoices_get` | Get invoice by ID |
| `payments_find` | Search payments |
| `vat_codes_find` | List available VAT rates |
| `company_info` | Get current company information (name, NIP, tax type, VAT status) |
| `api_request` | Raw API call for any module/action |

## Available MCP Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Expense Fields | `wfirma://reference/expense-fields` | Reference for expense field values (accounting_effect, type, schema, etc.) |
| API Modules | `wfirma://reference/api-modules` | Available API modules and their supported actions |

## Development

```bash
npm run dev       # Run with tsx (no build needed)
npm run build     # Compile TypeScript to dist/
npm test          # Run tests with vitest
```

### Test API Connection

```bash
npx tsx src/test-connection.ts
```

### MCP Inspector

Use the visual MCP inspector for debugging:

```bash
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

## Architecture

- **src/index.ts** -- MCP server entry point. Registers tools and resources, then starts either stdio or local Streamable HTTP(S) transport.
- **src/wfirma-client.ts** -- HTTP client for wFirma API. Typed conditions/params, auth handling, error handling.
- **src/test-connection.ts** -- Quick connection test script.
- **client/** -- Electron testing client for interactive debugging.

See [CLAUDE.md](CLAUDE.md) for detailed architecture notes, field references, and development conventions.

## wFirma API Notes

- Base URL: `https://api2.wfirma.pl/`
- Endpoint pattern: `POST /{module}/{action}[/{id}]?inputFormat=json&outputFormat=json`
- Auth: API Key headers (`accessKey`, `secretKey`, `appKey`)
- Basic Auth has been disabled since July 2023
- Docs: [doc.wfirma.pl](https://doc.wfirma.pl/) (SPA -- must view in browser)
- **Expenses module is read-only** -- the API does not support creating expenses (`expenses/add` does not exist)

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
