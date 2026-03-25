const BASE_URL = "https://api2.wfirma.pl";

const REQUEST_TIMEOUT_MS = 30_000;

// --- Auth types ---

interface ApiKeyAuth {
  accessKey: string;
  secretKey: string;
  appKey: string;
}

interface WFirmaConfig {
  auth: ApiKeyAuth;
  companyId?: string;
}

// --- API types ---

export interface WFirmaStatus {
  code: string;
  message?: string;
}

export interface WFirmaResponse {
  status: WFirmaStatus;
  parameters?: {
    total?: number;
    count?: number;
    page?: number;
    limit?: number;
  };
  [key: string]: unknown;
}

export type Operator = "eq" | "ne" | "gt" | "lt" | "ge" | "le" | "like" | "not like" | "in" | "not in" | "is null" | "is not null";

export interface Condition {
  field: string;
  operator: Operator;
  value?: string | number;
}

export interface FindParams {
  conditions?: Condition[];
  fields?: string[];
  order?: Record<string, string>;
  limit?: number;
  page?: number;
}

// --- Auth resolution ---

function resolveAuth(): ApiKeyAuth {
  const accessKey = process.env.WFIRMA_ACCESS_KEY;
  const secretKey = process.env.WFIRMA_SECRET_KEY;
  const appKey = process.env.WFIRMA_APP_KEY;

  if (!accessKey || !secretKey || !appKey) {
    throw new Error(
      "Missing wFirma API key credentials. Set WFIRMA_ACCESS_KEY, WFIRMA_SECRET_KEY, and WFIRMA_APP_KEY environment variables."
    );
  }

  return { accessKey, secretKey, appKey };
}

// --- Module/action name validation ---

const SAFE_NAME_RE = /^[a-z_]+$/;

// --- Client ---

export class WFirmaClient {
  private config: WFirmaConfig;

  constructor(config?: WFirmaConfig) {
    this.config = config ?? {
      auth: resolveAuth(),
      companyId: process.env.WFIRMA_COMPANY_ID,
    };
  }

  private buildHeaders(): Record<string, string> {
    const { auth } = this.config;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      accessKey: auth.accessKey,
      secretKey: auth.secretKey,
      appKey: auth.appKey,
    };

    if (this.config.companyId) {
      headers["companyId"] = this.config.companyId;
    }

    return headers;
  }

  async request(
    module: string,
    action: string,
    id?: number,
    body?: unknown
  ): Promise<WFirmaResponse> {
    if (!SAFE_NAME_RE.test(module) || !SAFE_NAME_RE.test(action)) {
      throw new Error("Invalid module or action name");
    }

    const path = id ? `/${module}/${action}/${id}` : `/${module}/${action}`;
    const url = `${BASE_URL}${path}?inputFormat=json&outputFormat=json`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        // ignore read errors
      }
      throw new Error(
        `wFirma API error: ${response.status} ${response.statusText}${errorBody ? ` — ${errorBody}` : ""}`
      );
    }

    const data = (await response.json()) as WFirmaResponse;

    if (data.status?.code !== "OK") {
      throw new Error(
        `wFirma API error: ${data.status?.code} — ${data.status?.message ?? "Unknown error"}`
      );
    }

    return data;
  }

  private buildBody(module: string, params?: FindParams): Record<string, unknown> {
    const parameters: Record<string, unknown> = {};

    if (params?.conditions?.length) {
      const conditionsObj: Record<string, { condition: Condition }> = {};
      params.conditions.forEach((cond, i) => {
        conditionsObj[String(i)] = { condition: cond };
      });
      parameters.conditions = conditionsObj;
    }

    if (params?.fields?.length) {
      parameters.fields = params.fields;
    }
    if (params?.order) {
      parameters.order = params.order;
    }
    if (params?.limit != null) {
      parameters.limit = params.limit;
    }
    if (params?.page != null) {
      parameters.page = params.page;
    }

    return { [module]: { parameters } };
  }

  async find(module: string, params: FindParams = {}): Promise<WFirmaResponse> {
    return this.request(module, "find", undefined, this.buildBody(module, params));
  }

  async count(module: string, conditions?: Condition[]): Promise<WFirmaResponse> {
    return this.request(module, "count", undefined, this.buildBody(module, conditions ? { conditions } : undefined));
  }

  async get(module: string, id: number): Promise<WFirmaResponse> {
    return this.request(module, "get", id);
  }

  async add(module: string, data: unknown): Promise<WFirmaResponse> {
    return this.request(module, "add", undefined, { [module]: data });
  }

  async edit(module: string, id: number, data: unknown): Promise<WFirmaResponse> {
    return this.request(module, "edit", id, { [module]: data });
  }

  async deleteItem(module: string, id: number): Promise<WFirmaResponse> {
    return this.request(module, "delete", id);
  }
}
