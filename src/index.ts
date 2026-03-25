#!/usr/bin/env node

import "dotenv/config";
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { WFirmaClient } from "./wfirma-client.js";

// Read version from package.json at runtime to avoid mismatches
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const server = new McpServer({
  name: "wfirma",
  version: pkg.version,
});

let client: WFirmaClient;

function getClient(): WFirmaClient {
  if (!client) {
    client = new WFirmaClient();
  }
  return client;
}

function errorResult(e: unknown) {
  return {
    content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
    isError: true,
  };
}

function jsonResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// --- Shared schemas ---

const ConditionSchema = z.object({
  field: z.string().describe("Field name, e.g. 'accounting_effect', 'date', 'type'"),
  operator: z.enum(["eq", "ne", "gt", "lt", "ge", "le", "like", "not like", "in", "not in", "is null", "is not null"]),
  value: z.union([z.string(), z.number()]).optional().describe("Value to compare against"),
});

/** Inferred type from ConditionSchema — replaces manual Condition casts */
type ConditionInput = z.infer<typeof ConditionSchema>;

const PaginationSchema = {
  limit: z.number().max(200).optional().describe("Max results per page (default 20, max 200)"),
  page: z.number().min(1).optional().describe("Page number (starts at 1)"),
};

// --- Module allowlist for api_request ---

const KNOWN_MODULES = new Set([
  "expenses",
  "expense_parts",
  "invoices",
  "invoice_descriptions",
  "contractors",
  "payments",
  "goods",
  "series",
  "notes",
  "tags",
  "vat_codes",
  "companies",
  "user_companies",
  "company_accounts",
  "declaration_countries",
  "translation_languages",
  "invoice_deliveries",
]);

const READ_ONLY_ACTIONS = new Set(["find", "get", "count"]);

// ============================================================
// Resources — static reference data for the AI assistant
// ============================================================

server.resource(
  "expense-fields",
  "wfirma://reference/expense-fields",
  {
    description: "Reference: key expense fields and their possible values in wFirma",
    mimeType: "text/markdown",
  },
  async () => ({
    contents: [{
      uri: "wfirma://reference/expense-fields",
      mimeType: "text/markdown",
      text: `# wFirma Expense Fields Reference

## Register fields — controls where expense is booked
| Field | Values | Meaning |
|-------|--------|---------|
| \`register_tax_book\` | \`"1"\` / \`"0"\` | Whether booked in KPiR (tax ledger) |
| \`register_vat_book\` | \`"1"\` / \`"0"\` | Whether booked in VAT register (JPK) |

### Common combinations
| tax_book | vat_book | Meaning |
|----------|----------|---------|
| 1 | 1 | KPiR + VAT (standard) |
| 0 | 1 | **JPK-only** — in VAT register but NOT in KPiR |
| 1 | 0 | KPiR only — no VAT deduction |
| 0 | 0 | Not booked anywhere |

To find JPK-only expenses: \`register_vat_book eq "1"\` AND \`register_tax_book eq "0"\`

## type — document type
| Value | Meaning |
|-------|---------|
| \`invoice\` | VAT invoice (Faktura VAT) |
| \`bill\` | Invoice without VAT (Rachunek) |
| \`vat_exempt\` | VAT-exempt document |

## schema (in expense_parts) — expense category
| Value | Meaning |
|-------|---------|
| \`invoice_cost\` | General business costs (KPiR column 13) |
| \`purchase_trade_goods\` | Trade goods and materials (KPiR column 10) |
| \`vehicle_fuel\` | Vehicle fuel (KPiR column 13) |
| \`vehicle_expense\` | Other vehicle costs (KPiR column 13) |

## payment_method
\`cash\`, \`transfer\`, \`compensation\`, \`cod\`, \`payment_card\`

## Other fields
- \`date\` — issue date (YYYY-MM-DD)
- \`reception_date\` — reception date
- \`taxregister_date\` — KPiR booking date (YYYY-MM-DD)
- \`vatregister_date\` — VAT register date (YYYY-MM-DD)
- \`payment_date\` — payment deadline (YYYY-MM-DD)
- \`paymentstate\` — \`paid\`, \`unpaid\`, \`partial\`
- \`payment_method\` — see above
- \`currency\` — e.g. PLN
- \`netto\` / \`brutto\` — amounts
- \`split_payment\` — 0 or 1
- \`draft\` — 0 or 1
- \`description\` — expense description
- \`fullnumber\` — document number
`,
    }],
  })
);

server.resource(
  "api-modules",
  "wfirma://reference/api-modules",
  {
    description: "Reference: available wFirma API modules and their supported actions",
    mimeType: "text/markdown",
  },
  async () => ({
    contents: [{
      uri: "wfirma://reference/api-modules",
      mimeType: "text/markdown",
      text: `# wFirma API Modules

## Read-only modules
| Module | Actions |
|--------|---------|
| \`expenses\` | find, get, count |
| \`expense_parts\` | find, get |
| \`invoice_descriptions\` | find, get, count |
| \`declaration_countries\` | find, get, count |
| \`translation_languages\` | find, get, count |
| \`vat_codes\` | find, get |
| \`company_accounts\` | find, get, count |

## Read-write modules
| Module | Actions |
|--------|---------|
| \`invoices\` | find, get, count, add, edit, delete, download, send |
| \`contractors\` | find, get, count, add, edit, delete |
| \`payments\` | find, get, add, edit, delete |
| \`goods\` | find, get, add, edit, delete |
| \`series\` | find, get, count, add, edit, delete |
| \`notes\` | find, get, count, add, edit, delete |
| \`tags\` | find, get, add, edit, delete |
| \`invoice_deliveries\` | find, get, count, add, delete |

## API pattern
\`POST https://api2.wfirma.pl/{module}/{action}[/{id}]?inputFormat=json&outputFormat=json\`

## Find operators
\`eq\`, \`ne\`, \`gt\`, \`lt\`, \`ge\`, \`le\`, \`like\`, \`not like\`, \`in\`, \`not in\`, \`is null\`, \`is not null\`
`,
    }],
  })
);

// ============================================================
// Tools — Expenses
// ============================================================

server.tool(
  "expenses_find",
  "Search expenses (wydatki) in wFirma with filters. Use conditions to filter by accounting_effect, date, type, etc.",
  {
    conditions: z.array(ConditionSchema).optional().describe(
      "Filter conditions. Example: [{field: 'accounting_effect', operator: 'eq', value: 'vat'}] to find JPK-only expenses"
    ),
    ...PaginationSchema,
  },
  async ({ conditions, limit, page }) => {
    try {
      const result = await getClient().find("expenses", {
        conditions,
        limit: limit ?? 20,
        page,
      });
      return jsonResult(result);
    } catch (e) {
      console.error("expenses_find error:", e);
      return errorResult(e);
    }
  }
);

server.tool(
  "expenses_get",
  "Get a single expense document by ID, including all details (expense_parts, contractor, payments).",
  {
    id: z.number().describe("Expense document ID"),
  },
  async ({ id }) => {
    try {
      const result = await getClient().get("expenses", id);
      return jsonResult(result);
    } catch (e) {
      console.error("expenses_get error:", e);
      return errorResult(e);
    }
  }
);

server.tool(
  "expenses_count",
  "Count expenses matching conditions. Useful to check how many JPK-only expenses exist.",
  {
    conditions: z.array(ConditionSchema).optional().describe("Filter conditions"),
  },
  async ({ conditions }) => {
    try {
      const result = await getClient().count("expenses", conditions);
      return jsonResult(result);
    } catch (e) {
      console.error("expenses_count error:", e);
      return errorResult(e);
    }
  }
);

// Note: expenses/add does not exist in wFirma API (module is read-only)

// ============================================================
// Tools — Contractors
// ============================================================

server.tool(
  "contractors_find",
  "Search contractors (kontrahenci) in wFirma. Filter by name, NIP, etc.",
  {
    conditions: z.array(ConditionSchema).optional().describe(
      "Filter conditions. Example: [{field: 'name', operator: 'like', value: '%Firma%'}]"
    ),
    ...PaginationSchema,
  },
  async ({ conditions, limit, page }) => {
    try {
      const result = await getClient().find("contractors", {
        conditions,
        limit: limit ?? 20,
        page,
      });
      return jsonResult(result);
    } catch (e) {
      console.error("contractors_find error:", e);
      return errorResult(e);
    }
  }
);

server.tool(
  "contractors_get",
  "Get a single contractor by ID with full details.",
  {
    id: z.number().describe("Contractor ID"),
  },
  async ({ id }) => {
    try {
      const result = await getClient().get("contractors", id);
      return jsonResult(result);
    } catch (e) {
      console.error("contractors_get error:", e);
      return errorResult(e);
    }
  }
);

// ============================================================
// Tools — Invoices
// ============================================================

server.tool(
  "invoices_find",
  "Search invoices (faktury) in wFirma. Filter by date, type, contractor, etc.",
  {
    conditions: z.array(ConditionSchema).optional().describe("Filter conditions"),
    ...PaginationSchema,
  },
  async ({ conditions, limit, page }) => {
    try {
      const result = await getClient().find("invoices", {
        conditions,
        limit: limit ?? 20,
        page,
      });
      return jsonResult(result);
    } catch (e) {
      console.error("invoices_find error:", e);
      return errorResult(e);
    }
  }
);

server.tool(
  "invoices_get",
  "Get a single invoice by ID.",
  {
    id: z.number().describe("Invoice ID"),
  },
  async ({ id }) => {
    try {
      const result = await getClient().get("invoices", id);
      return jsonResult(result);
    } catch (e) {
      console.error("invoices_get error:", e);
      return errorResult(e);
    }
  }
);

// ============================================================
// Tools — Payments
// ============================================================

server.tool(
  "payments_find",
  "Search payments (platnosci) in wFirma.",
  {
    conditions: z.array(ConditionSchema).optional().describe("Filter conditions"),
    ...PaginationSchema,
  },
  async ({ conditions, limit, page }) => {
    try {
      const result = await getClient().find("payments", {
        conditions,
        limit: limit ?? 20,
        page,
      });
      return jsonResult(result);
    } catch (e) {
      console.error("payments_find error:", e);
      return errorResult(e);
    }
  }
);

// ============================================================
// Tools — VAT Codes
// ============================================================

server.tool(
  "vat_codes_find",
  "List available VAT codes/rates in wFirma. Useful when creating documents.",
  {
    ...PaginationSchema,
  },
  async ({ limit, page }) => {
    try {
      const result = await getClient().find("vat_codes", { limit: limit ?? 50, page });
      return jsonResult(result);
    } catch (e) {
      console.error("vat_codes_find error:", e);
      return errorResult(e);
    }
  }
);

// ============================================================
// Tools — Company
// ============================================================

server.tool(
  "company_info",
  "Get current company information (name, NIP, tax type, VAT status). Uses companies/find endpoint.",
  {},
  async () => {
    try {
      const result = await getClient().request("companies", "find", undefined, {
        companies: { parameters: { limit: 1 } },
      });
      return jsonResult(result);
    } catch (e) {
      console.error("company_info error:", e);
      return errorResult(e);
    }
  }
);

// ============================================================
// Tools — Generic API access
// ============================================================

server.tool(
  "api_request",
  "Make a raw wFirma API request. Use for modules/actions not covered by other tools. By default restricted to read-only actions (find/get/count).",
  {
    module: z.string().describe("API module name, e.g. 'goods', 'series', 'tags'"),
    action: z.enum(["find", "get", "count", "add", "edit", "delete"]).describe("API action"),
    id: z.number().optional().describe("Resource ID (required for get/edit/delete)"),
    body: z.unknown().optional().describe("Request body (JSON)"),
  },
  async ({ module, action, id, body }) => {
    try {
      if (!KNOWN_MODULES.has(module)) {
        return errorResult(new Error(
          `Unknown module "${module}". Known modules: ${[...KNOWN_MODULES].join(", ")}`
        ));
      }

      if (!READ_ONLY_ACTIONS.has(action)) {
        console.error(`api_request: write operation ${module}/${action} requested`);
      }

      const result = await getClient().request(module, action, id, body);

      if (!READ_ONLY_ACTIONS.has(action)) {
        return {
          content: [
            { type: "text" as const, text: `WARNING: Write operation (${action}) executed on module "${module}".` },
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      }

      return jsonResult(result);
    } catch (e) {
      console.error("api_request error:", e);
      return errorResult(e);
    }
  }
);

// ============================================================
// Start server
// ============================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
