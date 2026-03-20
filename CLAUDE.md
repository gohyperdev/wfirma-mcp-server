# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for wFirma — a Polish invoicing/accounting platform. The server exposes wFirma API operations as MCP tools over stdio transport, for use with Claude Code/Desktop.

**Primary use case:** Read existing expenses (wydatki) that are only in JPK (not booked in KPiR), and create new expense documents booked in KPiR based on them.

**Key limitation:** wFirma API expenses module is read-only — there is no `expenses/add` endpoint. Creating expenses requires either browser automation or manual entry.

## Build & Run

```bash
npm run build          # TypeScript → dist/
npm run dev            # Run with tsx (no build needed)
npm test               # Run vitest
npx tsx src/test-connection.ts  # Test API connection
```

## Architecture

- **src/index.ts** — MCP server entry point. Registers tools and starts stdio transport.
- **src/wfirma-client.ts** — HTTP client for wFirma API. Handles auth, request formatting, error handling.
- **src/test-connection.ts** — Quick connection test script.

### wFirma API

- Base URL: `https://api2.wfirma.pl/`
- Pattern: `POST /{module}/{action}[/{id}]?inputFormat=json&outputFormat=json`
- Auth: API Key headers (`accessKey`, `secretKey`, `appKey`) — Basic Auth disabled since 2023
- Env vars: `WFIRMA_ACCESS_KEY`, `WFIRMA_SECRET_KEY`, `WFIRMA_APP_KEY` (or `WFIRMA_LOGIN` + `WFIRMA_PASSWORD` fallback)
- Optional: `WFIRMA_COMPANY_ID` for multi-company accounts
- Docs: https://doc.wfirma.pl (SPA, must view in browser)

### Key expense fields

- `accounting_effect`: `kpir_and_vat` | `kpir` | `vat` | `nothing` — controls KPiR vs JPK booking
- `type`: `invoice` | `bill` | `vat_exempt`
- `schema` (in expense_parts): `cost` | `purchase_trade_goods` | `vehicle_fuel` | `vehicle_expense`

### MCP Tools

| Tool | Purpose |
|------|---------|
| `expenses_find` | Search expense documents |
| `expenses_get` | Get expense by ID |
| `contractors_find` | Search contractors |
| `contractors_get` | Get contractor by ID |

## Conventions

- All wFirma API calls go through `WFirmaClient` — never call fetch directly.
- Tool handlers catch errors and return `{ isError: true }` — never let exceptions propagate to MCP transport.
- API credentials come from environment variables, never hardcoded.
