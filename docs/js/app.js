import { db }                          from "./firebase.js";
import { renderPropertiesTable }       from "./properties.js";
import { renderMembersTable }          from "./members.js";
import { renderRegistrationsTable }    from "./registrations.js";
import { renderMemberLookup }          from "./member-lookup.js";
import { renderGlobalSearch }          from "./global-search.js";
import { initAuth }                    from "./auth.js";
import { collection, onSnapshot, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── State ─────────────────────────────────────────────────────
let allProperties    = [];
let allMembers       = [];
let allRegistrations = [];
let allBuyForm       = [];
let allSellForm      = [];

// ── KPIs ──────────────────────────────────────────────────────
function renderKPIs() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("kpi-total",   allBuyForm.length + allSellForm.length);
  set("kpi-hot",     allBuyForm.length);
  set("kpi-props",   allProperties.length);
  set("kpi-members", allMembers.length);
  set("kpi-budget",  allRegistrations.length);
  // Overview cards
  set("overview-buy",     allBuyForm.length);
  set("overview-sell",    allSellForm.length);
  set("overview-members", allMembers.length);
  set("overview-props",   allProperties.length);
  set("overview-regs",    allRegistrations.length);
}

// ── Data helpers ──────────────────────────────────────────────
function getLookupData() {
  return {
    members:       allMembers,
    registrations: allRegistrations,
    buyInterests:  allBuyForm,
    sellInterests: allSellForm,
  };
}

function getSearchData() {
  return {
    buyInterests:  allBuyForm,
    sellInterests: allSellForm,
    properties:    allProperties,
    members:       allMembers,
    registrations: allRegistrations,
  };
}

// ── Nav ───────────────────────────────────────────────────────
function setView(viewName) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  const el = document.getElementById("view-" + viewName);
  if (el) el.style.display = "block";
  if (viewName === "buy")           renderBuyFormTable(allBuyForm);
  if (viewName === "sell")          renderSellFormTable(allSellForm);
  if (viewName === "properties")    renderPropertiesTable(allProperties);
  if (viewName === "members")       renderMembersTable(allMembers);
  if (viewName === "registrations") renderRegistrationsTable(allRegistrations);
  if (viewName === "lookup")        renderMemberLookup(getLookupData());
  if (viewName === "global-search") renderGlobalSearch(getSearchData());
}

// ── Simple table renderers for Buy-Form and Sell-Form ─────────
function renderBuyFormTable(items) {
  const search = (document.getElementById("buy-search")?.value || "").toLowerCase();
  const filtered = items.filter(m => !search || JSON.stringify(m).toLowerCase().includes(search));
  const container = document.getElementById("buy-container");
  if (!container) return;
  if (!filtered.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#4a5568">${search ? "No results." : "No Buy Form submissions yet."}</div>`;
    const c = document.getElementById("buy-count"); if (c) c.textContent = "";
    return;
  }
  container.innerHTML = renderFormTable(filtered, "buy");
  const c = document.getElementById("buy-count"); if (c) c.textContent = `${filtered.length} submission${filtered.length !== 1 ? "s" : ""}`;
}

function renderSellFormTable(items) {
  const search = (document.getElementById("sell-search")?.value || "").toLowerCase();
  const filtered = items.filter(m => !search || JSON.stringify(m).toLowerCase().includes(search));
  const container = document.getElementById("sell-container");
  if (!container) return;
  if (!filtered.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#4a5568">${search ? "No results." : "No Sell Form submissions yet."}</div>`;
    const c = document.getElementById("sell-count"); if (c) c.textContent = "";
    return;
  }
  container.innerHTML = renderFormTable(filtered, "sell");
  const c = document.getElementById("sell-count"); if (c) c.textContent = `${filtered.length} submission${filtered.length !== 1 ? "s" : ""}`;
}

function renderFormTable(items, type) {
  const color = type === "buy" ? "#34d399" : "#f59e0b";
  const rows = items.map((m, i) => {
    const isMember = m.submittedAsMember;
    const date     = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString("en-GB") : "—";
    return `<tr style="cursor:default">
      <td><span style="font-size:11px;background:${color}22;color:${color};padding:2px 8px;border-radius:6px;font-weight:600">${type.toUpperCase()}</span></td>
      <td style="font-weight:500;color:#e2e8f0">${m.name || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.phone || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.location || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.building || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.category || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.propertyStatus || m.chosenOption || "—"}</td>
      <td>${isMember ? `<span style="font-size:10px;background:rgba(52,211,153,0.15);color:#34d399;padding:2px 8px;border-radius:4px;font-weight:600">MEMBER</span>` : `<span style="font-size:10px;color:#4a5568">Guest</span>`}</td>
      <td style="color:#4a5568;font-size:12px">${date}</td>
    </tr>`;
  }).join("");
  return `<table>
    <thead><tr>
      <th>Type</th><th>Name</th><th>Phone</th><th>Location</th>
      <th>Building</th><th>Category</th><th>Status</th><th>Member</th><th>Date</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ── Firebase listeners ────────────────────────────────────────
function startApp() {

  // Buy-Form ← new universal form collection
  const qBuy = query(collection(db, "Buy-Form"), orderBy("createdAt", "desc"));
  onSnapshot(qBuy, snap => {
    allBuyForm = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById("status-dot").style.background  = "#34d399";
    document.getElementById("status-text").textContent      = "Live · Firebase";
    document.getElementById("live-badge").textContent       = "🔴 Live · Firebase";
    document.getElementById("live-badge").style.color       = "#34d399";
    document.getElementById("live-badge").style.borderColor = "rgba(52,211,153,0.2)";
    document.getElementById("live-badge").style.background  = "rgba(52,211,153,0.1)";
    renderKPIs();
    renderBuyFormTable(allBuyForm);
  }, err => {
    document.getElementById("status-dot").style.background = "#ef4444";
    document.getElementById("status-text").textContent     = "Firebase error";
    document.getElementById("error-banner").style.display  = "block";
    document.getElementById("error-msg").textContent       = err.message;
    console.error("Buy-Form error:", err);
  });

  // Sell-Form ← new universal form collection
  const qSell = query(collection(db, "Sell-Form"), orderBy("createdAt", "desc"));
  onSnapshot(qSell, snap => {
    allSellForm = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKPIs();
    renderSellFormTable(allSellForm);
  }, err => console.error("Sell-Form error:", err));

  // MainPropertyForm
  const qProps = query(collection(db, "MainPropertyForm"), orderBy("createdAt", "desc"));
  onSnapshot(qProps, snap => {
    allProperties = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKPIs();
    renderPropertiesTable(allProperties);
  }, err => console.error("MainPropertyForm error:", err));

  // Members
  const qMembers = query(collection(db, "members"), orderBy("createdAt", "desc"));
  onSnapshot(qMembers, snap => {
    allMembers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKPIs();
    renderMembersTable(allMembers);
  }, err => console.error("members error:", err));

  // Registrations
  const qRegs = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
  onSnapshot(qRegs, snap => {
    allRegistrations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKPIs();
    renderRegistrationsTable(allRegistrations);
  }, err => console.error("registrations error:", err));

  // Nav buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.view === "logout") return;
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setView(btn.dataset.view);
    });
  });

  // Filters
  document.getElementById("buy-search")?.addEventListener("input",          () => renderBuyFormTable(allBuyForm));
  document.getElementById("sell-search")?.addEventListener("input",         () => renderSellFormTable(allSellForm));
  document.getElementById("props-search")?.addEventListener("input",        () => renderPropertiesTable(allProperties));
  document.getElementById("members-search")?.addEventListener("input",      () => renderMembersTable(allMembers));
  document.getElementById("regs-search")?.addEventListener("input",         () => renderRegistrationsTable(allRegistrations));
  document.getElementById("lookup-search")?.addEventListener("input",       () => renderMemberLookup(getLookupData()));
  document.getElementById("global-search-input")?.addEventListener("input", () => renderGlobalSearch(getSearchData()));

} // end startApp

// ── Boot ──────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  initAuth(startApp);
});
