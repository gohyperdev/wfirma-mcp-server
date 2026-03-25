// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

const I18N = {
  pl: {
    tools: "Narzędzia", resources: "Zasoby", history: "Historia",
    welcome: "Witaj", welcomeText: "Wybierz narzędzie lub zasób z panelu bocznego.",
    connectedMsg: "Połączono z serwerem MCP", connectingMsg: "Łączenie z serwerem MCP...",
    disconnectedMsg: "Rozłączono", errorMsg: "Błąd połączenia",
    connected: "Połączono", connecting: "Łączenie...", disconnected: "Rozłączono", error: "Błąd",
    execute: "Wykonaj", result: "Wynik", content: "Treść",
    copy: "Kopiuj", copied: "Skopiowano!",
    executing: "Wykonywanie...", loadingResource: "Ładowanie zasobu...",
    quickFilters: "Szybkie filtry:", conditions: "Warunki filtrowania",
    conditionsDesc: "Dodaj warunki filtrowania. Wybierz pole, operator i wartość.",
    addCondition: "+ Dodaj warunek", fieldPlaceholder: "-- pole --",
    valuePlaceholder: "wartość", customField: "-- inne (wpisz) --",
    customFieldPlaceholder: "nazwa pola",
    readOnly: "ODCZYT", writeMode: "ZAPIS",
    writeModalTitle: "Włączyć tryb zapisu?",
    writeModalText: "Tryb zapisu umożliwia tworzenie, edycję i usuwanie danych w wFirma. To jest system produkcyjny z prawdziwymi danymi finansowymi. Kontynuuj ostrożnie.",
    writeModalCancel: "Anuluj", writeModalConfirm: "Włącz tryb zapisu",
    writeBlocked: "Operacja zapisu zablokowana. Włącz tryb zapisu w pasku tytułowym.",
    prevPage: "Poprzednia strona", nextPage: "Następna strona",
    page: "Strona",
  },
  en: {
    tools: "Tools", resources: "Resources", history: "History",
    welcome: "Welcome", welcomeText: "Select a tool or resource from the sidebar.",
    connectedMsg: "Connected to MCP server", connectingMsg: "Connecting to MCP server...",
    disconnectedMsg: "Disconnected", errorMsg: "Connection error",
    connected: "Connected", connecting: "Connecting...", disconnected: "Disconnected", error: "Error",
    execute: "Execute", result: "Result", content: "Content",
    copy: "Copy", copied: "Copied!",
    executing: "Executing...", loadingResource: "Loading resource...",
    quickFilters: "Quick filters:", conditions: "Filter conditions",
    conditionsDesc: "Add filter conditions. Choose field, operator and value.",
    addCondition: "+ Add condition", fieldPlaceholder: "-- field --",
    valuePlaceholder: "value", customField: "-- other (type) --",
    customFieldPlaceholder: "field name",
    readOnly: "READ", writeMode: "WRITE",
    writeModalTitle: "Enable write mode?",
    writeModalText: "Write mode allows creating, editing and deleting data in wFirma. This is a live production system with real financial data. Proceed with caution.",
    writeModalCancel: "Cancel", writeModalConfirm: "Enable write mode",
    writeBlocked: "Write operation blocked. Enable write mode in the title bar.",
    prevPage: "Previous page", nextPage: "Next page",
    page: "Page",
  },
};

const TOOL_NAMES = {
  pl: { expenses_find: "Szukaj wydatków", expenses_get: "Szczegóły wydatku", expenses_count: "Liczba wydatków", contractors_find: "Szukaj kontrahentów", contractors_get: "Szczegóły kontrahenta", invoices_find: "Szukaj faktur", invoices_get: "Szczegóły faktury", payments_find: "Szukaj płatności", vat_codes_find: "Stawki VAT", api_request: "Zapytanie API" },
  en: { expenses_find: "Search expenses", expenses_get: "Expense details", expenses_count: "Count expenses", contractors_find: "Search contractors", contractors_get: "Contractor details", invoices_find: "Search invoices", invoices_get: "Invoice details", payments_find: "Search payments", vat_codes_find: "VAT rates", api_request: "API request" },
};

const RESOURCE_NAMES = {
  pl: { "expense-fields": "Pola wydatków", "api-modules": "Moduły API" },
  en: { "expense-fields": "Expense fields", "api-modules": "API modules" },
};

// ---------------------------------------------------------------------------
// wFirma field metadata
// ---------------------------------------------------------------------------

const WFIRMA_FIELDS = {
  expenses: [
    { field: "register_tax_book", label: { pl: "KPiR (rejestr podatkowy)", en: "KPiR (tax book)" }, values: [{ v: "1", l: { pl: "Tak (1)", en: "Yes (1)" } }, { v: "0", l: { pl: "Nie (0)", en: "No (0)" } }] },
    { field: "register_vat_book", label: { pl: "VAT/JPK (rejestr VAT)", en: "VAT/JPK (VAT book)" }, values: [{ v: "1", l: { pl: "Tak (1)", en: "Yes (1)" } }, { v: "0", l: { pl: "Nie (0)", en: "No (0)" } }] },
    { field: "type", label: { pl: "Typ dokumentu", en: "Document type" }, values: [{ v: "invoice", l: { pl: "Faktura VAT", en: "VAT invoice" } }, { v: "bill", l: { pl: "Rachunek", en: "Bill" } }, { v: "vat_exempt", l: { pl: "Zwolniony z VAT", en: "VAT exempt" } }] },
    { field: "date", label: { pl: "Data wystawienia", en: "Issue date" }, type: "date" },
    { field: "payment_method", label: { pl: "Metoda płatności", en: "Payment method" }, values: [{ v: "cash", l: { pl: "Gotówka", en: "Cash" } }, { v: "transfer", l: { pl: "Przelew", en: "Transfer" } }, { v: "compensation", l: { pl: "Kompensata", en: "Compensation" } }, { v: "payment_card", l: { pl: "Karta", en: "Card" } }] },
    { field: "paymentstate", label: { pl: "Status płatności", en: "Payment status" }, values: [{ v: "paid", l: { pl: "Opłacone", en: "Paid" } }, { v: "unpaid", l: { pl: "Nieopłacone", en: "Unpaid" } }, { v: "partial", l: { pl: "Częściowe", en: "Partial" } }] },
    { field: "currency", label: { pl: "Waluta", en: "Currency" }, type: "text", placeholder: "PLN" },
    { field: "description", label: { pl: "Opis", en: "Description" }, type: "text" },
    { field: "fullnumber", label: { pl: "Numer dokumentu", en: "Document number" }, type: "text" },
  ],
  contractors: [
    { field: "name", label: { pl: "Nazwa", en: "Name" }, type: "text" },
    { field: "nip", label: { pl: "NIP", en: "Tax ID" }, type: "text" },
    { field: "city", label: { pl: "Miasto", en: "City" }, type: "text" },
    { field: "email", label: { pl: "E-mail", en: "Email" }, type: "text" },
  ],
  invoices: [
    { field: "type", label: { pl: "Typ", en: "Type" }, values: [{ v: "normal", l: { pl: "Faktura VAT", en: "VAT invoice" } }, { v: "proforma", l: { pl: "Proforma", en: "Proforma" } }] },
    { field: "date", label: { pl: "Data wystawienia", en: "Issue date" }, type: "date" },
    { field: "paymentstate", label: { pl: "Status płatności", en: "Payment status" }, values: [{ v: "paid", l: { pl: "Opłacone", en: "Paid" } }, { v: "unpaid", l: { pl: "Nieopłacone", en: "Unpaid" } }] },
    { field: "fullnumber", label: { pl: "Numer faktury", en: "Invoice number" }, type: "text" },
  ],
  payments: [
    { field: "date", label: { pl: "Data", en: "Date" }, type: "date" },
  ],
};

const PRESETS = {
  expenses_find: [
    { label: { pl: "Tylko JPK (nie w KPiR)", en: "JPK-only (not in KPiR)" }, conditions: [{ field: "register_vat_book", operator: "eq", value: "1" }, { field: "register_tax_book", operator: "eq", value: "0" }] },
    { label: { pl: "KPiR + VAT", en: "KPiR + VAT" }, conditions: [{ field: "register_tax_book", operator: "eq", value: "1" }, { field: "register_vat_book", operator: "eq", value: "1" }] },
    { label: { pl: "Ostatni miesiąc", en: "Last month" }, get conditions() { return [{ field: "date", operator: "ge", value: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10) }]; } },
  ],
  expenses_count: [
    { label: { pl: "Tylko JPK (nie w KPiR)", en: "JPK-only (not in KPiR)" }, conditions: [{ field: "register_vat_book", operator: "eq", value: "1" }, { field: "register_tax_book", operator: "eq", value: "0" }] },
    { label: { pl: "Wszystkie", en: "All" }, conditions: [] },
  ],
};

const OPERATORS = [
  { v: "eq", l: "=" }, { v: "ne", l: "!=" }, { v: "gt", l: ">" }, { v: "lt", l: "<" },
  { v: "ge", l: ">=" }, { v: "le", l: "<=" }, { v: "like", l: "LIKE" }, { v: "not like", l: "NOT LIKE" },
  { v: "in", l: "IN" }, { v: "not in", l: "NOT IN" }, { v: "is null", l: "IS NULL" }, { v: "is not null", l: "IS NOT NULL" },
];

const WRITE_ACTIONS = new Set(["add", "edit", "delete"]);
const PRIORITY_COLUMNS = ["id", "fullnumber", "date", "type", "description", "name", "nip", "netto", "brutto", "currency", "paymentstate", "payment_method", "register_tax_book", "register_vat_book"];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let tools = [], resources = [];
const historyEntries = [];
let currentTool = null, lastParsedResult = null, lastArgs = null;
let lang = localStorage.getItem("wfirma-lang") || "pl";
let writeMode = false;
let currentView = "table"; // table | vtable | json

function t(k) { return I18N[lang]?.[k] ?? I18N.en[k] ?? k; }
function tl(o) { return typeof o === "string" ? o : o?.[lang] ?? o?.en ?? ""; }
function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// ---------------------------------------------------------------------------
// DOM
// ---------------------------------------------------------------------------
const $ = (s) => document.querySelector(s);
const statusDot = $("#status-dot"), statusText = $("#status-text");
const reconnectBtn = $("#reconnect-btn"), langToggle = $("#lang-toggle");
const modeBtn = $("#mode-btn"), modeIcon = $("#mode-icon");
const toolsList = $("#tools-list"), resourcesList = $("#resources-list"), historyList = $("#history-list");
const welcomePanel = $("#welcome-panel"), welcomeTitle = $("#welcome-title"), welcomeText = $("#welcome-text"), welcomeStatus = $("#welcome-status");
const toolPanel = $("#tool-panel"), toolNameEl = $("#tool-name"), toolDescEl = $("#tool-description"), toolForm = $("#tool-form");
const executeBtn = $("#execute-btn");
const resultContainer = $("#result-container"), resultOutput = $("#result-output");
const resultTiming = $("#result-timing"), resultTotal = $("#result-total");
const resultTableView = $("#result-table-view"), resultVtableView = $("#result-vtable-view");
const copyBtn = $("#copy-btn"), loadingOverlay = $("#loading-overlay");
const resourcePanel = $("#resource-panel"), resourceNameEl = $("#resource-name"), resourceUriEl = $("#resource-uri");
const resourceLoading = $("#resource-loading"), resourceResult = $("#resource-result"), resourceOutput = $("#resource-output"), resourceCopyBtn = $("#resource-copy-btn");
const viewTableBtn = $("#view-table-btn"), viewVtableBtn = $("#view-vtable-btn"), viewJsonBtn = $("#view-json-btn");
const writeModal = $("#write-modal"), modalCancel = $("#modal-cancel"), modalConfirm = $("#modal-confirm");

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------
function applyLang() {
  langToggle.textContent = lang.toUpperCase();
  $('[data-collapse="tools-list"] .heading-text').textContent = t("tools");
  $('[data-collapse="resources-list"] .heading-text').textContent = t("resources");
  $('[data-collapse="history-list"] .heading-text').textContent = t("history");
  welcomeTitle.textContent = t("welcome");
  welcomeText.textContent = t("welcomeText");
  executeBtn.textContent = t("execute");
  $("#result-label").textContent = t("result");
  $("#resource-content-label").textContent = t("content");
  copyBtn.textContent = t("copy");
  resourceCopyBtn.textContent = t("copy");
  modeBtn.textContent = writeMode ? t("writeMode") : t("readOnly");
  $("#modal-title").textContent = t("writeModalTitle");
  $("#modal-text").textContent = t("writeModalText");
  modalCancel.textContent = t("writeModalCancel");
  modalConfirm.textContent = t("writeModalConfirm");
  renderToolsList(); renderResourcesList();
}

langToggle.addEventListener("click", () => {
  lang = lang === "pl" ? "en" : "pl";
  localStorage.setItem("wfirma-lang", lang);
  applyLang();
  if (currentTool) selectTool(currentTool);
});

// ---------------------------------------------------------------------------
// Write mode
// ---------------------------------------------------------------------------
function updateModeUI() {
  modeBtn.textContent = writeMode ? t("writeMode") : t("readOnly");
  modeBtn.className = writeMode ? "mode-write" : "mode-readonly";
  modeIcon.textContent = writeMode ? "\u{1F513}" : "\u{1F512}";
}

modeBtn.addEventListener("click", () => {
  if (writeMode) { writeMode = false; updateModeUI(); return; }
  writeModal.classList.remove("hidden");
});

modalCancel.addEventListener("click", () => writeModal.classList.add("hidden"));
modalConfirm.addEventListener("click", () => {
  writeMode = true; updateModeUI(); writeModal.classList.add("hidden");
});

function isWriteOperation(toolName, args) {
  if (toolName === "api_request" && args?.action && WRITE_ACTIONS.has(args.action)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------
function updateStatus({ status, detail }) {
  statusDot.className = status;
  statusText.textContent = t(status);
  const map = { connected: "connectedMsg", connecting: "connectingMsg", disconnected: "disconnectedMsg", error: "errorMsg" };
  welcomeStatus.textContent = status === "error" ? `${t("errorMsg")}: ${detail}` : t(map[status] || "disconnectedMsg");
  if (status === "connected") loadToolsAndResources();
}

window.mcp.onConnectionStatus(updateStatus);
reconnectBtn.addEventListener("click", async () => { reconnectBtn.disabled = true; await window.mcp.connect(); reconnectBtn.disabled = false; });

async function loadToolsAndResources() {
  try { tools = await window.mcp.listTools(); renderToolsList(); } catch (e) { console.error(e); }
  try { resources = await window.mcp.listResources(); renderResourcesList(); } catch (e) { console.error(e); }
}

function renderToolsList() {
  toolsList.innerHTML = "";
  for (const tool of tools) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="tool-display-name">${escHtml(TOOL_NAMES[lang]?.[tool.name] || tool.name)}</span><span class="tool-tech-name">${escHtml(tool.name)}</span>`;
    li.title = tool.description || "";
    li.addEventListener("click", () => selectTool(tool));
    toolsList.appendChild(li);
  }
}

function renderResourcesList() {
  resourcesList.innerHTML = "";
  for (const res of resources) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="tool-display-name">${escHtml(RESOURCE_NAMES[lang]?.[res.name] || res.name)}</span><span class="tool-tech-name">${escHtml(res.name)}</span>`;
    li.addEventListener("click", () => selectResource(res));
    resourcesList.appendChild(li);
  }
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
document.querySelectorAll(".sidebar-heading").forEach((h) => {
  h.addEventListener("click", () => { const tgt = document.getElementById(h.dataset.collapse); h.classList.toggle("collapsed"); tgt.classList.toggle("collapsed-list"); });
});

function clearActive() { document.querySelectorAll(".sidebar-list li.active").forEach((el) => el.classList.remove("active")); }
function getModuleForTool(n) { for (const m of Object.keys(WFIRMA_FIELDS)) { if (n.startsWith(m)) return m; } return null; }

// ---------------------------------------------------------------------------
// Tool selection
// ---------------------------------------------------------------------------
function selectTool(tool) {
  currentTool = tool; clearActive();
  toolsList.querySelectorAll("li").forEach((li) => { if (li.querySelector(".tool-tech-name")?.textContent === tool.name) li.classList.add("active"); });
  welcomePanel.classList.add("hidden"); resourcePanel.classList.add("hidden");
  toolPanel.classList.remove("hidden"); resultContainer.classList.add("hidden");
  toolNameEl.innerHTML = `${escHtml(TOOL_NAMES[lang]?.[tool.name] || tool.name)} <span class="tool-name-tech">${escHtml(tool.name)}</span>`;
  toolDescEl.innerHTML = formatDescription(tool.description || "");
  generateSmartForm(tool);
}

function formatDescription(desc) {
  if (!desc) return "";
  let html = "", inList = false;
  for (const line of desc.split("\n")) {
    const tr = line.trim();
    if (tr.startsWith("- ")) {
      if (!inList) { html += '<ul class="desc-list">'; inList = true; }
      let c = escHtml(tr.slice(2)).replace(/^(\w[\w_]*(?:\s*\/\s*\w[\w_]*)*)(\s*[:—–-]\s*)/, "<strong>$1</strong>$2");
      html += `<li>${c}</li>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      if (tr.startsWith("WARNING:")) html += `<div class="desc-warning">${escHtml(tr)}</div>`;
      else if (tr.startsWith("Example:") || tr.startsWith("Returns:")) html += `<div class="desc-note">${escHtml(tr)}</div>`;
      else if (tr) html += `<p>${escHtml(tr)}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

// ---------------------------------------------------------------------------
// Form generation
// ---------------------------------------------------------------------------
function generateSmartForm(tool) {
  toolForm.innerHTML = "";
  const schema = tool.inputSchema;
  if (!schema?.properties) return;

  const presets = PRESETS[tool.name];
  if (presets?.length) {
    const bar = document.createElement("div"); bar.className = "presets-bar";
    bar.innerHTML = `<span class="presets-label">${t("quickFilters")}</span>`;
    for (const p of presets) {
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "preset-btn"; btn.textContent = tl(p.label);
      btn.addEventListener("click", () => applyPreset(tool, p)); bar.appendChild(btn);
    }
    toolForm.appendChild(bar);
  }

  const req = new Set(schema.required || []), mod = getModuleForTool(tool.name);
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (key === "conditions" && mod && WFIRMA_FIELDS[mod]) toolForm.appendChild(createConditionsBuilder(mod));
    else toolForm.appendChild(createFormField(key, prop, req.has(key)));
  }
}

function createConditionsBuilder(module) {
  const w = document.createElement("div"); w.className = "form-field";
  w.innerHTML = `<label>${t("conditions")}</label><div class="field-desc">${t("conditionsDesc")}</div>`;
  const c = document.createElement("div"); c.className = "conditions-builder"; c.dataset.fieldName = "conditions"; c.dataset.fieldType = "conditions-builder"; c.dataset.module = module;
  w.appendChild(c);
  const btn = document.createElement("button"); btn.type = "button"; btn.className = "add-item-btn"; btn.textContent = t("addCondition");
  btn.addEventListener("click", () => addConditionRow(c, module)); w.appendChild(btn);
  return w;
}

function addConditionRow(container, module, prefill) {
  const fields = WFIRMA_FIELDS[module] || [], row = document.createElement("div"); row.className = "condition-row";
  row.innerHTML = `<button type="button" class="remove-item-btn">\u00d7</button>`;
  row.querySelector(".remove-item-btn").addEventListener("click", () => row.remove());

  const fSel = document.createElement("select"); fSel.dataset.condPart = "field"; fSel.className = "cond-field";
  fSel.innerHTML = `<option value="">${t("fieldPlaceholder")}</option>` + fields.map((f) => `<option value="${f.field}">${tl(f.label)} (${f.field})</option>`).join("") + `<option value="__custom__">${t("customField")}</option>`;
  row.appendChild(fSel);

  const oSel = document.createElement("select"); oSel.dataset.condPart = "operator"; oSel.className = "cond-operator";
  oSel.innerHTML = OPERATORS.map((o) => `<option value="${o.v}">${o.l}</option>`).join("");
  row.appendChild(oSel);

  const vc = document.createElement("div"); vc.className = "cond-value-container";
  vc.innerHTML = `<input type="text" data-cond-part="value" class="cond-value" placeholder="${t("valuePlaceholder")}">`;
  row.appendChild(vc);

  const ci = document.createElement("input"); ci.type = "text"; ci.className = "cond-custom-field hidden"; ci.dataset.condPart = "custom-field"; ci.placeholder = t("customFieldPlaceholder");
  row.appendChild(ci);

  fSel.addEventListener("change", () => {
    ci.classList.toggle("hidden", fSel.value !== "__custom__");
    const meta = fields.find((f) => f.field === fSel.value); vc.innerHTML = "";
    if (meta?.values) {
      const s = document.createElement("select"); s.dataset.condPart = "value"; s.className = "cond-value";
      s.innerHTML = `<option value="">-- ${t("valuePlaceholder")} --</option>` + meta.values.map((v) => `<option value="${v.v}">${tl(v.l)}</option>`).join("");
      vc.appendChild(s);
    } else {
      const inp = document.createElement("input"); inp.type = meta?.type === "date" ? "date" : "text";
      inp.dataset.condPart = "value"; inp.className = "cond-value"; inp.placeholder = meta?.placeholder || t("valuePlaceholder"); vc.appendChild(inp);
    }
  });
  container.appendChild(row);
  if (prefill) { fSel.value = fields.find((f) => f.field === prefill.field) ? prefill.field : "__custom__"; fSel.dispatchEvent(new Event("change")); if (fSel.value === "__custom__") ci.value = prefill.field; oSel.value = prefill.operator || "eq"; const ve = vc.querySelector("[data-cond-part='value']"); if (ve && prefill.value !== undefined) ve.value = String(prefill.value); }
}

function applyPreset(tool, preset) {
  generateSmartForm(tool);
  const c = toolForm.querySelector(".conditions-builder"); if (!c) return; c.innerHTML = "";
  for (const cond of preset.conditions) addConditionRow(c, c.dataset.module, cond);
}

function createFormField(name, prop, isRequired) {
  const w = document.createElement("div"); w.className = "form-field";
  const type = prop.enum ? "enum" : (prop.anyOf || prop.oneOf || []).find((o) => o.type && o.type !== "null")?.type || prop.type || "string";
  if (type === "boolean") { w.classList.add("checkbox-row"); w.innerHTML = `<input type="checkbox" id="field-${name}" data-field-name="${name}" data-field-type="boolean"><label for="field-${name}">${name}${isRequired ? " *" : ""}</label>`; return w; }
  w.innerHTML = `<label for="field-${name}">${name}${isRequired ? " *" : ""}</label>`;
  if (prop.description) w.innerHTML += `<div class="field-desc">${prop.description}</div>`;
  if (type === "enum") { w.innerHTML += `<select id="field-${name}" data-field-name="${name}" data-field-type="enum"><option value="">--</option>${prop.enum.map((v) => `<option value="${v}">${v}</option>`).join("")}</select>`; }
  else if (type === "number" || type === "integer") { w.innerHTML += `<input type="number" id="field-${name}" data-field-name="${name}" data-field-type="number">`; }
  else if (type === "object" || type === "array") { w.innerHTML += `<textarea id="field-${name}" data-field-name="${name}" data-field-type="json" placeholder="JSON..."></textarea>`; }
  else { w.innerHTML += `<input type="text" id="field-${name}" data-field-name="${name}" data-field-type="string" placeholder="${prop.description || ""}">`; }
  return w;
}

// ---------------------------------------------------------------------------
// Collect values
// ---------------------------------------------------------------------------
function collectFormValues() {
  const args = {};
  const cb = toolForm.querySelector("[data-field-type='conditions-builder']");
  if (cb) {
    const conds = [];
    cb.querySelectorAll(".condition-row").forEach((row) => {
      let f = row.querySelector("[data-cond-part='field']")?.value || "";
      if (f === "__custom__") f = row.querySelector("[data-cond-part='custom-field']")?.value || "";
      const op = row.querySelector("[data-cond-part='operator']")?.value || "";
      const v = row.querySelector("[data-cond-part='value']")?.value ?? "";
      if (f && op) { const c = { field: f, operator: op }; if (v !== "" && !op.startsWith("is ")) c.value = v; conds.push(c); }
    });
    if (conds.length) args.conditions = conds;
  }
  toolForm.querySelectorAll("[data-field-name]").forEach((el) => {
    const n = el.dataset.fieldName, tp = el.dataset.fieldType;
    if (tp === "conditions-builder") return;
    if (tp === "boolean") { if (el.checked) args[n] = true; return; }
    if (tp === "number") { if (el.value.trim()) args[n] = Number(el.value); return; }
    if (tp === "json") { const v = el.value.trim(); if (v) try { args[n] = JSON.parse(v); } catch { args[n] = v; } return; }
    if (tp === "enum") { if (el.value) args[n] = el.value; return; }
    if (el.value.trim()) args[n] = el.value.trim();
  });
  return args;
}

// ---------------------------------------------------------------------------
// Execute
// ---------------------------------------------------------------------------
executeBtn.addEventListener("click", executeTool);
toolForm.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA") { e.preventDefault(); executeTool(); } });

function validateForm() {
  if (!currentTool?.inputSchema) return null;
  const required = currentTool.inputSchema.required || [];
  const args = collectFormValues();
  const missing = required.filter((f) => args[f] === undefined || args[f] === "");
  if (missing.length) return missing;
  return null;
}

async function executeWithArgs(toolName, args) {
  lastArgs = args;
  executeBtn.disabled = true; loadingOverlay.classList.remove("hidden");
  loadingOverlay.querySelector("span").textContent = t("executing");
  resultContainer.classList.add("hidden");
  const start = performance.now();
  try {
    const result = await window.mcp.callTool(toolName, args);
    const ms = Math.round(performance.now() - start);
    showResult(result, ms); addHistory(toolName, args, result, ms, false);
  } catch (err) {
    const ms = Math.round(performance.now() - start);
    const er = { error: err.message || String(err) };
    showResult(er, ms, true); addHistory(toolName, args, er, ms, true);
  } finally { executeBtn.disabled = false; loadingOverlay.classList.add("hidden"); }
}

async function executeTool() {
  if (!currentTool) return;
  const missing = validateForm();
  if (missing) {
    // Highlight missing fields
    missing.forEach((f) => {
      const el = toolForm.querySelector(`#field-${f}`);
      if (el) { el.classList.add("field-error"); el.addEventListener("input", () => el.classList.remove("field-error"), { once: true }); }
    });
    return;
  }
  const args = collectFormValues();
  if (isWriteOperation(currentTool.name, args) && !writeMode) {
    alert(t("writeBlocked")); return;
  }
  await executeWithArgs(currentTool.name, args);
}

// ---------------------------------------------------------------------------
// View switching
// ---------------------------------------------------------------------------
function setView(v) {
  currentView = v;
  viewTableBtn.classList.toggle("active", v === "table");
  viewVtableBtn.classList.toggle("active", v === "vtable");
  viewJsonBtn.classList.toggle("active", v === "json");
  resultTableView.classList.toggle("hidden", v !== "table");
  resultVtableView.classList.toggle("hidden", v !== "vtable");
  resultOutput.classList.toggle("hidden", v !== "json");
  if (v === "table") renderTableView(lastParsedResult);
  if (v === "vtable") renderVtableView(lastParsedResult);
}

viewTableBtn.addEventListener("click", () => setView("table"));
viewVtableBtn.addEventListener("click", () => setView("vtable"));
viewJsonBtn.addEventListener("click", () => setView("json"));

// ---------------------------------------------------------------------------
// Show result
// ---------------------------------------------------------------------------
function showResult(result, elapsed, isError) {
  resultContainer.classList.remove("hidden"); resultTiming.textContent = `${elapsed}ms`;
  let display = result;
  if (result?.content && Array.isArray(result.content)) {
    const texts = result.content.map((c) => c.text || "").join("\n");
    try { display = JSON.parse(texts); } catch { display = texts; }
  }
  lastParsedResult = display;
  resultOutput.textContent = typeof display === "string" ? display : JSON.stringify(display, null, 2);
  resultOutput.classList.toggle("error-result", !!(isError || result?.isError));

  const records = extractRecords(display);
  const hasRecords = records && records.length > 0 && !isError;
  viewTableBtn.classList.toggle("hidden", !hasRecords);
  viewVtableBtn.classList.toggle("hidden", !hasRecords);
  const total = extractTotal(display);
  resultTotal.textContent = hasRecords ? (total ? `(${records.length} / ${total})` : `(${records.length})`) : "";

  setView(hasRecords ? "table" : "json");
  renderPagination(display);
}

// ---------------------------------------------------------------------------
// Data extraction
// ---------------------------------------------------------------------------
function extractRecords(data) {
  if (!data || typeof data !== "object") return null;
  for (const k of Object.keys(data)) {
    if (k === "status") continue;
    const mod = data[k]; if (!mod || typeof mod !== "object") continue;
    const recs = [];
    for (const idx of Object.keys(mod)) {
      if (idx === "parameters") continue;
      const item = mod[idx]; if (!item || typeof item !== "object") continue;
      const innerKey = Object.keys(item).find((ik) => typeof item[ik] === "object");
      if (innerKey) recs.push({ _type: innerKey, ...flattenRecord(item[innerKey]) });
    }
    if (recs.length > 0) return recs;
  }
  return null;
}

function extractTotal(data) {
  if (!data || typeof data !== "object") return null;
  for (const k of Object.keys(data)) { if (k !== "status" && data[k]?.parameters?.total) return data[k].parameters.total; }
  return null;
}

function extractPagination(data) {
  if (!data || typeof data !== "object") return null;
  for (const k of Object.keys(data)) { if (k !== "status" && data[k]?.parameters) { const p = data[k].parameters; return { page: parseInt(p.page) || 1, limit: parseInt(p.limit) || 20, total: parseInt(p.total) || 0 }; } }
  return null;
}

function flattenRecord(obj) {
  const flat = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) flat[k] = "";
    else if (typeof v === "object" && !Array.isArray(v)) { if (v.id !== undefined) flat[k] = v.id === 0 ? "" : `#${v.id}`; }
    else flat[k] = String(v);
  }
  return flat;
}

// ---------------------------------------------------------------------------
// Table view
// ---------------------------------------------------------------------------
const MONEY_COLS = new Set(["netto", "brutto", "total", "alreadypaid", "remaining", "value", "tax"]);

function renderTableView(data) {
  const records = extractRecords(data);
  if (!records?.length) { resultTableView.innerHTML = ""; return; }
  const allCols = new Set(); records.forEach((r) => Object.keys(r).forEach((k) => { if (k !== "_type") allCols.add(k); }));
  const cols = [...PRIORITY_COLUMNS.filter((c) => allCols.has(c)), ...[...allCols].filter((c) => !PRIORITY_COLUMNS.includes(c)).sort()];

  let html = "<table><thead><tr>" + cols.map((c) => `<th>${c}</th>`).join("") + "</tr></thead><tbody>";
  for (const rec of records) {
    html += "<tr>" + cols.map((c) => {
      const v = rec[c] ?? "";
      const cls = c === "id" ? "cell-id" : MONEY_COLS.has(c) ? "cell-money" : "";
      return `<td class="${cls}">${escHtml(v)}</td>`;
    }).join("") + "</tr>";
  }
  html += "</tbody></table>";
  resultTableView.innerHTML = html;
  bindIdClicks(resultTableView);
}

// ---------------------------------------------------------------------------
// Vertical table view
// ---------------------------------------------------------------------------
function renderVtableView(data) {
  const records = extractRecords(data);
  if (!records?.length) { resultVtableView.innerHTML = ""; return; }
  let html = "";
  records.forEach((rec, i) => {
    const id = rec.id || `#${i + 1}`;
    const label = rec.fullnumber || rec.name || id;
    html += `<div class="vtable-record"><div class="vtable-record-header">${escHtml(label)} (ID: ${escHtml(id)})</div>`;
    for (const [k, v] of Object.entries(rec)) {
      if (k === "_type" || v === "") continue;
      html += `<div class="vtable-row"><span class="vtable-key">${k}</span><span class="vtable-val">${escHtml(v)}</span></div>`;
    }
    html += "</div>";
  });
  resultVtableView.innerHTML = html;
}

// ---------------------------------------------------------------------------
// Master-detail — click ID to get details
// ---------------------------------------------------------------------------
function bindIdClicks(container) {
  container.querySelectorAll(".cell-id").forEach((cell) => {
    cell.addEventListener("click", () => {
      const id = parseInt(cell.textContent);
      if (isNaN(id) || !currentTool) return;
      const getName = currentTool.name.replace(/_find$/, "_get").replace(/_count$/, "_get");
      const getTool = tools.find((t) => t.name === getName);
      if (getTool) { selectTool(getTool); const f = toolForm.querySelector("#field-id"); if (f) f.value = id; executeTool(); }
    });
  });
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
function renderPagination(data) {
  const existing = document.getElementById("pagination-bar");
  if (existing) existing.remove();
  const pag = extractPagination(data);
  if (!pag || pag.total <= pag.limit) return;

  const totalPages = Math.ceil(pag.total / pag.limit);
  const bar = document.createElement("div"); bar.id = "pagination-bar"; bar.className = "pagination-bar";
  bar.innerHTML = `
    <button class="pagination-btn" id="page-prev" ${pag.page <= 1 ? "disabled" : ""} title="${t("prevPage")}">&#9664; </button>
    <span class="pagination-info">${t("page")} ${pag.page} / ${totalPages}</span>
    <button class="pagination-btn" id="page-next" ${pag.page >= totalPages ? "disabled" : ""} title="${t("nextPage")}">&#9654;</button>
  `;
  resultContainer.appendChild(bar);

  const goToPage = async (page) => {
    if (!currentTool || !lastArgs) return;
    await executeWithArgs(currentTool.name, { ...lastArgs, page });
  };

  bar.querySelector("#page-prev").addEventListener("click", () => goToPage(pag.page - 1));
  bar.querySelector("#page-next").addEventListener("click", () => goToPage(pag.page + 1));
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
function getExportData() {
  const records = extractRecords(lastParsedResult);
  if (!records?.length) return null;
  const allCols = new Set(); records.forEach((r) => Object.keys(r).forEach((k) => { if (k !== "_type") allCols.add(k); }));
  const cols = [...PRIORITY_COLUMNS.filter((c) => allCols.has(c)), ...[...allCols].filter((c) => !PRIORITY_COLUMNS.includes(c)).sort()];
  return { cols, records };
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

$("#export-csv-btn").addEventListener("click", () => {
  const d = getExportData(); if (!d) return;
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [d.cols.join(","), ...d.records.map((r) => d.cols.map((c) => esc(r[c] ?? "")).join(","))].join("\n");
  downloadFile("\uFEFF" + csv, `wfirma_${currentTool?.name || "export"}.csv`, "text/csv;charset=utf-8");
});

$("#export-excel-btn").addEventListener("click", () => {
  const d = getExportData(); if (!d) return;
  let table = "<table><tr>" + d.cols.map((c) => `<th>${escHtml(c)}</th>`).join("") + "</tr>";
  for (const r of d.records) { table += "<tr>" + d.cols.map((c) => `<td>${escHtml(r[c] ?? "")}</td>`).join("") + "</tr>"; }
  table += "</table>";
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>${table}</body></html>`;
  downloadFile(html, `wfirma_${currentTool?.name || "export"}.xls`, "application/vnd.ms-excel");
});

$("#export-pdf-btn").addEventListener("click", () => {
  const d = getExportData(); if (!d) return;
  let table = `<html><head><meta charset="utf-8"><style>body{font:12px sans-serif}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f0f0f0;font-size:11px}</style></head><body><h2>wFirma — ${currentTool?.name || "export"}</h2><table><tr>` + d.cols.map((c) => `<th>${escHtml(c)}</th>`).join("") + "</tr>";
  for (const r of d.records) { table += "<tr>" + d.cols.map((c) => `<td>${escHtml(r[c] ?? "")}</td>`).join("") + "</tr>"; }
  table += "</table></body></html>";
  const w = window.open("", "_blank"); w.document.write(table); w.document.close(); w.print();
});

// ---------------------------------------------------------------------------
// Resources — markdown rendering
// ---------------------------------------------------------------------------
async function selectResource(res) {
  clearActive(); resourcesList.querySelectorAll("li").forEach((li) => { if (li.querySelector(".tool-tech-name")?.textContent === res.name) li.classList.add("active"); });
  welcomePanel.classList.add("hidden"); toolPanel.classList.add("hidden"); resourcePanel.classList.remove("hidden");
  resourceResult.classList.add("hidden"); resourceLoading.classList.remove("hidden");
  resourceLoading.querySelector("span").textContent = t("loadingResource");
  resourceNameEl.innerHTML = `${escHtml(RESOURCE_NAMES[lang]?.[res.name] || res.name)} <span class="tool-name-tech">${escHtml(res.name)}</span>`;
  resourceUriEl.textContent = res.uri;
  try {
    const result = await window.mcp.readResource(res.uri);
    resourceLoading.classList.add("hidden"); resourceResult.classList.remove("hidden");
    resourceOutput.innerHTML = renderMarkdown(result?.contents?.map((c) => c.text || "").join("\n") || "");
  } catch (err) {
    resourceLoading.classList.add("hidden"); resourceResult.classList.remove("hidden");
    resourceOutput.textContent = "Error: " + (err.message || String(err)); resourceOutput.classList.add("error-result");
  }
}

function renderMarkdown(md) {
  let html = "", inTable = false, tableRows = [];
  const flush = () => {
    if (!tableRows.length) return;
    html += '<table class="md-table"><thead><tr>' + tableRows[0].map((h) => `<th>${escHtml(h)}</th>`).join("") + "</tr></thead><tbody>";
    for (let i = 1; i < tableRows.length; i++) html += "<tr>" + tableRows[i].map((c) => `<td>${fmtCell(c)}</td>`).join("") + "</tr>";
    html += "</tbody></table>"; tableRows = []; inTable = false;
  };
  const fmtCell = (s) => escHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
  for (const line of md.split("\n")) {
    const tr = line.trim();
    if (/^\|[\s:|-]+\|$/.test(tr)) continue;
    if (tr.startsWith("|") && tr.endsWith("|")) { if (!inTable) inTable = true; tableRows.push(tr.slice(1, -1).split("|").map((c) => c.trim())); continue; }
    if (inTable) flush();
    if (tr.startsWith("### ")) html += `<h4 class="md-h3">${escHtml(tr.slice(4))}</h4>`;
    else if (tr.startsWith("## ")) html += `<h3 class="md-h2">${escHtml(tr.slice(3))}</h3>`;
    else if (tr.startsWith("# ")) html += `<h2 class="md-h1">${escHtml(tr.slice(2))}</h2>`;
    else if (tr) html += `<p class="md-p">${fmtCell(tr)}</p>`;
  }
  if (inTable) flush();
  return html;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------
function addHistory(name, args, result, elapsed, isError) {
  historyEntries.unshift({ name, args, result, elapsed, isError, time: new Date() });
  if (historyEntries.length > 50) historyEntries.pop(); renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  for (const e of historyEntries) {
    const li = document.createElement("li"); if (e.isError) li.classList.add("history-error");
    const ts = e.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    li.innerHTML = `${escHtml(TOOL_NAMES[lang]?.[e.name] || e.name)} <span class="history-time">${escHtml(ts)} (${e.elapsed}ms)</span>`;
    li.addEventListener("click", () => { const tool = tools.find((t) => t.name === e.name); if (tool) { selectTool(tool); showResult(e.result, e.elapsed, e.isError); } });
    historyList.appendChild(li);
  }
}

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
copyBtn.addEventListener("click", () => { navigator.clipboard.writeText(resultOutput.textContent).then(() => { copyBtn.textContent = t("copied"); setTimeout(() => copyBtn.textContent = t("copy"), 1500); }); });
resourceCopyBtn.addEventListener("click", () => { navigator.clipboard.writeText(resourceOutput.innerText).then(() => { resourceCopyBtn.textContent = t("copied"); setTimeout(() => resourceCopyBtn.textContent = t("copy"), 1500); }); });

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
applyLang(); updateModeUI();
(async () => { const status = await window.mcp.getConnectionStatus(); updateStatus({ status, detail: "" }); })();
