# wFirma MCP Server

MCP (Model Context Protocol) server for [wFirma.pl](https://wfirma.pl/) -- a Polish invoicing and accounting platform.

[![npm version](https://img.shields.io/npm/v/wfirma-mcp-server)](https://www.npmjs.com/package/wfirma-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

## Features

- Connects AI assistants (Claude Desktop, Claude Code, etc.) to your wFirma account via the [wFirma API](https://doc.wfirma.pl/)
- **Interactive MCP App (`ui://wfirma/finance-explorer`)** -- opens an inline / fullscreen Finance Explorer directly inside Claude when reviewing sales invoices or expenses (with KPI cards, 1-click **JPK-only vs KPiR** filter presets, slide-over VAT/line-item inspector, and CSV/XLS export)
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

# 4. Add to Claude Desktop or Claude Code (see below)
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
| `finance_dashboard` | Open interactive **wFirma Finance Explorer** MCP App preloaded with expenses, invoices, and company info |
| `expenses_find` | Search expenses with filters (`register_vat_book`, `register_tax_book`, `date`, `type`, etc.) — linked to MCP App |
| `expenses_get` | Get expense by ID with full details (`expense_parts`, contractor, payments) — linked to MCP App |
| `expenses_count` | Count expenses matching conditions |
| `contractors_find` | Search contractors with filters (name, NIP, etc.) |
| `contractors_get` | Get contractor by ID |
| `invoices_find` | Search sales invoices with filters — linked to MCP App |
| `invoices_get` | Get sales invoice by ID — linked to MCP App |
| `payments_find` | Search payments |
| `vat_codes_find` | List available VAT rates |
| `company_info` | Get current company information (name, NIP, tax type, VAT status) |
| `api_request` | Raw API call for any module/action |

## Available MCP Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Finance Explorer (MCP App) | `ui://wfirma/finance-explorer` | Interactive HTML/JS MCP App (`text/html;profile=mcp-app`) for reviewing invoices and expenses inside Claude |
| Expense Fields | `wfirma://reference/expense-fields` | Reference for expense field values (`register_tax_book`, `register_vat_book`, `type`, `schema`, etc.) |
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

- **src/index.ts** -- MCP server entry point. Registers tools, resources, and starts stdio transport.
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
