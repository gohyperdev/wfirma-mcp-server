#!/usr/bin/env node

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { WFirmaClient } from "./wfirma-client.js";

const server = new McpServer({
  name: "wfirma",
  version: "0.1.0",
});

let client: WFirmaClient;

function getClient(): WFirmaClient {
  if (!client) {
    client = new WFirmaClient();
  }
  return client;
}

// --- Expenses ---

server.tool(
  "expenses_find",
  "Find expenses (wydatki) in wFirma. Use to search for existing expense documents.",
  {
    limit: z.number().optional().describe("Max results to return (default 20)"),
    page: z.number().optional().describe("Page number for pagination"),
  },
  async ({ limit, page }) => {
    try {
      const result = await getClient().find("expenses", undefined, undefined, undefined, limit ?? 20, page);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
    }
  }
);

server.tool(
  "expenses_get",
  "Get a single expense by ID.",
  {
    id: z.number().describe("Expense document ID"),
  },
  async ({ id }) => {
    try {
      const result = await getClient().get("expenses", id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
    }
  }
);

// Note: expenses/add does not exist in wFirma API (module is read-only)

// --- Contractors ---

server.tool(
  "contractors_find",
  "Find contractors (kontrahenci) in wFirma.",
  {
    limit: z.number().optional().describe("Max results to return (default 20)"),
    page: z.number().optional().describe("Page number for pagination"),
  },
  async ({ limit, page }) => {
    try {
      const result = await getClient().find("contractors", undefined, undefined, undefined, limit ?? 20, page);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
    }
  }
);

server.tool(
  "contractors_get",
  "Get a single contractor by ID.",
  {
    id: z.number().describe("Contractor ID"),
  },
  async ({ id }) => {
    try {
      const result = await getClient().get("contractors", id);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
    }
  }
);

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
