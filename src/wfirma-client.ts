const BASE_URL = "https://api2.wfirma.pl";

// --- Auth types ---

type AuthApiKey = {
  type: "api_key";
  accessKey: string;
  secretKey: string;
  appKey: string;
};

type AuthBasic = {
  type: "basic";
  login: string;
  password: string;
};

type Auth = AuthApiKey | AuthBasic;

interface WFirmaConfig {
  auth: Auth;
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

function resolveAuth(): Auth {
  const appKey = process.env.WFIRMA_APP_KEY;
  if (appKey) {
    const accessKey = process.env.WFIRMA_ACCESS_KEY;
    const secretKey = process.env.WFIRMA_SECRET_KEY;
    if (!accessKey || !secretKey) {
      throw new Error("WFIRMA_APP_KEY is set but WFIRMA_ACCESS_KEY or WFIRMA_SECRET_KEY is missing.");
    }
    return { type: "api_key", accessKey, secretKey, appKey };
  }

  const login = process.env.WFIRMA_LOGIN;
  const password = process.env.WFIRMA_PASSWORD;
  if (login && password) {
    return { type: "basic", login, password };
  }

  throw new Error(
    "Missing wFirma credentials. Set either WFIRMA_APP_KEY + WFIRMA_ACCESS_KEY + WFIRMA_SECRET_KEY, or WFIRMA_LOGIN + WFIRMA_PASSWORD."
  );
}

// --- Client ---

export class WFirmaClient {
  private config: WFirmaConfig;

  constructor(config?: WFirmaConfig) {
    this.config = config ?? {
      auth: resolveAuth(),
      companyId: process.env.WFIRMA_COMPANY_ID,
    };
  }

  get authMethod(): string {
    return this.config.auth.type === "api_key" ? "API Key" : "Basic Auth";
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const { auth } = this.config;
    if (auth.type === "api_key") {
      headers["accessKey"] = auth.accessKey;
      headers["secretKey"] = auth.secretKey;
      headers["appKey"] = auth.appKey;
    } else {
      headers["Authorization"] = "Basic " + btoa(`${auth.login}:${auth.password}`);
    }

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
    const path = id ? `/${module}/${action}/${id}` : `/${module}/${action}`;
    const url = `${BASE_URL}${path}?inputFormat=json&outputFormat=json`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`wFirma API error: ${response.status} ${response.statusText}`);
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
    if (params?.limit) {
      parameters.limit = params.limit;
    }
    if (params?.page) {
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
