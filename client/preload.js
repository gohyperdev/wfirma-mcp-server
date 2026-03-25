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
  // Company management
  getCompanies: () => ipcRenderer.invoke("get-companies"),
  getActiveCompany: () => ipcRenderer.invoke("get-active-company"),
  setActiveCompany: (id) => ipcRenderer.invoke("set-active-company", id),
  saveCompany: (company) => ipcRenderer.invoke("save-company", company),
  deleteCompany: (id) => ipcRenderer.invoke("delete-company", id),
  getCompanyForEdit: (id) => ipcRenderer.invoke("get-company-for-edit", id),
  fetchCompanyInfo: () => ipcRenderer.invoke("fetch-company-info"),
  onActiveCompanyChanged: (callback) => {
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("active-company-changed", listener);
    return () => ipcRenderer.removeListener("active-company-changed", listener);
  },
});
