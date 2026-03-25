const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mcp", {
  getConnectionStatus: () => ipcRenderer.invoke("get-connection-status"),
  connect: () => ipcRenderer.invoke("connect"),
  disconnect: () => ipcRenderer.invoke("disconnect"),
  listTools: () => ipcRenderer.invoke("list-tools"),
  listResources: () => ipcRenderer.invoke("list-resources"),
  callTool: (name, args) => ipcRenderer.invoke("call-tool", { name, args }),
  readResource: (uri) => ipcRenderer.invoke("read-resource", { uri }),
  onConnectionStatus: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("connection-status", listener);
    return () => ipcRenderer.removeListener("connection-status", listener);
  },
});
