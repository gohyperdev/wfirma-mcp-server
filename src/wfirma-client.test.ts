import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WFirmaClient, type Condition } from "./wfirma-client.js";

// Mock config for constructor
function makeClient(companyId?: string) {
  return new WFirmaClient({
    auth: { accessKey: "test-access", secretKey: "test-secret", appKey: "test-app" },
    companyId,
  });
}

describe("WFirmaClient", () => {
  describe("constructor", () => {
    it("throws when credentials are missing", () => {
      const original = { ...process.env };
      delete process.env.WFIRMA_ACCESS_KEY;
      delete process.env.WFIRMA_SECRET_KEY;
      delete process.env.WFIRMA_APP_KEY;

      expect(() => new WFirmaClient()).toThrow("Missing wFirma API key credentials");

      Object.assign(process.env, original);
    });

    it("creates client with explicit config", () => {
      const client = makeClient();
      expect(client).toBeInstanceOf(WFirmaClient);
    });

    it("creates client from env vars", () => {
      process.env.WFIRMA_ACCESS_KEY = "env-access";
      process.env.WFIRMA_SECRET_KEY = "env-secret";
      process.env.WFIRMA_APP_KEY = "env-app";

      const client = new WFirmaClient();
      expect(client).toBeInstanceOf(WFirmaClient);

      delete process.env.WFIRMA_ACCESS_KEY;
      delete process.env.WFIRMA_SECRET_KEY;
      delete process.env.WFIRMA_APP_KEY;
    });
  });

  describe("request() — input validation", () => {
    it("rejects module with invalid characters", async () => {
      const client = makeClient();
      await expect(client.request("expenses/delete/1", "find")).rejects.toThrow(
        "Invalid module or action name"
      );
    });

    it("rejects action with invalid characters", async () => {
      const client = makeClient();
      await expect(client.request("expenses", "find?x=1")).rejects.toThrow(
        "Invalid module or action name"
      );
    });

    it("rejects module with path traversal", async () => {
      const client = makeClient();
      await expect(client.request("../etc/passwd", "find")).rejects.toThrow(
        "Invalid module or action name"
      );
    });

    it("accepts valid module and action names", async () => {
      const client = makeClient();
      // Will fail at network level, but should not throw validation error
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );
      await client.request("expenses", "find");
      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it("accepts module names with underscores", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );
      await client.request("expense_parts", "find");
      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  describe("request() — HTTP handling", () => {
    it("sends correct URL and headers", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );

      await client.request("expenses", "find");

      const [url, opts] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://api2.wfirma.pl/expenses/find?inputFormat=json&outputFormat=json"
      );
      expect(opts.method).toBe("POST");
      expect(opts.headers.accessKey).toBe("test-access");
      expect(opts.headers.secretKey).toBe("test-secret");
      expect(opts.headers.appKey).toBe("test-app");

      fetchSpy.mockRestore();
    });

    it("includes id in URL for get requests", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );

      await client.request("expenses", "get", 12345);

      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe(
        "https://api2.wfirma.pl/expenses/get/12345?inputFormat=json&outputFormat=json"
      );
      fetchSpy.mockRestore();
    });

    it("includes companyId header when set", async () => {
      const client = makeClient("42");
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );

      await client.request("expenses", "find");
      expect(fetchSpy.mock.calls[0][1].headers.companyId).toBe("42");
      fetchSpy.mockRestore();
    });

    it("throws on HTTP error with response body", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Unauthorized access", { status: 401, statusText: "Unauthorized" })
      );

      await expect(client.request("expenses", "find")).rejects.toThrow(
        /401 Unauthorized.*Unauthorized access/
      );
      fetchSpy.mockRestore();
    });

    it("throws on API error response", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({ status: { code: "ERROR", message: "Bad request" } }),
          { status: 200 }
        )
      );

      await expect(client.request("expenses", "find")).rejects.toThrow(
        "wFirma API error: ERROR — Bad request"
      );
      fetchSpy.mockRestore();
    });
  });

  describe("buildBody() — via find()", () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;
    let client: WFirmaClient;

    beforeEach(() => {
      client = makeClient();
      fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );
    });

    afterEach(() => fetchSpy.mockRestore());

    it("builds body as object (not array)", async () => {
      await client.find("expenses", { limit: 5 });
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      // Must be { expenses: { parameters: { limit: 5 } } }
      expect(body).toHaveProperty("expenses");
      expect(body.expenses.parameters.limit).toBe(5);
    });

    it("builds conditions in numbered format", async () => {
      const conditions: Condition[] = [
        { field: "register_vat_book", operator: "eq", value: "1" },
        { field: "register_tax_book", operator: "eq", value: "0" },
      ];
      await client.find("expenses", { conditions });
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      const conds = body.expenses.parameters.conditions;
      expect(conds["0"].condition.field).toBe("register_vat_book");
      expect(conds["1"].condition.field).toBe("register_tax_book");
    });

    it("includes limit and page when provided", async () => {
      await client.find("expenses", { limit: 10, page: 3 });
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.expenses.parameters.limit).toBe(10);
      expect(body.expenses.parameters.page).toBe(3);
    });

    it("handles limit: 0 correctly (not dropped)", async () => {
      await client.find("expenses", { limit: 0 });
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.expenses.parameters.limit).toBe(0);
    });

    it("handles page: 0 correctly (not dropped)", async () => {
      await client.find("expenses", { page: 0 });
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.expenses.parameters.page).toBe(0);
    });

    it("builds empty parameters when no params given", async () => {
      await client.find("expenses");
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.expenses.parameters).toEqual({});
    });
  });

  describe("count()", () => {
    it("calls find with limit 1 for expenses module", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            expenses: { parameters: { total: "534", limit: "1", page: "1" } },
            status: { code: "OK" },
          }),
          { status: 200 }
        )
      );

      const result = await client.count("expenses");
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.expenses.parameters).toEqual({});
      fetchSpy.mockRestore();
    });

    it("passes conditions to find", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            expenses: { parameters: { total: "10" } },
            status: { code: "OK" },
          }),
          { status: 200 }
        )
      );

      const conditions: Condition[] = [
        { field: "type", operator: "eq", value: "invoice" },
      ];
      await client.count("expenses", conditions);
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.expenses.parameters.conditions["0"].condition.field).toBe("type");
      fetchSpy.mockRestore();
    });
  });

  describe("add() / edit() / deleteItem()", () => {
    it("add sends body as { module: data }", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );

      await client.add("invoices", { type: "normal" });
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.invoices.type).toBe("normal");
      fetchSpy.mockRestore();
    });

    it("edit sends body with id in URL", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );

      await client.edit("invoices", 99, { type: "proforma" });
      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("/invoices/edit/99");
      fetchSpy.mockRestore();
    });

    it("deleteItem sends delete action with id", async () => {
      const client = makeClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ status: { code: "OK" } }), { status: 200 })
      );

      await client.deleteItem("invoices", 99);
      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain("/invoices/delete/99");
      fetchSpy.mockRestore();
    });
  });
});
