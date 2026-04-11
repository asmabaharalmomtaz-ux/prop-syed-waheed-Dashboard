import { db }                               from "./firebase.js";
import { renderPropertiesTable }            from "./properties.js";
import { renderMembersTable }               from "./members.js";
import { renderSellTable }                  from "./sell-interests.js";
import { renderBuyTable }                   from "./buy-interests.js";
import { renderRentTable }                  from "./rent-interests.js";
import { renderOffplanTable }              from "./offplan-interests.js";
import { renderRegistrationsTable }         from "./registrations.js";
import { renderMemberLookup }              from "./member-lookup.js";
import { renderGlobalSearch }              from "./global-search.js";
import { initAuth }                         from "./auth.js";


import { collection, onSnapshot, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allProperties    = [];
let allMembers       = [];
let allSell          = [];
let allBuy           = [];
let allRent          = [];
let allOffplan       = [];
let allRegistrations = [];

// ── KPIs ─────────────────────────────────────────────────────
function renderKPIs() {
  const totalInterests = allSell.length + allBuy.length + allRent.length + allOffplan.length;
  document.getElementById("kpi-total").textContent    = totalInterests;
  document.getElementById("kpi-hot").textContent      = allSell.length + allBuy.length;
  document.getElementById("kpi-props").textContent    = allProperties.length;
  document.getElementById("kpi-members").textContent  = allMembers.length;
  const kpiBudget = document.getElementById("kpi-budget");
  if (kpiBudget) kpiBudget.textContent = allRegistrations.length;

  // Overview breakdown cards
  const o = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  o("overview-sell",    allSell.length);
  o("overview-buy",     allBuy.length);
  o("overview-rent",    allRent.length);
  o("overview-offplan", allOffplan.length);
  o("overview-members", allMembers.length);
  o("overview-props",   allProperties.length);
  o("overview-regs",    allRegistrations.length);
}

// ── Lookup data helper ────────────────────────────────────────
function getLookupData() {
  return {
    members:          allMembers,
    registrations:    allRegistrations,
    sellInterests:    allSell,
    buyInterests:     allBuy,
    rentInterests:    allRent,
    offplanInterests: allOffplan,
  };
}

function getSearchData() {
  return {
    sellInterests:  allSell,
    buyInterests:   allBuy,
    rentInterests:  allRent,
    offplanInterests: allOffplan,
    properties:     allProperties,
    members:        allMembers,
    registrations:  allRegistrations,
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
  if (viewName === "global-search") renderGlobalSearch(getSearchData());
}

// ── Firebase listeners ────────────────────────────────────────
function startApp() {

  // Sell interests — also drives the live badge
  const qSell = query(collection(db, "sell-interests"), orderBy("createdAt", "desc"));
  onSnapshot(qSell, snap => {
    allSell = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    document.getElementById("status-dot").style.background  = "#34d399";
    document.getElementById("status-text").textContent      = "Live · Firebase";
    document.getElementById("live-badge").textContent       = "🔴 Live · Firebase";
    document.getElementById("live-badge").style.color       = "#34d399";
    document.getElementById("live-badge").style.borderColor = "rgba(52,211,153,0.2)";
    document.getElementById("live-badge").style.background  = "rgba(52,211,153,0.1)";
    renderKPIs();
    renderSellTable(allSell);
  }, err => {
    document.getElementById("status-dot").style.background = "#ef4444";
    document.getElementById("status-text").textContent     = "Firebase error";
    document.getElementById("error-banner").style.display  = "block";
    document.getElementById("error-msg").textContent       = err.message;
    console.error("sell-interests error:", err);
  });

  // Buy interests
  const qBuy = query(collection(db, "buy-interests"), orderBy("createdAt", "desc"));
  onSnapshot(qBuy, snap => {
    allBuy = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKPIs();
    renderBuyTable(allBuy);
  }, err => console.error("buy-interests error:", err));

  // Rent interests
  const qRent = query(collection(db, "rent-interests"), orderBy("createdAt", "desc"));
  onSnapshot(qRent, snap => {
    allRent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKPIs();
    renderRentTable(allRent);
  }, err => console.error("rent-interests error:", err));

  // Offplan interests
  const qOffplan = query(collection(db, "offplan-interests"), orderBy("createdAt", "desc"));
  onSnapshot(qOffplan, snap => {
    allOffplan = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKPIs();
    renderOffplanTable(allOffplan);
  }, err => console.error("offplan-interests error:", err));

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
  
} // end startApp

// ── Boot ─────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  initAuth(startApp);
});
// Note: add this import at top of app.js:
// import { renderGlobalSearch } from "./global-search.js";
