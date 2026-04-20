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
// ── Expandable row sets ───────────────────────────────────────
const expandedBuy  = new Set();
const expandedSell = new Set();

function renderBuyFormTable(items) {
  const search   = (document.getElementById("buy-search")?.value || "").toLowerCase();
  const filtered = items.filter(m => !search || JSON.stringify(m).toLowerCase().includes(search));
  const container = document.getElementById("buy-container");
  if (!container) return;
  if (!filtered.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#4a5568">${search ? "No results." : "No Buy Form submissions yet."}</div>`;
    const c = document.getElementById("buy-count"); if (c) c.textContent = "";
    return;
  }
  container.innerHTML = renderFormTable(filtered, "buy", expandedBuy);
  const c = document.getElementById("buy-count");
  if (c) c.textContent = `${filtered.length} submission${filtered.length !== 1 ? "s" : ""}`;
  attachToggleListeners("buy", filtered, expandedBuy, () => renderBuyFormTable(items));
}

function renderSellFormTable(items) {
  const search   = (document.getElementById("sell-search")?.value || "").toLowerCase();
  const filtered = items.filter(m => !search || JSON.stringify(m).toLowerCase().includes(search));
  const container = document.getElementById("sell-container");
  if (!container) return;
  if (!filtered.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#4a5568">${search ? "No results." : "No Sell Form submissions yet."}</div>`;
    const c = document.getElementById("sell-count"); if (c) c.textContent = "";
    return;
  }
  container.innerHTML = renderFormTable(filtered, "sell", expandedSell);
  const c = document.getElementById("sell-count");
  if (c) c.textContent = `${filtered.length} submission${filtered.length !== 1 ? "s" : ""}`;
  attachToggleListeners("sell", filtered, expandedSell, () => renderSellFormTable(items));
}

function attachToggleListeners(type, items, expandedSet, rerender) {
  items.forEach(m => {
    const btn = document.getElementById(`toggle-${type}-${m.id}`);
    if (btn) btn.addEventListener("click", () => {
      if (expandedSet.has(m.id)) expandedSet.delete(m.id);
      else expandedSet.add(m.id);
      rerender();
    });
  });
}

function renderFormTable(items, type, expandedSet) {
  const color   = type === "buy" ? "#34d399" : "#f59e0b";
  const label   = type === "buy" ? "BUY" : "SELL";

  const rows = items.map(m => {
    const isExpanded = expandedSet.has(m.id);
    const isMember   = m.submittedAsMember;
    const date       = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString("en-GB") : "—";

    const summaryRow = `<tr style="cursor:pointer">
      <td>
        <button id="toggle-${type}-${m.id}" style="
          background:rgba(79,142,247,0.15);color:#4f8ef7;border:none;cursor:pointer;
          width:22px;height:22px;border-radius:50%;font-size:11px;font-weight:700;
          transition:transform 0.2s;transform:${isExpanded ? "rotate(90deg)" : "rotate(0deg)"}
        ">▶</button>
      </td>
      <td><span style="font-size:11px;background:${color}22;color:${color};padding:2px 8px;border-radius:6px;font-weight:600">${label}</span></td>
      <td style="font-weight:500;color:#e2e8f0">${m.name || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.phone || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.location || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.building || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.category || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.propertyStatus || m.chosenOption || "—"}</td>
      <td>${isMember ? `<span style="font-size:10px;background:rgba(52,211,153,0.15);color:#34d399;padding:2px 8px;border-radius:4px;font-weight:600">MEMBER</span>` : `<span style="font-size:10px;color:#4a5568">Guest</span>`}</td>
      <td style="color:#4a5568;font-size:12px">${date}</td>
    </tr>`;

    const detailRow = isExpanded ? `<tr>
      <td colspan="10" style="padding:0">
        <div style="background:rgba(15,17,23,0.6);border-left:3px solid ${color};padding:20px 28px">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px">
            ${detailSection("👤 Contact", [
              ["Name", m.name], ["Phone", m.phone], ["Email", m.email],
              ["Description", m.desc], ["Date", m.contactDate],
            ])}
            ${detailSection("🏠 Property", [
              ["Mode", m.mode], ["Property Type", m.propertyType],
              ["Category", m.category], ["Chosen Option", m.chosenOption],
              ["Tenure", m.tenure], ["Property Status", m.propertyStatus],
            ])}
            ${detailSection("📍 Location", [
              ["Location", m.location], ["Building", m.building],
              ["Developer", m.developer], ["Project", m.project],
            ])}
            ${detailSection("💰 Pricing", [
              ["Min Price", m.minPrice], ["Max Price", m.maxPrice],
              ["Min Size", m.minSize], ["Max Size", m.maxSize],
              ["Bedrooms", Array.isArray(m.bedrooms) ? m.bedrooms.join(", ") : m.bedrooms],
            ])}
            ${m.bulkDeal ? detailSection("🏗 Bulk Deal", [
              ["Bulk Deal Type", m.bulkDeal],
              ["Description", m.fullBuildingDesc || m.fullFloorDesc || m.labourCampDesc || m.mixUseDesc || m.hotelAptDesc],
              ["Date", m.fullBuildingDate || m.fullFloorDate || m.labourCampDate || m.mixUseDate || m.hotelAptDate],
              ["Channel", m.fullBuildingChannel || m.fullFloorChannel || m.labourCampChannel || m.mixUseChannel || m.hotelAptChannel],
            ]) : ""}
            ${isMember ? detailSection("🪪 Member Info", [
              ["Member Name", m.memberName], ["Member Phone", m.memberPhone],
              ["Roll No", m.memberRollNo],
            ]) : ""}
          </div>
        </div>
      </td>
    </tr>` : "";

    return summaryRow + detailRow;
  }).join("");

  return `<table>
    <thead><tr>
      <th></th><th>Type</th><th>Name</th><th>Phone</th><th>Location</th>
      <th>Building</th><th>Category</th><th>Status</th><th>Member</th><th>Date</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function detailSection(heading, fields) {
  const rows = fields
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([label, value]) => `
      <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
        <span style="font-size:12px;color:#4a5568">${label}</span>
        <span style="font-size:12px;color:#cbd5e1;text-align:right;max-width:60%">${value}</span>
      </div>`).join("");
  if (!rows) return "";
  return `<div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:8px;font-weight:600">${heading}</div>
    ${rows}
  </div>`;
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
