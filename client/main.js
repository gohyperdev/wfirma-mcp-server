const { app, BrowserWindow, ipcMain, Menu, shell } = require("electron");
const path = require("path");
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

async function connectMcp() {
  const serverCommand =
    process.env.MCP_SERVER_COMMAND || "node";
  const serverArgs =
    process.env.MCP_SERVER_ARGS
      ? process.env.MCP_SERVER_ARGS.split(" ")
      : [path.join(SERVER_CWD, "dist", "index.js")];

  sendStatus("connecting", `${serverCommand} ${serverArgs.join(" ")}`);

  try {
    mcpTransport = new StdioClientTransport({
      command: serverCommand,
      args: serverArgs,
      cwd: SERVER_CWD,
      env: { ...process.env },
    });

    mcpClient = new Client({
      name: "wfirma-mcp-electron-client",
      version: "1.0.0",
    });

    await mcpClient.connect(mcpTransport);
    sendStatus("connected", `${serverCommand} ${serverArgs.join(" ")}`);
    console.log("[main] MCP client connected");
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
  await connectMcp();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", async () => {
  await disconnectMcp();
  app.quit();
});
