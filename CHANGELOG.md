# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-25

### Added

- `company_info` tool to retrieve current company information (name, NIP, tax type, VAT status)
- MCP resources for expense field reference (`wfirma://reference/expense-fields`) and API module reference (`wfirma://reference/api-modules`)
- Electron testing client with multi-company management, tool browser, and response inspector
- `api_request` generic tool for raw API calls to any supported module/action
- Input validation for module and action names (path traversal prevention)
- Request timeout handling (30 second default)
- Write operation warnings in `api_request` responses

### Changed

- API request body format corrected to object format (`{ module: { parameters: {} } }`) instead of array
- Find conditions use numbered object keys (`"0"`, `"1"`, ...) matching wFirma API requirements

## [0.1.0] - 2026-03-24

### Added

- Initial MCP server with stdio transport
- `expenses_find`, `expenses_get`, `expenses_count` tools for expense management
- `contractors_find`, `contractors_get` tools for contractor lookup
- `invoices_find`, `invoices_get` tools for invoice access
- `payments_find` tool for payment search
- `vat_codes_find` tool for VAT rate lookup
- `WFirmaClient` HTTP client with API Key authentication
- Support for `WFIRMA_ACCESS_KEY`, `WFIRMA_SECRET_KEY`, `WFIRMA_APP_KEY` environment variables
- Optional `WFIRMA_COMPANY_ID` for multi-company accounts
- Typed conditions with operators: eq, ne, gt, lt, ge, le, like, not like, in, not in, is null, is not null
- Unit tests for `WFirmaClient`

[0.2.0]: https://github.com/gohyperdev/wfirma-mcp-server/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/gohyperdev/wfirma-mcp-server/releases/tag/v0.1.0
