import { describe, it, expect, vi, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { createMcpServer } from "./index.js";
import { WFirmaClient } from "./wfirma-client.js";
import { FINANCE_EXPLORER_URI, getFinanceExplorerHtml } from "./ui/finance-explorer.js";

function createMockWFirmaClient() {
  const client = new WFirmaClient({
    auth: {
      accessKey: "mock-access",
      secretKey: "mock-secret",
      appKey: "mock-app",
    },
  });

  vi.spyOn(client, "find").mockImplementation(async (module) => {
    if (module === "expenses") {
      return {
        expenses: {
          "0": {
            expense: {
              id: "101",
              fullnumber: "FV/KOSZT/01/2026",
              date: "2026-10-15",
              taxregister_date: "2026-10-15",
              netto: "1000.00",
              brutto: "1230.00",
              currency: "PLN",
              paymentstate: "unpaid",
              register_vat_book: "1",
              register_tax_book: "0",
              contractor_detail: { name: "Dostawca Chmury Sp. z o.o.", nip: "5250001122" },
            },
          },
          parameters: { page: "1", limit: "20", total: "1" },
        },
        status: { code: "OK" },
      };
    }
    if (module === "invoices") {
      return {
        invoices: {
          "0": {
            invoice: {
              id: "202",
              fullnumber: "FV 12/10/2026",
              date: "2026-10-20",
              paymentdate: "2026-11-03",
              type: "normal",
              netto: "5000.00",
              brutto: "6150.00",
              total: "6150.00",
              alreadypaid: "0.00",
              remaining: "6150.00",
              currency: "PLN",
              paymentstate: "unpaid",
              contractor_detail: { name: "Klient Enterprise S.A.", nip: "1132233445" },
            },
          },
          parameters: { page: "1", limit: "20", total: "1" },
        },
        status: { code: "OK" },
      };
    }
    return { status: { code: "OK" } };
  });

  vi.spyOn(client, "get").mockImplementation(async (module, id) => {
    return {
      [module]: {
        "0": {
          [module === "expenses" ? "expense" : "invoice"]: {
            id: String(id),
            fullnumber: `DOC/${id}`,
          },
        },
      },
      status: { code: "OK" },
    };
  });

  vi.spyOn(client, "request").mockImplementation(async (module) => {
    if (module === "companies") {
      return {
        companies: {
          "0": {
            company: {
              id: "1",
              name: "HyperDev Sp. z o.o.",
              nip: "5213999888",
            },
          },
        },
        status: { code: "OK" },
      };
    }
    return { status: { code: "OK" } };
  });

  return client;
}

describe("wFirma Finance Explorer MCP App", () => {
  let mcpClient: Client;
  let mockWFirma: WFirmaClient;

  beforeEach(async () => {
    mockWFirma = createMockWFirmaClient();
    const server = createMcpServer(mockWFirma);
    mcpClient = new Client({ name: "test-host", version: "1.0.0" });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      mcpClient.connect(clientTransport),
    ]);
  });

  it("registers the ui://wfirma/finance-explorer resource with MCP App MIME type", async () => {
    const { resources } = await mcpClient.listResources();
    const appResource = resources.find((r) => r.uri === FINANCE_EXPLORER_URI);

    expect(appResource).toBeDefined();
    expect(appResource?.name).toBe("finance-explorer");
    expect(appResource?.mimeType).toBe(RESOURCE_MIME_TYPE);
    expect(appResource?.mimeType).toBe("text/html;profile=mcp-app");
  });

  it("serves self-contained HTML for ui://wfirma/finance-explorer with JPK/KPiR presets and JSON-RPC bridge", async () => {
    const res = await mcpClient.readResource({ uri: FINANCE_EXPLORER_URI });
    expect(res.contents).toHaveLength(1);

    const content = res.contents[0];
    expect(content.uri).toBe(FINANCE_EXPLORER_URI);
    expect(content.mimeType).toBe("text/html;profile=mcp-app");
    expect("text" in content && typeof content.text === "string").toBe(true);

    const html = (content as { text: string }).text;
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("wFirma Finanse Explorer");
    expect(html).toContain("ui/initialize");
    expect(html).toContain("ui/notifications/tool-result");
    expect(html).toContain("register_vat_book");
    expect(html).toContain("register_tax_book");
    expect(html).toBe(getFinanceExplorerHtml());
  });

  it("attaches _meta.ui.resourceUri to invoice, expense, and finance_dashboard tools", async () => {
    const { tools } = await mcpClient.listTools();
    const uiLinkedTools = [
      "expenses_find",
      "expenses_get",
      "invoices_find",
      "invoices_get",
      "finance_dashboard",
    ];

    for (const toolName of uiLinkedTools) {
      const tool = tools.find((t) => t.name === toolName);
      expect(tool, `Expected tool ${toolName} to be registered`).toBeDefined();
      const meta = tool?._meta as Record<string, unknown> | undefined;
      expect(meta).toBeDefined();
      expect((meta?.ui as { resourceUri?: string })?.resourceUri).toBe(FINANCE_EXPLORER_URI);
      expect(meta?.["ui/resourceUri"]).toBe(FINANCE_EXPLORER_URI);
    }
  });

  it("executes finance_dashboard and returns combined company, expenses, and invoices data", async () => {
    const result = await mcpClient.callTool({
      name: "finance_dashboard",
      arguments: { tab: "expenses", limit: 10 },
    });

    expect(result.isError).toBeFalsy();
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content).toHaveLength(1);

    const parsed = JSON.parse(content[0].text);
    expect(parsed).toHaveProperty("dashboard");
    expect(parsed.dashboard.tab).toBe("expenses");
    expect(parsed.dashboard.company.companies["0"].company.name).toBe("HyperDev Sp. z o.o.");
    expect(parsed.dashboard.expenses.expenses["0"].expense.fullnumber).toBe("FV/KOSZT/01/2026");
    expect(parsed.dashboard.invoices.invoices["0"].invoice.fullnumber).toBe("FV 12/10/2026");
  });
});
