export const FINANCE_EXPLORER_URI = "ui://wfirma/finance-explorer";

/**
 * Generates the self-contained HTML/CSS/JS bundle for the wFirma Finance Explorer MCP App.
 * Implements the MCP Apps JSON-RPC over postMessage protocol ("2026-01-26").
 */
export function getFinanceExplorerHtml(): string {
  return `<!DOCTYPE html>
<html lang="pl" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>wFirma Finanse Explorer</title>
  <style>
    :root {
      --bg-primary: var(--color-background-primary, #0f172a);
      --bg-secondary: var(--color-background-secondary, #1e293b);
      --bg-tertiary: var(--color-background-tertiary, #334155);
      --text-primary: var(--color-text-primary, #f8fafc);
      --text-secondary: var(--color-text-secondary, #94a3b8);
      --text-muted: var(--color-text-tertiary, #64748b);
      --border-color: var(--color-border-primary, #334155);
      --accent: #3b82f6;
      --accent-hover: #2563eb;
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.14);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.14);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.14);
      --info: #6366f1;
      --info-bg: rgba(99, 102, 241, 0.14);
      --radius: 8px;
      --font-sans: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
      --font-mono: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
    }

    html[data-theme="light"] {
      --bg-primary: var(--color-background-primary, #ffffff);
      --bg-secondary: var(--color-background-secondary, #f8fafc);
      --bg-tertiary: var(--color-background-tertiary, #f1f5f9);
      --text-primary: var(--color-text-primary, #0f172a);
      --text-secondary: var(--color-text-secondary, #475569);
      --text-muted: var(--color-text-tertiary, #64748b);
      --border-color: var(--color-border-primary, #e2e8f0);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      font-size: 13px;
      line-height: 1.45;
      color: var(--text-primary);
      background: var(--bg-primary);
      min-height: 480px;
      overflow-x: hidden;
    }

    /* Top Header */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: -0.5px;
    }

    .brand-title {
      font-weight: 600;
      font-size: 14px;
    }

    .company-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 9px;
      border-radius: 999px;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      font-size: 11px;
      border: 1px solid var(--border-color);
    }

    .tabs {
      display: flex;
      gap: 4px;
      background: var(--bg-primary);
      padding: 3px;
      border-radius: var(--radius);
      border: 1px solid var(--border-color);
    }

    .tab-btn {
      border: none;
      background: transparent;
      color: var(--text-secondary);
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tab-btn:hover {
      color: var(--text-primary);
    }

    .tab-btn.active {
      background: var(--accent);
      color: #ffffff;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn:hover:not(:disabled) {
      background: var(--bg-tertiary);
    }

    .btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-hover);
    }

    /* KPI Row */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(130px, 1fr));
      gap: 10px;
      padding: 12px 16px 6px;
    }

    @media (max-width: 680px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .kpi-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 10px 12px;
    }

    .kpi-label {
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 4px;
    }

    .kpi-value {
      font-size: 16px;
      font-weight: 700;
      font-family: var(--font-mono);
    }

    .kpi-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 16px;
      flex-wrap: wrap;
    }

    .preset-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .pill {
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-secondary);
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .pill:hover {
      border-color: var(--accent);
      color: var(--text-primary);
    }

    .pill.active {
      background: rgba(59, 130, 246, 0.18);
      border-color: var(--accent);
      color: #60a5fa;
      font-weight: 600;
    }

    html[data-theme="light"] .pill.active {
      color: #1d4ed8;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .search-input {
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 12px;
      min-width: 190px;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent);
    }

    /* Table Container */
    .table-wrap {
      margin: 4px 16px 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      background: var(--bg-secondary);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
    }

    th:hover {
      color: var(--text-primary);
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-color);
      font-size: 12.5px;
      vertical-align: middle;
    }

    tbody tr {
      cursor: pointer;
      transition: background 0.12s ease;
    }

    tbody tr:hover {
      background: rgba(59, 130, 246, 0.08);
    }

    tbody tr.selected {
      background: rgba(59, 130, 246, 0.16);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    .cell-mono {
      font-family: var(--font-mono);
      white-space: nowrap;
    }

    .cell-right {
      text-align: right;
      font-family: var(--font-mono);
      white-space: nowrap;
    }

    .cell-truncate {
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 600;
      white-space: nowrap;
      margin-right: 3px;
    }

    .badge-paid {
      background: var(--success-bg);
      color: var(--success);
    }

    .badge-unpaid {
      background: var(--danger-bg);
      color: var(--danger);
    }

    .badge-partial {
      background: var(--warning-bg);
      color: var(--warning);
    }

    .badge-jpk-only {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.35);
    }

    .badge-kpir {
      background: var(--info-bg);
      color: #818cf8;
    }

    /* Pagination */
    .footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px 14px;
      color: var(--text-secondary);
      font-size: 12px;
    }

    .pagination {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Empty & Loading states */
    .empty-state {
      padding: 36px 20px;
      text-align: center;
      color: var(--text-secondary);
    }

    .status-banner {
      margin: 8px 16px;
      padding: 8px 12px;
      border-radius: var(--radius);
      font-size: 12px;
      display: none;
    }

    .status-banner.error {
      display: block;
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.35);
    }

    .status-banner.loading {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid var(--border-color);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Slide-over Detail Drawer */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      z-index: 40;
      display: none;
    }

    .drawer-backdrop.open {
      display: block;
    }

    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(520px, 92vw);
      background: var(--bg-primary);
      border-left: 1px solid var(--border-color);
      z-index: 50;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.2s ease;
      box-shadow: -8px 0 24px rgba(0, 0, 0, 0.35);
    }

    .drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }

    .drawer-title {
      font-weight: 700;
      font-size: 14px;
    }

    .drawer-body {
      padding: 14px 16px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .detail-section {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 10px 12px;
    }

    .detail-section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-secondary);
      margin-bottom: 8px;
      letter-spacing: 0.03em;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 12px;
    }

    .detail-item-label {
      font-size: 11px;
      color: var(--text-muted);
    }

    .detail-item-val {
      font-size: 12.5px;
      font-weight: 500;
      word-break: break-word;
    }

    .ai-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .raw-json {
      font-family: var(--font-mono);
      font-size: 11px;
      background: var(--bg-primary);
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      max-height: 220px;
      overflow: auto;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="topbar">
    <div class="brand">
      <div class="brand-logo">wF</div>
      <div>
        <div class="brand-title" id="app-title">wFirma Finanse Explorer</div>
      </div>
      <span class="company-pill" id="company-pill" title="Aktywna firma wFirma">
        <span id="company-name">wFirma API</span>
      </span>
    </div>

    <div class="tabs" role="tablist">
      <button type="button" class="tab-btn active" id="tab-expenses" data-tab="expenses">Koszty (Wydatki)</button>
      <button type="button" class="tab-btn" id="tab-invoices" data-tab="invoices">Faktury sprzedaży</button>
    </div>

    <div class="toolbar-actions">
      <button type="button" class="btn" id="btn-export-csv" title="Eksportuj widok do CSV">CSV</button>
      <button type="button" class="btn" id="btn-export-xls" title="Eksportuj widok do Excela">XLS</button>
      <button type="button" class="btn" id="btn-lang" title="Przełącz język PL/EN">PL</button>
      <button type="button" class="btn" id="btn-fullscreen" title="Pełny ekran">&#x26F6;</button>
      <button type="button" class="btn btn-primary" id="btn-refresh" title="Odśwież dane z wFirma">&#x21bb;</button>
    </div>
  </header>

  <!-- Status / Error Banner -->
  <div id="status-banner" class="status-banner"></div>

  <!-- KPI Cards -->
  <section class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label" id="kpi-count-label">Dokumenty</div>
      <div class="kpi-value" id="kpi-count-val">0</div>
      <div class="kpi-sub" id="kpi-count-sub">W bieżącym widoku</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label" id="kpi-netto-label">Suma Netto</div>
      <div class="kpi-value" id="kpi-netto-val">0,00 PLN</div>
      <div class="kpi-sub" id="kpi-netto-sub">Strona wyników</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label" id="kpi-brutto-label">Suma Brutto</div>
      <div class="kpi-value" id="kpi-brutto-val">0,00 PLN</div>
      <div class="kpi-sub" id="kpi-brutto-sub">VAT: 0,00 PLN</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label" id="kpi-diag-label">Tylko JPK / Nieopłacone</div>
      <div class="kpi-value" id="kpi-diag-val">0</div>
      <div class="kpi-sub" id="kpi-diag-sub">Wymaga uwagi</div>
    </div>
  </section>

  <!-- Quick Filters & Search -->
  <section class="filter-bar">
    <div class="preset-pills" id="preset-pills"></div>
    <div class="search-box">
      <input type="search" id="search-input" class="search-input" placeholder="Szukaj nr, kontrahenta, opisu..." />
    </div>
  </section>

  <!-- Main Table -->
  <main class="table-wrap">
    <div id="table-container">
      <div class="empty-state" id="empty-state">
        Oczekiwanie na dane z narzędzia wFirma MCP lub kliknij <strong>Odśwież</strong>, aby pobrać dokumenty...
      </div>
    </div>
  </main>

  <!-- Pagination Footer -->
  <footer class="footer-bar">
    <div id="footer-info">—</div>
    <div class="pagination">
      <button type="button" class="btn" id="btn-prev" disabled>&#9664; Poprzednia</button>
      <span id="page-indicator">Strona 1 / 1</span>
      <button type="button" class="btn" id="btn-next" disabled>Następna &#9654;</button>
    </div>
  </footer>

  <!-- Slide-over Detail Drawer -->
  <div id="drawer-backdrop" class="drawer-backdrop"></div>
  <aside id="detail-drawer" class="drawer" aria-hidden="true">
    <div class="drawer-header">
      <div>
        <div class="drawer-title" id="drawer-title">Szczegóły dokumentu</div>
        <div style="font-size: 11px; color: var(--text-secondary);" id="drawer-subtitle"></div>
      </div>
      <button type="button" class="btn" id="btn-close-drawer">&#x2715;</button>
    </div>
    <div class="drawer-body" id="drawer-body"></div>
  </aside>

  <script>
    (function () {
      // -----------------------------------------------------------------------
      // I18N Dictionary (PL / EN)
      // -----------------------------------------------------------------------
      const I18N = {
        pl: {
          tabExpenses: "Koszty (Wydatki)",
          tabInvoices: "Faktury sprzedaży",
          kpiDocs: "Dokumenty",
          kpiInView: "W bieżącym widoku",
          kpiNetto: "Suma Netto",
          kpiBrutto: "Suma Brutto",
          kpiPageSum: "Suma na stronie",
          kpiJpkDiag: "Tylko JPK (poza KPiR)",
          kpiUnpaidDiag: "Nieopłacone",
          searchPlaceholder: "Szukaj nr, kontrahenta, opisu...",
          emptyWaiting: "Brak załadowanych dokumentów. Użyj filtrów powyżej lub kliknij Odśwież.",
          loading: "Pobieranie danych z wFirma...",
          prev: "Poprzednia",
          next: "Następna",
          page: "Strona",
          paid: "Opłacone",
          unpaid: "Nieopłacone",
          partial: "Częściowo",
          jpkOnly: "Tylko JPK!",
          kpirAndVat: "KPiR + VAT",
          kpirOnly: "Tylko KPiR",
          unbooked: "Niezaksięgowany",
          colNumber: "Numer",
          colDate: "Data wyst.",
          colKpirDate: "Data KPiR / Termin",
          colContractor: "Kontrahent",
          colDescription: "Opis / Schemat",
          colNetto: "Netto",
          colBrutto: "Brutto",
          colRegisters: "Rejestry",
          colStatus: "Płatność",
          presetAll: "Wszystkie",
          presetJpkOnly: "Tylko JPK (poza KPiR)",
          presetKpirVat: "KPiR + VAT",
          presetUnpaid: "Nieopłacone",
          presetThisMonth: "Ten miesiąc",
          presetPrevMonth: "Poprzedni miesiąc",
          presetNormal: "Faktury VAT",
          presetProforma: "Proformy",
          drawerDetails: "Podstawowe informacje",
          drawerContractor: "Kontrahent",
          drawerParts: "Pozycje / Rozbicie VAT",
          drawerAiActions: "Akcje z Claude AI",
          drawerRawJson: "Surowy JSON (wFirma API)",
          askExplainBooking: "Wyjaśnij ujęcie w KPiR / JPK",
          askPaymentReminder: "Przygotuj przypomnienie o płatności",
          askAnalyzeDoc: "Przeanalizuj ten dokument w czacie",
        },
        en: {
          tabExpenses: "Expenses (Costs)",
          tabInvoices: "Sales Invoices",
          kpiDocs: "Documents",
          kpiInView: "In current view",
          kpiNetto: "Total Net",
          kpiBrutto: "Total Gross",
          kpiPageSum: "Current page sum",
          kpiJpkDiag: "JPK-only (outside KPiR)",
          kpiUnpaidDiag: "Unpaid",
          searchPlaceholder: "Search number, contractor, description...",
          emptyWaiting: "No documents loaded. Use the filters above or click Refresh.",
          loading: "Fetching data from wFirma...",
          prev: "Previous",
          next: "Next",
          page: "Page",
          paid: "Paid",
          unpaid: "Unpaid",
          partial: "Partial",
          jpkOnly: "JPK-only!",
          kpirAndVat: "KPiR + VAT",
          kpirOnly: "KPiR only",
          unbooked: "Unbooked",
          colNumber: "Number",
          colDate: "Issue Date",
          colKpirDate: "KPiR / Due Date",
          colContractor: "Contractor",
          colDescription: "Description / Schema",
          colNetto: "Net",
          colBrutto: "Gross",
          colRegisters: "Registers",
          colStatus: "Payment",
          presetAll: "All",
          presetJpkOnly: "JPK-only (not in KPiR)",
          presetKpirVat: "KPiR + VAT",
          presetUnpaid: "Unpaid",
          presetThisMonth: "This month",
          presetPrevMonth: "Previous month",
          presetNormal: "VAT Invoices",
          presetProforma: "Proforma",
          drawerDetails: "Document Metadata",
          drawerContractor: "Contractor",
          drawerParts: "Line Items / VAT Breakdown",
          drawerAiActions: "Claude AI Actions",
          drawerRawJson: "Raw JSON (wFirma API)",
          askExplainBooking: "Explain KPiR / JPK booking",
          askPaymentReminder: "Draft payment reminder",
          askAnalyzeDoc: "Analyze this document in chat",
        },
      };

      const SCHEMA_LABELS = {
        invoice_cost: "Koszt ogólny (kol. 13)",
        purchase_trade_goods: "Towary i materiały (kol. 10)",
        vehicle_fuel: "Paliwo (75% / kol. 13)",
        vehicle_expense: "Eksploatacja pojazdu (kol. 13)",
      };

      // -----------------------------------------------------------------------
      // State
      // -----------------------------------------------------------------------
      let lang = "pl";
      let activeTab = "expenses"; // "expenses" | "invoices"
      let activePreset = "all";
      let searchQuery = "";
      let displayMode = "inline";
      let sortCol = "date";
      let sortAsc = false;
      let hostCapabilities = {};
      let activeToolName = "";

      const stateByTab = {
        expenses: { records: [], rawById: {}, page: 1, limit: 20, total: 0, conditions: [] },
        invoices: { records: [], rawById: {}, page: 1, limit: 20, total: 0, conditions: [] },
      };

      let selectedRecordId = null;

      function t(key) {
        return (I18N[lang] && I18N[lang][key]) || I18N.pl[key] || key;
      }

      function escHtml(val) {
        return String(val ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function formatMoney(val, currency) {
        const num = Number(val);
        if (!Number.isFinite(num)) return escHtml(val || "0,00");
        const formatted = num.toLocaleString(lang === "pl" ? "pl-PL" : "en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return currency ? formatted + " " + escHtml(currency) : formatted;
      }

      function formatLocalIsoDate(d) {
        return (
          d.getFullYear() +
          "-" +
          String(d.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(d.getDate()).padStart(2, "0")
        );
      }

      function getMonthRange(offsetMonths) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
        const end = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0);
        return { start: formatLocalIsoDate(start), end: formatLocalIsoDate(end) };
      }

      // -----------------------------------------------------------------------
      // MCP Apps JSON-RPC Bridge (postMessage)
      // -----------------------------------------------------------------------
      let rpcId = 1;
      const pendingRequests = new Map();

      function sendRpcRequest(method, params) {
        const id = rpcId++;
        const msg = { jsonrpc: "2.0", id, method, params: params || {} };
        window.parent.postMessage(msg, "*");
        return new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            pendingRequests.delete(id);
            reject(new Error("RPC timeout for " + method));
          }, 30000);
          pendingRequests.set(id, {
            resolve: (res) => { clearTimeout(timer); resolve(res); },
            reject: (err) => { clearTimeout(timer); reject(err); },
          });
        });
      }

      function sendRpcNotification(method, params) {
        window.parent.postMessage({ jsonrpc: "2.0", method, params: params || {} }, "*");
      }

      function applyHostContext(ctx) {
        if (!ctx) return;
        if (ctx.theme === "light" || ctx.theme === "dark") {
          document.documentElement.setAttribute("data-theme", ctx.theme);
          document.documentElement.style.colorScheme = ctx.theme;
        }
        if (ctx.styles && ctx.styles.variables) {
          for (const [k, v] of Object.entries(ctx.styles.variables)) {
            if (typeof v === "string") {
              document.documentElement.style.setProperty(k, v);
            }
          }
        }
        if (ctx.displayMode) {
          displayMode = ctx.displayMode;
        }
      }

      window.addEventListener("message", (event) => {
        const data = event.data;
        if (!data || data.jsonrpc !== "2.0") return;

        // Response to our request
        if (data.id !== undefined && (data.result !== undefined || data.error !== undefined)) {
          const pending = pendingRequests.get(data.id);
          if (pending) {
            pendingRequests.delete(data.id);
            if (data.error) pending.reject(new Error(data.error.message || "RPC Error"));
            else pending.resolve(data.result);
          }
          return;
        }

        // Notifications from host
        if (data.method === "ui/notifications/tool-input") {
          const args = data.params && data.params.arguments;
          const targetTab =
            args && (args.tab === "invoices" || args.tab === "expenses")
              ? args.tab
              : activeToolName.startsWith("invoices")
                ? "invoices"
                : activeToolName.startsWith("expenses")
                  ? "expenses"
                  : activeTab;
          if (args && args.tab && (args.tab === "invoices" || args.tab === "expenses")) {
            activeTab = args.tab;
            renderTabs();
          }
          if (args && Array.isArray(args.conditions) && stateByTab[targetTab]) {
            stateByTab[targetTab].conditions = args.conditions;
          }
        } else if (data.method === "ui/notifications/tool-result") {
          handleIncomingToolResult(data.params);
        } else if (data.method === "ui/notifications/host-context-changed") {
          applyHostContext(data.params);
        } else if (data.method === "ping") {
          window.parent.postMessage({ jsonrpc: "2.0", id: data.id, result: {} }, "*");
        } else if (data.method === "ui/resource-teardown") {
          window.parent.postMessage({ jsonrpc: "2.0", id: data.id, result: {} }, "*");
        }
      });

      async function initMcpApp() {
        try {
          const initRes = await sendRpcRequest("ui/initialize", {
            protocolVersion: "2026-01-26",
            appInfo: { name: "wFirma Finanse Explorer", version: "0.3.0" },
            appCapabilities: { availableDisplayModes: ["inline", "fullscreen"] },
          });
          if (initRes && initRes.hostCapabilities) {
            hostCapabilities = initRes.hostCapabilities;
          }
          if (initRes && initRes.hostContext) {
            applyHostContext(initRes.hostContext);
            activeToolName = initRes.hostContext?.toolInfo?.tool?.name || "";
            if (activeToolName.startsWith("invoices")) {
              activeTab = "invoices";
              renderTabs();
            }
          }
          sendRpcNotification("ui/notifications/initialized", {});
          setupAutoResize();
        } catch (err) {
          console.debug("Standalone / non-host preview mode:", err);
        }
      }

      function setupAutoResize() {
        if (typeof ResizeObserver === "undefined") return;
        let scheduled = false;
        const notify = () => {
          if (scheduled) return;
          scheduled = true;
          requestAnimationFrame(() => {
            scheduled = false;
            const height = Math.max(480, Math.ceil(document.body.scrollHeight));
            const width = Math.ceil(window.innerWidth);
            sendRpcNotification("ui/notifications/size-changed", { width, height });
          });
        };
        const observer = new ResizeObserver(notify);
        observer.observe(document.body);
      }

      // -----------------------------------------------------------------------
      // wFirma Response Parsing
      // -----------------------------------------------------------------------
      function extractModuleRecords(moduleObj, expectedSingular) {
        if (!moduleObj || typeof moduleObj !== "object") return { records: [], rawById: {}, page: 1, limit: 20, total: 0 };
        const records = [];
        const rawById = {};
        for (const key of Object.keys(moduleObj)) {
          if (key === "parameters") continue;
          const wrapper = moduleObj[key];
          if (!wrapper || typeof wrapper !== "object") continue;
          const innerKey = expectedSingular && wrapper[expectedSingular]
            ? expectedSingular
            : Object.keys(wrapper).find((k) => wrapper[k] && typeof wrapper[k] === "object");
          if (!innerKey) continue;
          const raw = wrapper[innerKey];
          const normalized = normalizeRecord(innerKey, raw);
          records.push(normalized);
          if (normalized.id) rawById[String(normalized.id)] = raw;
        }
        const params = moduleObj.parameters || {};
        const page = parseInt(params.page, 10) || 1;
        const limit = parseInt(params.limit, 10) || 20;
        const total = parseInt(params.total, 10) || records.length;
        return { records, rawById, page, limit, total };
      }

      function normalizeRecord(type, raw) {
        const contractorObj = raw.contractor_detail || raw.contractor || {};
        const contractorName =
          contractorObj.name ||
          contractorObj.altname ||
          raw.contractor_name ||
          (contractorObj.id ? "#" + contractorObj.id : "—");
        const contractorNip = contractorObj.nip || raw.nip || "";

        // Extract schema from expense_parts if present
        let schema = raw.schema || "";
        const parts = [];
        if (raw.expense_parts && typeof raw.expense_parts === "object") {
          for (const pk of Object.keys(raw.expense_parts)) {
            if (pk === "parameters") continue;
            const pWrap = raw.expense_parts[pk];
            const part = pWrap && (pWrap.expense_part || pWrap);
            if (part && typeof part === "object") {
              parts.push(part);
              if (!schema && part.schema) schema = part.schema;
            }
          }
        }

        const contents = [];
        if (raw.invoicecontents && typeof raw.invoicecontents === "object") {
          for (const ck of Object.keys(raw.invoicecontents)) {
            if (ck === "parameters") continue;
            const cWrap = raw.invoicecontents[ck];
            const item = cWrap && (cWrap.invoicecontent || cWrap);
            if (item && typeof item === "object") {
              contents.push(item);
            }
          }
        }

        const netto = parseFloat(raw.netto ?? raw.total_netto ?? 0) || 0;
        const brutto = parseFloat(raw.brutto ?? raw.total ?? 0) || 0;
        const vat = parseFloat(raw.tax ?? (brutto - netto)) || 0;
        const alreadypaid = parseFloat(raw.alreadypaid ?? 0) || 0;
        const remaining = parseFloat(raw.remaining ?? Math.max(0, brutto - alreadypaid)) || 0;

        return {
          _type: type,
          id: String(raw.id ?? ""),
          fullnumber: String(raw.fullnumber || raw.number || ("#" + (raw.id ?? ""))),
          date: String(raw.date || ""),
          SecondaryDate: String(type === "expense" ? (raw.taxregister_date || raw.vatregister_date || raw.reception_date || "") : (raw.paymentdate || raw.disposaldate || "")),
          contractor: String(contractorName),
          nip: String(contractorNip),
          description: String(raw.description || SCHEMA_LABELS[schema] || schema || raw.type || ""),
          schema: String(schema),
          type: String(raw.type || ""),
          netto,
          brutto,
          vat,
          alreadypaid,
          remaining,
          currency: String(raw.currency || "PLN"),
          paymentstate: String(raw.paymentstate || "unpaid"),
          payment_method: String(raw.payment_method || raw.paymentmethod || ""),
          register_tax_book: String(raw.register_tax_book ?? ""),
          register_vat_book: String(raw.register_vat_book ?? ""),
          parts,
          contents,
        };
      }

      function updateCompanyBadge(companiesObj) {
        if (!companiesObj || typeof companiesObj !== "object") return;
        for (const k of Object.keys(companiesObj)) {
          if (k === "parameters") continue;
          const c = companiesObj[k]?.company || companiesObj[k];
          if (c && (c.name || c.nip)) {
            const label = c.name + (c.nip ? " (NIP: " + c.nip + ")" : "");
            document.getElementById("company-name").textContent = label;
            return;
          }
        }
      }

      function handleIncomingToolResult(result, options) {
        const mergeSingle = Boolean(options && options.mergeSingle);
        setBanner(null);
        if (!result) return;
        let payload = result.structuredContent || null;
        if (!payload && Array.isArray(result.content)) {
          const textBlock = result.content.find((c) => c.type === "text" && c.text);
          if (textBlock) {
            try {
              payload = JSON.parse(textBlock.text);
            } catch {
              // ignore non-json
            }
          }
        }
        if (!payload || typeof payload !== "object") return;

        // Combined dashboard payload from finance_dashboard tool
        if (payload.dashboard) {
          const d = payload.dashboard;
          if (d.company?.companies) updateCompanyBadge(d.company.companies);
          if (d.expenses?.expenses) {
            stateByTab.expenses = {
              ...stateByTab.expenses,
              ...extractModuleRecords(d.expenses.expenses, "expense"),
            };
          }
          if (d.invoices?.invoices) {
            stateByTab.invoices = {
              ...stateByTab.invoices,
              ...extractModuleRecords(d.invoices.invoices, "invoice"),
            };
          }
          if (d.tab === "invoices" || d.tab === "expenses") {
            activeTab = d.tab;
          }
          renderAll();
          return;
        }

        if (payload.companies) {
          updateCompanyBadge(payload.companies);
        }

        if (payload.expenses) {
          const extracted = extractModuleRecords(payload.expenses, "expense");
          const isSingleGet =
            extracted.records.length === 1 &&
            stateByTab.expenses.records.length > 0 &&
            (mergeSingle || !payload.expenses.parameters?.total);
          if (isSingleGet) {
            const rec = extracted.records[0];
            stateByTab.expenses.rawById[rec.id] = extracted.rawById[rec.id];
            const idx = stateByTab.expenses.records.findIndex((r) => r.id === rec.id);
            if (idx >= 0) stateByTab.expenses.records[idx] = rec;
            else stateByTab.expenses.records.unshift(rec);
            activeTab = "expenses";
            renderAll();
            openDrawer(rec);
            return;
          }
          stateByTab.expenses = { ...stateByTab.expenses, ...extracted };
          activeTab = "expenses";
          renderAll();
          if (extracted.records.length === 1) openDrawer(extracted.records[0]);
          return;
        }

        if (payload.invoices) {
          const extracted = extractModuleRecords(payload.invoices, "invoice");
          const isSingleGet =
            extracted.records.length === 1 &&
            stateByTab.invoices.records.length > 0 &&
            (mergeSingle || !payload.invoices.parameters?.total);
          if (isSingleGet) {
            const rec = extracted.records[0];
            stateByTab.invoices.rawById[rec.id] = extracted.rawById[rec.id];
            const idx = stateByTab.invoices.records.findIndex((r) => r.id === rec.id);
            if (idx >= 0) stateByTab.invoices.records[idx] = rec;
            else stateByTab.invoices.records.unshift(rec);
            activeTab = "invoices";
            renderAll();
            openDrawer(rec);
            return;
          }
          stateByTab.invoices = { ...stateByTab.invoices, ...extracted };
          activeTab = "invoices";
          renderAll();
          if (extracted.records.length === 1) openDrawer(extracted.records[0]);
        }
      }

      // -----------------------------------------------------------------------
      // Server Tool Calls from UI
      // -----------------------------------------------------------------------
      function setBanner(type, text) {
        const banner = document.getElementById("status-banner");
        if (!type) {
          banner.className = "status-banner";
          banner.innerHTML = "";
          return;
        }
        if (type === "loading") {
          banner.className = "status-banner loading";
          banner.innerHTML = '<div class="spinner"></div><span>' + escHtml(text || t("loading")) + "</span>";
        } else {
          banner.className = "status-banner error";
          banner.textContent = text;
        }
      }

      async function fetchTabPage(tab, page, conditionsOverride) {
        const st = stateByTab[tab];
        const conditions = conditionsOverride !== undefined ? conditionsOverride : st.conditions;
        st.conditions = conditions;
        st.page = page || 1;
        const toolName = tab === "expenses" ? "expenses_find" : "invoices_find";
        setBanner("loading", t("loading"));
        try {
          const res = await sendRpcRequest("tools/call", {
            name: toolName,
            arguments: {
              conditions: conditions && conditions.length ? conditions : undefined,
              limit: st.limit,
              page: st.page,
            },
          });
          handleIncomingToolResult(res);
        } catch (err) {
          setBanner("error", err.message || String(err));
        }
      }

      async function fetchDocumentDetails(tab, id) {
        const numId = Number(id);
        if (!Number.isFinite(numId)) return;
        const toolName = tab === "expenses" ? "expenses_get" : "invoices_get";
        setBanner("loading", t("loading"));
        try {
          const res = await sendRpcRequest("tools/call", {
            name: toolName,
            arguments: { id: numId },
          });
          handleIncomingToolResult(res, { mergeSingle: true });
        } catch (err) {
          setBanner("error", err.message || String(err));
        }
      }

      // -----------------------------------------------------------------------
      // Filtering & Rendering
      // -----------------------------------------------------------------------
      function getPresetsForTab(tab) {
        const thisMonth = getMonthRange(0);
        const prevMonth = getMonthRange(-1);
        if (tab === "expenses") {
          return [
            { id: "all", label: t("presetAll"), conditions: [] },
            {
              id: "jpk_only",
              label: "🔴 " + t("presetJpkOnly"),
              conditions: [
                { field: "register_vat_book", operator: "eq", value: "1" },
                { field: "register_tax_book", operator: "eq", value: "0" },
              ],
            },
            {
              id: "kpir_vat",
              label: "🟢 " + t("presetKpirVat"),
              conditions: [
                { field: "register_tax_book", operator: "eq", value: "1" },
                { field: "register_vat_book", operator: "eq", value: "1" },
              ],
            },
            {
              id: "unpaid",
              label: "🟡 " + t("presetUnpaid"),
              conditions: [{ field: "paymentstate", operator: "eq", value: "unpaid" }],
            },
            {
              id: "this_month",
              label: "📅 " + t("presetThisMonth"),
              conditions: [
                { field: "date", operator: "ge", value: thisMonth.start },
                { field: "date", operator: "le", value: thisMonth.end },
              ],
            },
            {
              id: "prev_month",
              label: "📅 " + t("presetPrevMonth"),
              conditions: [
                { field: "date", operator: "ge", value: prevMonth.start },
                { field: "date", operator: "le", value: prevMonth.end },
              ],
            },
          ];
        }
        return [
          { id: "all", label: t("presetAll"), conditions: [] },
          {
            id: "normal",
            label: "📄 " + t("presetNormal"),
            conditions: [{ field: "type", operator: "eq", value: "normal" }],
          },
          {
            id: "proforma",
            label: "📋 " + t("presetProforma"),
            conditions: [{ field: "type", operator: "eq", value: "proforma" }],
          },
          {
            id: "unpaid",
            label: "🟡 " + t("presetUnpaid"),
            conditions: [{ field: "paymentstate", operator: "eq", value: "unpaid" }],
          },
          {
            id: "this_month",
            label: "📅 " + t("presetThisMonth"),
            conditions: [
              { field: "date", operator: "ge", value: thisMonth.start },
              { field: "date", operator: "le", value: thisMonth.end },
            ],
          },
          {
            id: "prev_month",
            label: "📅 " + t("presetPrevMonth"),
            conditions: [
              { field: "date", operator: "ge", value: prevMonth.start },
              { field: "date", operator: "le", value: prevMonth.end },
            ],
          },
        ];
      }

      function getFilteredRecords() {
        const st = stateByTab[activeTab];
        let list = st.records.slice();
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          list = list.filter(
            (r) =>
              r.fullnumber.toLowerCase().includes(q) ||
              r.contractor.toLowerCase().includes(q) ||
              r.nip.toLowerCase().includes(q) ||
              r.description.toLowerCase().includes(q)
          );
        }
        list.sort((a, b) => {
          const va = a[sortCol] ?? "";
          const vb = b[sortCol] ?? "";
          if (typeof va === "number" && typeof vb === "number") {
            return sortAsc ? va - vb : vb - va;
          }
          return sortAsc
            ? String(va).localeCompare(String(vb))
            : String(vb).localeCompare(String(va));
        });
        return list;
      }

      function renderTabs() {
        document.getElementById("tab-expenses").textContent = t("tabExpenses");
        document.getElementById("tab-invoices").textContent = t("tabInvoices");
        document.getElementById("tab-expenses").classList.toggle("active", activeTab === "expenses");
        document.getElementById("tab-invoices").classList.toggle("active", activeTab === "invoices");
        document.getElementById("search-input").placeholder = t("searchPlaceholder");
        document.getElementById("btn-lang").textContent = lang.toUpperCase();
      }

      function renderPresets() {
        const container = document.getElementById("preset-pills");
        const presets = getPresetsForTab(activeTab);
        container.innerHTML = presets
          .map(
            (p) =>
              '<button type="button" class="pill ' +
              (activePreset === p.id ? "active" : "") +
              '" data-preset="' +
              escHtml(p.id) +
              '">' +
              escHtml(p.label) +
              "</button>"
          )
          .join("");

        container.querySelectorAll(".pill").forEach((btn) => {
          btn.addEventListener("click", () => {
            const presetId = btn.getAttribute("data-preset");
            const found = presets.find((p) => p.id === presetId);
            if (!found) return;
            activePreset = presetId;
            renderPresets();
            fetchTabPage(activeTab, 1, found.conditions);
          });
        });
      }

      function formatCurrencyBreakdown(records, valueFn) {
        if (!records.length) return formatMoney(0, "PLN");
        const byCurrency = {};
        for (const rec of records) {
          const cur = (rec.currency || "PLN").toUpperCase();
          byCurrency[cur] = (byCurrency[cur] || 0) + (Number(valueFn(rec)) || 0);
        }
        const entries = Object.entries(byCurrency);
        if (entries.length === 0) return formatMoney(0, "PLN");
        return entries.map(([cur, sum]) => formatMoney(sum, cur)).join(" + ");
      }

      function renderKpis(filtered) {
        const st = stateByTab[activeTab];
        const unpaidList = filtered.filter((r) => r.paymentstate === "unpaid");
        const unpaidCount = unpaidList.length;

        document.getElementById("kpi-count-label").textContent = t("kpiDocs");
        document.getElementById("kpi-count-val").textContent =
          filtered.length + (st.total ? " / " + st.total : "");
        document.getElementById("kpi-count-sub").textContent = t("kpiInView");

        document.getElementById("kpi-netto-label").textContent = t("kpiNetto");
        document.getElementById("kpi-netto-val").textContent = formatCurrencyBreakdown(filtered, (r) => r.netto);
        document.getElementById("kpi-netto-sub").textContent = t("kpiPageSum");

        document.getElementById("kpi-brutto-label").textContent = t("kpiBrutto");
        document.getElementById("kpi-brutto-val").textContent = formatCurrencyBreakdown(filtered, (r) => r.brutto);
        document.getElementById("kpi-brutto-sub").textContent =
          "VAT: " + formatCurrencyBreakdown(filtered, (r) => r.brutto - r.netto);

        const unpaidFormatted = unpaidCount
          ? formatCurrencyBreakdown(unpaidList, (r) => r.remaining || r.brutto)
          : formatMoney(0, "PLN");

        if (activeTab === "expenses") {
          const jpkOnlyCount = filtered.filter(
            (r) => r.register_vat_book === "1" && r.register_tax_book === "0"
          ).length;
          document.getElementById("kpi-diag-label").textContent = t("kpiJpkDiag");
          document.getElementById("kpi-diag-val").textContent = String(jpkOnlyCount);
          document.getElementById("kpi-diag-sub").textContent =
            t("unpaid") + ": " + unpaidCount + " (" + unpaidFormatted + ")";
        } else {
          document.getElementById("kpi-diag-label").textContent = t("kpiUnpaidDiag");
          document.getElementById("kpi-diag-val").textContent = String(unpaidCount);
          document.getElementById("kpi-diag-sub").textContent = unpaidFormatted;
        }
      }

      function renderRegisterBadges(rec) {
        if (activeTab !== "expenses") {
          return '<span class="badge badge-kpir">' + escHtml(rec.type || "normal") + "</span>";
        }
        const kpir = rec.register_tax_book === "1";
        const vat = rec.register_vat_book === "1";
        if (!kpir && vat) {
          return '<span class="badge badge-jpk-only">' + escHtml(t("jpkOnly")) + "</span>";
        }
        if (kpir && vat) {
          return '<span class="badge badge-kpir">' + escHtml(t("kpirAndVat")) + "</span>";
        }
        if (kpir && !vat) {
          return '<span class="badge badge-kpir">' + escHtml(t("kpirOnly")) + "</span>";
        }
        return '<span class="badge">' + escHtml(t("unbooked")) + "</span>";
      }

      function renderPaymentBadge(state) {
        if (state === "paid") {
          return '<span class="badge badge-paid">' + escHtml(t("paid")) + "</span>";
        }
        if (state === "partial") {
          return '<span class="badge badge-partial">' + escHtml(t("partial")) + "</span>";
        }
        return '<span class="badge badge-unpaid">' + escHtml(t("unpaid")) + "</span>";
      }

      function renderTable(filtered) {
        const container = document.getElementById("table-container");
        if (!filtered.length) {
          container.innerHTML = '<div class="empty-state">' + escHtml(t("emptyWaiting")) + "</div>";
          return;
        }

        const columns = [
          { key: "fullnumber", label: t("colNumber") },
          { key: "date", label: t("colDate") },
          { key: "SecondaryDate", label: t("colKpirDate") },
          { key: "contractor", label: t("colContractor") },
          { key: "description", label: t("colDescription") },
          { key: "netto", label: t("colNetto"), right: true },
          { key: "brutto", label: t("colBrutto"), right: true },
          { key: "register_vat_book", label: t("colRegisters") },
          { key: "paymentstate", label: t("colStatus") },
        ];

        let html = "<table><thead><tr>";
        for (const col of columns) {
          const arrow = sortCol === col.key ? (sortAsc ? " &#9650;" : " &#9660;") : "";
          html +=
            '<th data-col="' +
            escHtml(col.key) +
            '" style="' +
            (col.right ? "text-align:right" : "") +
            '">' +
            escHtml(col.label) +
            arrow +
            "</th>";
        }
        html += "</tr></thead><tbody>";

        for (const rec of filtered) {
          const isSelected = selectedRecordId === rec.id;
          html +=
            '<tr data-id="' +
            escHtml(rec.id) +
            '" class="' +
            (isSelected ? "selected" : "") +
            '">' +
            '<td class="cell-mono"><strong>' +
            escHtml(rec.fullnumber) +
            "</strong></td>" +
            '<td class="cell-mono">' +
            escHtml(rec.date) +
            "</td>" +
            '<td class="cell-mono">' +
            escHtml(rec.SecondaryDate || "—") +
            "</td>" +
            '<td class="cell-truncate" title="' +
            escHtml(rec.contractor + (rec.nip ? " (NIP: " + rec.nip + ")" : "")) +
            '">' +
            escHtml(rec.contractor) +
            (rec.nip ? ' <span style="color:var(--text-muted);font-size:11px">(' + escHtml(rec.nip) + ")</span>" : "") +
            "</td>" +
            '<td class="cell-truncate" title="' +
            escHtml(rec.description) +
            '">' +
            escHtml(rec.description || "—") +
            "</td>" +
            '<td class="cell-right">' +
            formatMoney(rec.netto, rec.currency) +
            "</td>" +
            '<td class="cell-right"><strong>' +
            formatMoney(rec.brutto, rec.currency) +
            "</strong></td>" +
            "<td>" +
            renderRegisterBadges(rec) +
            "</td>" +
            "<td>" +
            renderPaymentBadge(rec.paymentstate) +
            "</td>" +
            "</tr>";
        }
        html += "</tbody></table>";
        container.innerHTML = html;

        container.querySelectorAll("th[data-col]").forEach((th) => {
          th.addEventListener("click", () => {
            const col = th.getAttribute("data-col");
            if (sortCol === col) sortAsc = !sortAsc;
            else {
              sortCol = col;
              sortAsc = true;
            }
            renderAll();
          });
        });

        container.querySelectorAll("tbody tr[data-id]").forEach((tr) => {
          tr.addEventListener("click", () => {
            const id = tr.getAttribute("data-id");
            const rec = stateByTab[activeTab].records.find((r) => r.id === id);
            if (!rec) return;
            selectedRecordId = id;
            renderTable(filtered);
            openDrawer(rec);
            // Fetch full details if parts/contents are not yet populated
            if (activeTab === "expenses" && (!rec.parts || rec.parts.length === 0)) {
              fetchDocumentDetails("expenses", id);
            } else if (activeTab === "invoices" && (!rec.contents || rec.contents.length === 0)) {
              fetchDocumentDetails("invoices", id);
            }
          });
        });
      }

      function renderFooter() {
        const st = stateByTab[activeTab];
        const totalPages = Math.max(1, Math.ceil((st.total || st.records.length || 1) / (st.limit || 20)));
        document.getElementById("page-indicator").textContent =
          t("page") + " " + st.page + " / " + totalPages;
        document.getElementById("btn-prev").disabled = st.page <= 1;
        document.getElementById("btn-next").disabled = st.page >= totalPages;
        document.getElementById("btn-prev").innerHTML = "&#9664; " + escHtml(t("prev"));
        document.getElementById("btn-next").innerHTML = escHtml(t("next")) + " &#9654;";
        document.getElementById("footer-info").textContent =
          "ID: wFirma " + activeTab.toUpperCase() + " • Limit: " + st.limit;
      }

      function renderAll() {
        renderTabs();
        renderPresets();
        const filtered = getFilteredRecords();
        renderKpis(filtered);
        renderTable(filtered);
        renderFooter();
      }

      // -----------------------------------------------------------------------
      // Slide-over Detail Drawer
      // -----------------------------------------------------------------------
      function openDrawer(rec) {
        const drawer = document.getElementById("detail-drawer");
        const backdrop = document.getElementById("drawer-backdrop");
        const raw = stateByTab[activeTab].rawById[rec.id] || rec;

        document.getElementById("drawer-title").textContent = rec.fullnumber;
        document.getElementById("drawer-subtitle").textContent =
          (rec._type === "expense" ? "Wydatek / Koszt" : "Faktura sprzedaży") + " • ID #" + rec.id;

        const itemsHtml =
          rec._type === "expense"
            ? renderExpensePartsSection(rec.parts)
            : renderInvoiceContentsSection(rec.contents);

        const body = document.getElementById("drawer-body");
        body.innerHTML =
          '<div class="detail-section">' +
          '<div class="detail-section-title">' + escHtml(t("drawerDetails")) + "</div>" +
          '<div class="detail-grid">' +
          '<div><div class="detail-item-label">' + escHtml(t("colDate")) + '</div><div class="detail-item-val">' + escHtml(rec.date || "—") + "</div></div>" +
          '<div><div class="detail-item-label">' + escHtml(t("colKpirDate")) + '</div><div class="detail-item-val">' + escHtml(rec.SecondaryDate || "—") + "</div></div>" +
          '<div><div class="detail-item-label">' + escHtml(t("colNetto")) + '</div><div class="detail-item-val">' + formatMoney(rec.netto, rec.currency) + "</div></div>" +
          '<div><div class="detail-item-label">' + escHtml(t("colBrutto")) + '</div><div class="detail-item-val"><strong>' + formatMoney(rec.brutto, rec.currency) + "</strong></div></div>" +
          '<div><div class="detail-item-label">' + escHtml(t("colRegisters")) + '</div><div class="detail-item-val">' + renderRegisterBadges(rec) + "</div></div>" +
          '<div><div class="detail-item-label">' + escHtml(t("colStatus")) + '</div><div class="detail-item-val">' + renderPaymentBadge(rec.paymentstate) + "</div></div>" +
          "</div>" +
          "</div>" +
          '<div class="detail-section">' +
          '<div class="detail-section-title">' + escHtml(t("drawerContractor")) + "</div>" +
          '<div class="detail-item-val"><strong>' + escHtml(rec.contractor) + "</strong></div>" +
          (rec.nip ? '<div class="detail-item-label" style="margin-top:4px">NIP: ' + escHtml(rec.nip) + "</div>" : "") +
          (rec.description ? '<div class="detail-item-label" style="margin-top:6px">' + escHtml(rec.description) + "</div>" : "") +
          "</div>" +
          itemsHtml +
          '<div class="detail-section">' +
          '<div class="detail-section-title">' + escHtml(t("drawerAiActions")) + "</div>" +
          '<div class="ai-actions">' +
          '<button type="button" class="btn btn-primary" data-ai="explain">🔍 ' + escHtml(t("askExplainBooking")) + "</button>" +
          (rec.paymentstate !== "paid"
            ? '<button type="button" class="btn" data-ai="reminder">✉️ ' + escHtml(t("askPaymentReminder")) + "</button>"
            : "") +
          '<button type="button" class="btn" data-ai="analyze">📊 ' + escHtml(t("askAnalyzeDoc")) + "</button>" +
          "</div>" +
          "</div>" +
          '<div class="detail-section">' +
          '<div class="detail-section-title">' + escHtml(t("drawerRawJson")) + "</div>" +
          '<pre class="raw-json">' + escHtml(JSON.stringify(raw, null, 2)) + "</pre>" +
          "</div>";

        body.querySelectorAll("button[data-ai]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const action = btn.getAttribute("data-ai");
            sendDocActionToClaude(action, rec);
          });
        });

        backdrop.classList.add("open");
        drawer.classList.add("open");
      }

      function renderExpensePartsSection(parts) {
        if (!parts || !parts.length) return "";
        let rows = "";
        for (const p of parts) {
          const schemaLabel = SCHEMA_LABELS[p.schema] || p.schema || "—";
          rows +=
            "<tr>" +
            "<td>" + escHtml(schemaLabel) + "</td>" +
            '<td class="cell-right">' + formatMoney(p.netto, "") + "</td>" +
            '<td class="cell-right">' + formatMoney(p.tax, "") + "</td>" +
            '<td class="cell-right"><strong>' + formatMoney(p.brutto, "") + "</strong></td>" +
            "</tr>";
        }
        return (
          '<div class="detail-section">' +
          '<div class="detail-section-title">' + escHtml(t("drawerParts")) + " (" + parts.length + ")</div>" +
          "<table><thead><tr><th>Schemat KPiR</th><th style='text-align:right'>Netto</th><th style='text-align:right'>VAT</th><th style='text-align:right'>Brutto</th></tr></thead><tbody>" +
          rows +
          "</tbody></table></div>"
        );
      }

      function renderInvoiceContentsSection(contents) {
        if (!contents || !contents.length) return "";
        let rows = "";
        for (const c of contents) {
          rows +=
            "<tr>" +
            "<td>" + escHtml(c.name || "—") + "</td>" +
            '<td class="cell-right">' + escHtml(c.count || "1") + " " + escHtml(c.unit || "") + "</td>" +
            '<td class="cell-right">' + formatMoney(c.netto, "") + "</td>" +
            '<td class="cell-right"><strong>' + formatMoney(c.brutto, "") + "</strong></td>" +
            "</tr>";
        }
        return (
          '<div class="detail-section">' +
          '<div class="detail-section-title">' + escHtml(t("drawerParts")) + " (" + contents.length + ")</div>" +
          "<table><thead><tr><th>Pozycja</th><th style='text-align:right'>Ilość</th><th style='text-align:right'>Netto</th><th style='text-align:right'>Brutto</th></tr></thead><tbody>" +
          rows +
          "</tbody></table></div>"
        );
      }

      function closeDrawer() {
        document.getElementById("drawer-backdrop").classList.remove("open");
        document.getElementById("detail-drawer").classList.remove("open");
      }

      async function sendDocActionToClaude(action, rec) {
        let prompt = "";
        if (action === "explain") {
          prompt =
            "Wyjaśnij sposób zaksięgowania dokumentu " +
            rec.fullnumber +
            " (ID: " +
            rec.id +
            ", kontrahent: " +
            rec.contractor +
            ", kwota brutto: " +
            rec.brutto +
            " " +
            rec.currency +
            ", KPiR=" +
            rec.register_tax_book +
            ", VAT/JPK=" +
            rec.register_vat_book +
            ", schemat=" +
            (rec.schema || "brak") +
            ").";
        } else if (action === "reminder") {
          prompt =
            "Przygotuj uprzejme przypomnienie o płatności dla kontrahenta " +
            rec.contractor +
            " dotyczące dokumentu " +
            rec.fullnumber +
            " z dnia " +
            rec.date +
            " na kwotę " +
            rec.brutto +
            " " +
            rec.currency +
            ".";
        } else {
          prompt =
            "Przeanalizuj szczegóły dokumentu " +
            rec.fullnumber +
            " (ID: " +
            rec.id +
            ") w wFirma.";
        }

        try {
          await sendRpcRequest("ui/message", {
            role: "user",
            content: [{ type: "text", text: prompt }],
          });
        } catch (err) {
          console.error("Failed to send message to host:", err);
        }
      }

      // -----------------------------------------------------------------------
      // Export CSV / XLS (MCP Apps ui/download-file + browser fallback)
      // -----------------------------------------------------------------------
      async function triggerDownload(content, filename, mimeType) {
        if (hostCapabilities && hostCapabilities.downloadFile) {
          try {
            const res = await sendRpcRequest("ui/download-file", {
              contents: [
                {
                  type: "resource",
                  resource: {
                    uri: "file:///" + filename,
                    mimeType,
                    text: content,
                  },
                },
              ],
            });
            if (!res || !res.isError) return;
          } catch (err) {
            console.debug("ui/download-file failed, falling back to Blob download:", err);
          }
        }
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }

      function exportCsv() {
        const rows = getFilteredRecords();
        if (!rows.length) return;
        const headers = ["id", "fullnumber", "date", "SecondaryDate", "contractor", "nip", "description", "netto", "brutto", "currency", "paymentstate", "register_tax_book", "register_vat_book"];
        const esc = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
        const csv = [
          headers.join(","),
          ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
        ].join("\\n");
        triggerDownload("\\uFEFF" + csv, "wfirma_" + activeTab + ".csv", "text/csv;charset=utf-8");
      }

      function exportXls() {
        const rows = getFilteredRecords();
        if (!rows.length) return;
        const headers = ["ID", "Numer", "Data", "Termin/KPiR", "Kontrahent", "NIP", "Opis", "Netto", "Brutto", "Waluta", "Status"];
        let table = "<table><tr>" + headers.map((h) => "<th>" + escHtml(h) + "</th>").join("") + "</tr>";
        for (const r of rows) {
          table +=
            "<tr>" +
            [r.id, r.fullnumber, r.date, r.SecondaryDate, r.contractor, r.nip, r.description, r.netto, r.brutto, r.currency, r.paymentstate]
              .map((v) => "<td>" + escHtml(v) + "</td>")
              .join("") +
            "</tr>";
        }
        table += "</table>";
        const html =
          '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body>' +
          table +
          "</body></html>";
        triggerDownload(html, "wfirma_" + activeTab + ".xls", "application/vnd.ms-excel");
      }

      // -----------------------------------------------------------------------
      // Event Listeners
      // -----------------------------------------------------------------------
      document.getElementById("tab-expenses").addEventListener("click", () => {
        activeTab = "expenses";
        activePreset = "all";
        renderAll();
        if (stateByTab.expenses.records.length === 0) {
          fetchTabPage("expenses", 1, []);
        }
      });

      document.getElementById("tab-invoices").addEventListener("click", () => {
        activeTab = "invoices";
        activePreset = "all";
        renderAll();
        if (stateByTab.invoices.records.length === 0) {
          fetchTabPage("invoices", 1, []);
        }
      });

      document.getElementById("search-input").addEventListener("input", (e) => {
        searchQuery = e.target.value || "";
        renderAll();
      });

      document.getElementById("btn-refresh").addEventListener("click", () => {
        fetchTabPage(activeTab, stateByTab[activeTab].page);
      });

      document.getElementById("btn-prev").addEventListener("click", () => {
        const st = stateByTab[activeTab];
        if (st.page > 1) fetchTabPage(activeTab, st.page - 1);
      });

      document.getElementById("btn-next").addEventListener("click", () => {
        const st = stateByTab[activeTab];
        fetchTabPage(activeTab, st.page + 1);
      });

      document.getElementById("btn-lang").addEventListener("click", () => {
        lang = lang === "pl" ? "en" : "pl";
        renderAll();
      });

      document.getElementById("btn-fullscreen").addEventListener("click", async () => {
        const nextMode = displayMode === "fullscreen" ? "inline" : "fullscreen";
        try {
          const res = await sendRpcRequest("ui/request-display-mode", { mode: nextMode });
          if (res && res.mode) displayMode = res.mode;
        } catch (err) {
          console.debug("Display mode switch unsupported:", err);
        }
      });

      document.getElementById("btn-export-csv").addEventListener("click", exportCsv);
      document.getElementById("btn-export-xls").addEventListener("click", exportXls);
      document.getElementById("btn-close-drawer").addEventListener("click", closeDrawer);
      document.getElementById("drawer-backdrop").addEventListener("click", closeDrawer);

      // Initial render & MCP handshake
      renderAll();
      initMcpApp();
    })();
  </script>
</body>
</html>`;
}
