import { db }                                  from "./firebase.js";
import { getStatus, fmtPKR }                  from "./utils.js";
import { renderAreaChart, renderPieChart }    from "./charts.js";
import { renderRecentLeads, renderLeadsTable } from "./leads.js";
import { renderPropertiesTable }              from "./properties.js";
import { renderMembersTable }                from "./members.js";
import { renderSellTable }                   from "./sell-interests.js";
import { renderBuyTable }                    from "./buy-interests.js";
import { renderRentTable }                   from "./rent-interests.js";
import { renderOffplanTable }               from "./offplan-interests.js";
import { renderRegistrationsTable }          from "./registrations.js";
import { renderMemberLookup }               from "./member-lookup.js";

import { collection, onSnapshot, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


let allProperties   = [];
let allMembers      = [];
let allSell         = [];
let allBuy          = [];
let allRent         = [];
let allOffplan      = [];
let allRegistrations = [];

// ── KPIs ──────────────────────────────────────────────────────
function renderKPIs() {
  const totalInterests = allSell.length + allBuy.length + allRent.length + allOffplan.length;
  document.getElementById("kpi-total").textContent    = totalInterests;
  document.getElementById("kpi-hot").textContent      = allLeads.filter(l => ["Hot","New"].includes(getStatus(l))).length;
  const avg = allLeads.length
    ? Math.round(allLeads.reduce((s,l) => s+(Number(l.maxPrice)||0), 0) / allLeads.length)
    : 0;
  document.getElementById("kpi-budget").textContent   = avg ? fmtPKR(avg) : "—";
  document.getElementById("kpi-props").textContent    = allProperties.length;
  document.getElementById("kpi-members").textContent  = allMembers.length;
}

function getLookupData() {
  return {
    members:         allMembers,
    registrations:   allRegistrations,
    sellInterests:   allSell,
    buyInterests:    allBuy,
    rentInterests:   allRent,
    offplanInterests: allOffplan,
  };
}

// ── Nav ───────────────────────────────────────────────────────
function setView(viewName) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  const el = document.getElementById("view-" + viewName);
  if (el) el.style.display = "block";
  
  if (viewName === "properties")    renderPropertiesTable(allProperties);
  if (viewName === "members")       renderMembersTable(allMembers);
  if (viewName === "sell")          renderSellTable(allSell);
  if (viewName === "buy")           renderBuyTable(allBuy);
  if (viewName === "rent")          renderRentTable(allRent);
  if (viewName === "offplan")       renderOffplanTable(allOffplan);
  if (viewName === "registrations") renderRegistrationsTable(allRegistrations);
  if (viewName === "lookup")        renderMemberLookup(getLookupData());
}

// ── Firebase listeners ────────────────────────────────────────
function startApp() {

  // Old interests (legacy)
  const qLeads = query(collection(db, "interests"), orderBy("createdAt", "desc"));
  onSnapshot(qLeads, snap => {
    allLeads = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    document.getElementById("status-dot").style.background  = "#34d399";
    document.getElementById("status-text").textContent      = "Live · Firebase";
    document.getElementById("live-badge").textContent       = "🔴 Live · Firebase";
    document.getElementById("live-badge").style.color       = "#34d399";
    document.getElementById("live-badge").style.borderColor = "rgba(52,211,153,0.2)";
    document.getElementById("live-badge").style.background  = "rgba(52,211,153,0.1)";
    renderKPIs();
    renderAreaChart(allLeads);
    renderPieChart(allLeads);
    renderRecentLeads(allLeads);
    renderLeadsTable(allLeads);
  }, err => {
    document.getElementById("status-dot").style.background = "#ef4444";
    document.getElementById("status-text").textContent     = "Firebase error";
    document.getElementById("error-banner").style.display  = "block";
    document.getElementById("error-msg").textContent       = err.message;
    console.error(err);
  });

  // MainPropertyForm
  const qProps = query(collection(db, "MainPropertyForm"), orderBy("createdAt", "desc"));
  onSnapshot(qProps, snap => {
    allProperties = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderKPIs();
    renderPropertiesTable(allProperties);
  });

  // Members
  const qMembers = query(collection(db, "members"), orderBy("createdAt", "desc"));
  onSnapshot(qMembers, snap => {
    allMembers = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderKPIs();
    renderMembersTable(allMembers);
  });

  // Sell interests
  const qSell = query(collection(db, "sell-interests"), orderBy("createdAt", "desc"));
  onSnapshot(qSell, snap => {
    allSell = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderKPIs();
    renderSellTable(allSell);
  });

  // Buy interests
  const qBuy = query(collection(db, "buy-interests"), orderBy("createdAt", "desc"));
  onSnapshot(qBuy, snap => {
    allBuy = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderKPIs();
    renderBuyTable(allBuy);
  });

  // Rent interests
  const qRent = query(collection(db, "rent-interests"), orderBy("createdAt", "desc"));
  onSnapshot(qRent, snap => {
    allRent = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderKPIs();
    renderRentTable(allRent);
  });

  // Offplan interests
  const qOffplan = query(collection(db, "offplan-interests"), orderBy("createdAt", "desc"));
  onSnapshot(qOffplan, snap => {
    allOffplan = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderKPIs();
    renderOffplanTable(allOffplan);
  });

  // Registrations
  const qRegs = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
  onSnapshot(qRegs, snap => {
    allRegistrations = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderRegistrationsTable(allRegistrations);
  });

  // Nav buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.view === "logout") return;
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setView(btn.dataset.view);
    });
  });

  // View All leads button
  document.getElementById("view-all-btn")?.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-view="leads"]')?.classList.add("active");
    setView("leads");
  });

  // Filters
  ["search-input","filter-mode","filter-status"].forEach(id => {
    document.getElementById(id)?.addEventListener("input",  () => renderLeadsTable(allLeads));
    document.getElementById(id)?.addEventListener("change", () => renderLeadsTable(allLeads));
  });
  document.getElementById("props-search")?.addEventListener("input",    () => renderPropertiesTable(allProperties));
  document.getElementById("members-search")?.addEventListener("input",  () => renderMembersTable(allMembers));
  document.getElementById("sell-search")?.addEventListener("input",     () => renderSellTable(allSell));
  document.getElementById("buy-search")?.addEventListener("input",      () => renderBuyTable(allBuy));
  document.getElementById("rent-search")?.addEventListener("input",     () => renderRentTable(allRent));
  document.getElementById("offplan-search")?.addEventListener("input",  () => renderOffplanTable(allOffplan));
  document.getElementById("regs-search")?.addEventListener("input",     () => renderRegistrationsTable(allRegistrations));
  document.getElementById("lookup-search")?.addEventListener("input",   () => renderMemberLookup(getLookupData()));

} // end startApp

// ── Boot ──────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  initAuth(startApp);
});
