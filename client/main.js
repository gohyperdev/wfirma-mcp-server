const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const {
  StdioClientTransport,
} = require("@modelcontextprotocol/sdk/client/stdio.js");

// ---------------------------------------------------------------------------
// Env loading — read ../.env relative to the MCP server working directory
// ---------------------------------------------------------------------------

const SERVER_CWD = path.resolve(__dirname, "..");

require("dotenv").config({ path: path.join(SERVER_CWD, ".env") });

// ---------------------------------------------------------------------------
// Config file management
// ---------------------------------------------------------------------------

const CONFIG_DIR = path.join(os.homedir(), ".wfirma-mcp");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const config = JSON.parse(raw);
      if (!config.companies) config.companies = [];
      if (!config.activeCompany) config.activeCompany = null;
      return config;
    }
  } catch (err) {
    console.error("[main] Failed to load config:", err.message);
  }
  return { activeCompany: null, companies: [] };
}

function saveConfig(config) {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("[main] Failed to save config:", err.message);
  }
}

function migrateFromEnv() {
  const accessKey = process.env.WFIRMA_ACCESS_KEY;
  const secretKey = process.env.WFIRMA_SECRET_KEY;
  const appKey = process.env.WFIRMA_APP_KEY;
  if (!accessKey || !secretKey || !appKey) return null;

  const config = loadConfig();
  if (config.companies.length > 0) return config;

  const id = crypto.randomUUID();
  const company = {
    id,
    label: "Default (from .env)",
    accessKey,
    secretKey,
    appKey,
    companyId: process.env.WFIRMA_COMPANY_ID || "",
    name: "",
    nip: "",
  };
  config.companies.push(company);
  config.activeCompany = id;
  saveConfig(config);
  console.log("[main] Migrated credentials from .env to config");
  return config;
}

let appConfig = loadConfig();
if (appConfig.companies.length === 0) {
  const migrated = migrateFromEnv();
  if (migrated) appConfig = migrated;
}

function getActiveCompany() {
  if (!appConfig.activeCompany && appConfig.companies.length > 0) {
    appConfig.activeCompany = appConfig.companies[0].id;
    saveConfig(appConfig);
  }
  return appConfig.companies.find((c) => c.id === appConfig.activeCompany) || null;
}

// ---------------------------------------------------------------------------
// MCP Client
// ---------------------------------------------------------------------------

let mcpClient = null;
let mcpTransport = null;
let connectionStatus = "disconnected";
let mainWindow = null;

function sendStatus(status, detail) {
  connectionStatus = status;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("connection-status", { status, detail });
  }
}

function sendActiveCompanyUpdate() {
  const company = getActiveCompany();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("active-company-changed", company);
  }
}

function buildServerEnv(company) {
  const env = { ...process.env };
  if (company) {
    env.WFIRMA_ACCESS_KEY = company.accessKey;
    env.WFIRMA_SECRET_KEY = company.secretKey;
    env.WFIRMA_APP_KEY = company.appKey;
    if (company.companyId) {
      env.WFIRMA_COMPANY_ID = company.companyId;
    } else {
      delete env.WFIRMA_COMPANY_ID;
    }
  }
  return env;
}

async function connectMcp() {
  const serverCommand =
    process.env.MCP_SERVER_COMMAND || "node";
  const serverArgs =
    process.env.MCP_SERVER_ARGS
      ? process.env.MCP_SERVER_ARGS.split(" ")
      : [path.join(SERVER_CWD, "dist", "index.js")];

  sendStatus("connecting", `${serverCommand} ${serverArgs.join(" ")}`);

  const activeCompany = getActiveCompany();

  try {
    mcpTransport = new StdioClientTransport({
      command: serverCommand,
      args: serverArgs,
      cwd: SERVER_CWD,
      env: buildServerEnv(activeCompany),
    });

    mcpClient = new Client({
      name: "wfirma-mcp-electron-client",
      version: "1.0.0",
    });

    await mcpClient.connect(mcpTransport);
    sendStatus("connected", `${serverCommand} ${serverArgs.join(" ")}`);
    console.log("[main] MCP client connected");

    // Fetch company info after successful connection
    if (activeCompany) {
      fetchCompanyInfo(activeCompany.id).catch((err) =>
        console.error("[main] Failed to fetch company info:", err.message)
      );
    }
  } catch (err) {
    sendStatus("error", err.message);
    console.error("[main] MCP connection failed:", err);
  }
}

async function disconnectMcp() {
  try {
    if (mcpClient) {
      await mcpClient.close();
    }
  } catch {
    // ignore
  }
  mcpClient = null;
  mcpTransport = null;
  sendStatus("disconnected");
}

async function fetchCompanyInfo(companyId) {
  if (!mcpClient) return null;
  try {
    const result = await mcpClient.callTool({
      name: "api_request",
      arguments: { module: "companies", action: "get" },
    });
    if (result?.content) {
      const text = result.content.map((c) => c.text || "").join("\n");
      try {
        const data = JSON.parse(text);
        const companies = data.companies;
        if (companies) {
          for (const key of Object.keys(companies)) {
            if (key === "parameters") continue;
            const entry = companies[key];
            const companyData = entry?.company;
            if (companyData) {
              const idx = appConfig.companies.findIndex((c) => c.id === companyId);
              if (idx !== -1) {
                if (companyData.name) appConfig.companies[idx].name = companyData.name;
                if (companyData.nip) appConfig.companies[idx].nip = companyData.nip;
                saveConfig(appConfig);
                sendActiveCompanyUpdate();
                return { name: companyData.name, nip: companyData.nip };
              }
            }
          }
        }
      } catch {
        // ignore parse errors
      }
    }
  } catch (err) {
    console.error("[main] fetchCompanyInfo error:", err.message);
  }
  return null;
}

// ---------------------------------------------------------------------------
// IPC handlers
// ---------------------------------------------------------------------------

ipcMain.handle("get-connection-status", () => connectionStatus);

ipcMain.handle("connect", async () => {
  await disconnectMcp();
  await connectMcp();
  return connectionStatus;
});

ipcMain.handle("disconnect", async () => {
  await disconnectMcp();
  return connectionStatus;
});

ipcMain.handle("list-tools", async () => {
  if (!mcpClient) throw new Error("Not connected");
  const result = await mcpClient.listTools();
  return result.tools;
});

ipcMain.handle("list-resources", async () => {
  if (!mcpClient) throw new Error("Not connected");
  const result = await mcpClient.listResources();
  return result.resources;
});

ipcMain.handle("call-tool", async (_event, { name, args }) => {
  if (!mcpClient) throw new Error("Not connected");
  if (typeof name !== "string") throw new Error("Invalid tool name");
  if (args !== undefined && (typeof args !== "object" || args === null || Array.isArray(args))) {
    throw new Error("Invalid tool args");
  }
  const result = await mcpClient.callTool({ name, arguments: args });
  return result;
});

ipcMain.handle("read-resource", async (_event, { uri }) => {
  if (!mcpClient) throw new Error("Not connected");
  if (typeof uri !== "string") throw new Error("Invalid resource URI");
  const result = await mcpClient.readResource({ uri });
  return result;
});

// ---------------------------------------------------------------------------
// Company management IPC handlers
// ---------------------------------------------------------------------------

ipcMain.handle("get-companies", () => {
  return appConfig.companies.map((c) => ({
    id: c.id,
    label: c.label,
    companyId: c.companyId,
    name: c.name,
    nip: c.nip,
    hasCredentials: !!(c.accessKey && c.secretKey && c.appKey),
  }));
});

ipcMain.handle("get-active-company", () => {
  const company = getActiveCompany();
  if (!company) return null;
  return {
    id: company.id,
    label: company.label,
    companyId: company.companyId,
    name: company.name,
    nip: company.nip,
    hasCredentials: !!(company.accessKey && company.secretKey && company.appKey),
  };
});

ipcMain.handle("set-active-company", async (_event, id) => {
  if (typeof id !== "string") throw new Error("Invalid company id");
  const company = appConfig.companies.find((c) => c.id === id);
  if (!company) throw new Error("Company not found");
  appConfig.activeCompany = id;
  saveConfig(appConfig);
  sendActiveCompanyUpdate();
  // Reconnect MCP with new credentials
  await disconnectMcp();
  await connectMcp();
  return connectionStatus;
});

ipcMain.handle("save-company", async (_event, companyData) => {
  if (!companyData || typeof companyData !== "object") throw new Error("Invalid company data");
  if (!companyData.label) throw new Error("Label is required");
  if (!companyData.accessKey || !companyData.secretKey || !companyData.appKey) {
    throw new Error("API credentials are required");
  }

  const idx = companyData.id
    ? appConfig.companies.findIndex((c) => c.id === companyData.id)
    : -1;

  if (idx !== -1) {
    // Update existing
    appConfig.companies[idx] = {
      ...appConfig.companies[idx],
      label: companyData.label,
      accessKey: companyData.accessKey,
      secretKey: companyData.secretKey,
      appKey: companyData.appKey,
      companyId: companyData.companyId || "",
    };
  } else {
    // Add new
    const id = crypto.randomUUID();
    appConfig.companies.push({
      id,
      label: companyData.label,
      accessKey: companyData.accessKey,
      secretKey: companyData.secretKey,
      appKey: companyData.appKey,
      companyId: companyData.companyId || "",
      name: "",
      nip: "",
    });
    if (!appConfig.activeCompany) {
      appConfig.activeCompany = id;
    }
  }
  saveConfig(appConfig);
  sendActiveCompanyUpdate();
  return appConfig.companies.map((c) => ({
    id: c.id,
    label: c.label,
    companyId: c.companyId,
    name: c.name,
    nip: c.nip,
    hasCredentials: !!(c.accessKey && c.secretKey && c.appKey),
  }));
});

ipcMain.handle("delete-company", async (_event, id) => {
  if (typeof id !== "string") throw new Error("Invalid company id");
  const idx = appConfig.companies.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Company not found");
  appConfig.companies.splice(idx, 1);
  if (appConfig.activeCompany === id) {
    appConfig.activeCompany = appConfig.companies.length > 0
      ? appConfig.companies[0].id
      : null;
    // Reconnect if active company was deleted
    await disconnectMcp();
    if (appConfig.activeCompany) {
      await connectMcp();
    }
  }
  saveConfig(appConfig);
  sendActiveCompanyUpdate();
  return appConfig.companies.map((c) => ({
    id: c.id,
    label: c.label,
    companyId: c.companyId,
    name: c.name,
    nip: c.nip,
    hasCredentials: !!(c.accessKey && c.secretKey && c.appKey),
  }));
});

ipcMain.handle("get-company-for-edit", (_event, id) => {
  if (typeof id !== "string") throw new Error("Invalid company id");
  const company = appConfig.companies.find((c) => c.id === id);
  if (!company) throw new Error("Company not found");
  return {
    id: company.id,
    label: company.label,
    accessKey: company.accessKey,
    secretKey: company.secretKey,
    appKey: company.appKey,
    companyId: company.companyId,
    name: company.name,
    nip: company.nip,
  };
});

ipcMain.handle("fetch-company-info", async () => {
  const company = getActiveCompany();
  if (!company) throw new Error("No active company");
  return fetchCompanyInfo(company.id);
});

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#1a1a2e",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.setName("wFirma MCP");

app.whenReady().then(async () => {
  const template = [
    {
      label: "wFirma MCP",
      submenu: [
        { role: "about", label: "About wFirma MCP" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide", label: "Hide wFirma MCP" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit", label: "Quit wFirma MCP" },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    {
      label: "Help",
      submenu: [
        {
          label: "wFirma API documentation",
          click: () => shell.openExternal("https://doc.wfirma.pl/"),
        },
        {
          label: "wFirma help center",
          click: () => shell.openExternal("https://pomoc.wfirma.pl/"),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  createWindow();
  if (getActiveCompany()) {
    await connectMcp();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", async () => {
  await disconnectMcp();
  app.quit();
});
