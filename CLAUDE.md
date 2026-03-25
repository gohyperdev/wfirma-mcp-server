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
npx tsx src/test-connection.ts           # Test API connection
npx @modelcontextprotocol/inspector      # Visual MCP inspector
```

## Architecture

- **src/index.ts** — MCP server entry point. Registers tools, resources, and starts stdio transport.
- **src/wfirma-client.ts** — HTTP client for wFirma API. Typed conditions/params, auth handling, error handling.
- **src/test-connection.ts** — Quick connection test (counts expenses, finds JPK-only ones).

### wFirma API

- Base URL: `https://api2.wfirma.pl/`
- Pattern: `POST /{module}/{action}[/{id}]?inputFormat=json&outputFormat=json`
- Auth: API Key headers (`accessKey`, `secretKey`, `appKey`) — Basic Auth disabled since 2023
- Env vars: `WFIRMA_ACCESS_KEY`, `WFIRMA_SECRET_KEY`, `WFIRMA_APP_KEY` (or `WFIRMA_LOGIN` + `WFIRMA_PASSWORD` fallback)
- Optional: `WFIRMA_COMPANY_ID` for multi-company accounts
- Docs: https://doc.wfirma.pl (SPA, must view in browser)
- **Request body format:** `{ module: { parameters: { conditions, limit, page } } }` (object, NOT array)
- Find conditions format: `{ "0": { "condition": { "field": "...", "operator": "...", "value": "..." } } }`

### Key expense fields

- `register_tax_book`: `"1"` | `"0"` — whether expense is in KPiR
- `register_vat_book`: `"1"` | `"0"` — whether expense is in VAT register (JPK)
- JPK-only expenses: `register_vat_book = "1"` AND `register_tax_book = "0"` (534 as of 2026-03)
- `type`: `invoice` | `bill` | `vat_exempt`
- `schema` (in expense_parts): `invoice_cost` | `purchase_trade_goods` | `vehicle_fuel` | `vehicle_expense`

### MCP Tools

| Tool | Purpose |
|------|---------|
| `expenses_find` | Search expenses with conditions (accounting_effect, date, type, etc.) |
| `expenses_get` | Get expense by ID with full details |
| `expenses_count` | Count expenses matching conditions |
| `contractors_find` | Search contractors with conditions |
| `contractors_get` | Get contractor by ID |
| `invoices_find` | Search invoices with conditions |
| `invoices_get` | Get invoice by ID |
| `payments_find` | Search payments |
| `vat_codes_find` | List available VAT rates |
| `company_info` | Get current company information (name, NIP, tax type, VAT status) |
| `api_request` | Generic raw API call for any module/action |

### MCP Resources

| Resource | URI | Content |
|----------|-----|---------|
| expense-fields | `wfirma://reference/expense-fields` | Expense field values reference |
| api-modules | `wfirma://reference/api-modules` | Available API modules and actions |

## Conventions

- All wFirma API calls go through `WFirmaClient` — never call fetch directly.
- Tool handlers use `errorResult()` / `jsonResult()` helpers — never let exceptions propagate to MCP transport.
- API credentials come from environment variables, never hardcoded.
- Find conditions use typed `Condition` interface with `field`, `operator`, `value`.
