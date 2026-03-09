import { db }                                from "./firebase.js";
import { getStatus, fmtPKR }                from "./utils.js";
import { renderAreaChart, renderPieChart }  from "./charts.js";
import { renderRecentLeads, renderLeadsTable } from "./leads.js";
import { renderPropertiesTable }            from "./properties.js";
import { renderMembersTable }              from "./members.js";
import { initAuth }                         from "./auth.js";
import { collection, onSnapshot, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allLeads      = [];
let allProperties = [];
let allMembers    = [];

// ── KPIs ─────────────────────────────────────────────────────
function renderKPIs() {
  document.getElementById("kpi-total").textContent   = allLeads.length;
  document.getElementById("kpi-hot").textContent     = allLeads.filter(l => ["Hot","New"].includes(getStatus(l))).length;
  const avg = allLeads.length
    ? Math.round(allLeads.reduce((s,l) => s+(Number(l.maxPrice)||0), 0) / allLeads.length)
    : 0;
  document.getElementById("kpi-budget").textContent  = avg ? fmtPKR(avg) : "—";
  document.getElementById("kpi-props").textContent   = allProperties.length;
  document.getElementById("kpi-members").textContent = allMembers.length;
}

// ── Nav ───────────────────────────────────────────────────────
function setView(viewName) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  const el = document.getElementById("view-" + viewName);
  if (el) el.style.display = "block";
  if (viewName === "leads")      renderLeadsTable(allLeads);
  if (viewName === "properties") renderPropertiesTable(allProperties);
  if (viewName === "members")    renderMembersTable(allMembers);
}

// ── Firebase listeners (only run after auth) ──────────────────
function startApp() {

  // Interests / Leads
  const qLeads = query(collection(db, "interests"), orderBy("createdAt", "desc"));
  onSnapshot(qLeads,
    snap => {
      allLeads = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      document.getElementById("status-dot").style.background   = "#34d399";
      document.getElementById("status-text").textContent       = `${allLeads.length} leads live`;
      document.getElementById("live-badge").textContent        = "🔴 Live · Firebase";
      document.getElementById("live-badge").style.color        = "#34d399";
      document.getElementById("live-badge").style.borderColor  = "rgba(52,211,153,0.2)";
      document.getElementById("live-badge").style.background   = "rgba(52,211,153,0.1)";
      renderKPIs();
      renderAreaChart(allLeads);
      renderPieChart(allLeads);
      renderRecentLeads(allLeads);
      renderLeadsTable(allLeads);
    },
    err => {
      document.getElementById("status-dot").style.background = "#ef4444";
      document.getElementById("status-text").textContent     = "Firebase error";
      document.getElementById("error-banner").style.display  = "block";
      document.getElementById("error-msg").textContent       = err.message;
      console.error(err);
    }
  );

  // Properties
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

  // Nav buttons
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.view === "logout") return;
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setView(btn.dataset.view);
    });
  });

  // "View All" leads button
  document.getElementById("view-all-btn")?.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-view="leads"]').classList.add("active");
    setView("leads");
  });

  // Filters — leads
  ["search-input", "filter-mode", "filter-status"].forEach(id => {
    document.getElementById(id)?.addEventListener("input",  () => renderLeadsTable(allLeads));
    document.getElementById(id)?.addEventListener("change", () => renderLeadsTable(allLeads));
  });

  // Filter — properties
  document.getElementById("props-search")?.addEventListener("input", () => renderPropertiesTable(allProperties));

  // Filter — members
  document.getElementById("members-search")?.addEventListener("input", () => renderMembersTable(allMembers));

} // end startApp

// ── Boot ──────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  initAuth(startApp);
});