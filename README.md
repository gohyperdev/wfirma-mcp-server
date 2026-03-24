# wFirma MCP Server

MCP (Model Context Protocol) server for [wFirma.pl](https://wfirma.pl/) — a Polish invoicing and accounting platform. Connects AI assistants (Claude, etc.) to your wFirma account via the [wFirma API](https://doc.wfirma.pl/).

## Tools

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
| `api_request` | Raw API call for any module/action |

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Expense Fields | `wfirma://reference/expense-fields` | Reference for expense field values (accounting_effect, type, schema, etc.) |
| API Modules | `wfirma://reference/api-modules` | Available API modules and their supported actions |

## Setup

### 1. Get API credentials

You need three keys from wFirma:

- **accessKey** + **secretKey** — generate in wFirma: Ustawienia → Bezpieczeństwo → Aplikacje → Klucze API
- **appKey** — request via the form at [wfirma.pl/kontakt](https://wfirma.pl/kontakt)

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
WFIRMA_ACCESS_KEY=your_access_key
WFIRMA_SECRET_KEY=your_secret_key
WFIRMA_APP_KEY=your_app_key
```

### 3. Build

```bash
npm install
npm run build
```

### 4. Add to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wfirma": {
      "command": "node",
      "args": ["/absolute/path/to/wFirmaAPI/dist/index.js"],
      "env": {
        "WFIRMA_ACCESS_KEY": "your_access_key",
        "WFIRMA_SECRET_KEY": "your_secret_key",
        "WFIRMA_APP_KEY": "your_app_key"
      }
    }
  }
}
```

### 5. Add to Claude Code

```bash
claude mcp add wfirma node /absolute/path/to/wFirmaAPI/dist/index.js \
  -e WFIRMA_ACCESS_KEY=your_access_key \
  -e WFIRMA_SECRET_KEY=your_secret_key \
  -e WFIRMA_APP_KEY=your_app_key
```

## Development

```bash
npm run dev       # Run with tsx (no build needed)
npm run build     # Compile TypeScript
npm test          # Run tests
```

### Test connection

```bash
npx tsx src/test-connection.ts
```

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

## wFirma API notes

- Base URL: `https://api2.wfirma.pl/`
- Endpoint pattern: `POST /{module}/{action}[/{id}]?inputFormat=json&outputFormat=json`
- Auth: API Key headers (`accessKey`, `secretKey`, `appKey`)
- Basic Auth has been disabled since July 2023
- Docs: [doc.wfirma.pl](https://doc.wfirma.pl/) (SPA — must view in browser)
- **Expenses module is read-only** — the API does not support creating expenses (`expenses/add` does not exist)

## License

MIT
