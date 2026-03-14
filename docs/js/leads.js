import { getStatus, fmtDate, fmtPKR, STATUS, MODE_COLOR } from "./utils.js";

const expandedRows = new Set();

export function renderRecentLeads(leads) {
  const el = document.getElementById("recent-leads");
  if (!leads.length) { el.innerHTML = `<div class="empty">No leads yet</div>`; return; }
  el.innerHTML = leads.slice(0, 5).map(lead => {
    const status = getStatus(lead);
    const mc     = MODE_COLOR[lead.mode] || "#94a3b8";
    const s      = STATUS[status];
    return `
      <div class="lead-row">
        <div class="lead-left">
          <div class="avatar" style="background:${mc}22;color:${mc}">${(lead.name||"?")[0].toUpperCase()}</div>
          <div>
            <div class="lead-name">${lead.name || "Unknown"}</div>
            <div class="lead-sub">${lead.mode||""} · ${(lead.properties||[]).join(", ")||"—"} · ${lead.email||""}</div>
          </div>
        </div>
        <div class="lead-right">
          <div class="lead-date">${fmtDate(lead.createdAt)}</div>
          <div class="badge" style="background:${s.bg};color:${s.text}">${status}</div>
        </div>
      </div>`;
  }).join("");
}

export function renderLeadsTable(leads) {
  const search = (document.getElementById("search-input")?.value || "").toLowerCase();
  const fMode  = document.getElementById("filter-mode")?.value  || "all";
  const fStat  = document.getElementById("filter-status")?.value || "all";

  const filtered = leads.filter(l => {
    const status = getStatus(l);
    const txt    = [l.name, l.email, l.phone, l.location, ...(l.properties||[])]
      .filter(Boolean).join(" ").toLowerCase();
    return txt.includes(search)
      && (fMode === "all" || l.mode === fMode)
      && (fStat === "all" || status === fStat);
  });

  const tbody = document.getElementById("leads-tbody");
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-cell">No leads match your filters.</td></tr>`;
    document.getElementById("leads-count").textContent = `0 of ${leads.length} leads`;
    return;
  }

  tbody.innerHTML = filtered.map((lead, i) => {
    const status = getStatus(lead);
    const mc     = MODE_COLOR[lead.mode] || "#94a3b8";
    const s      = STATUS[status];
    const isOpen = expandedRows.has(lead.id);
    const props  = (lead.properties||[]).join(", ") || "—";

    return `
      <tr class="main-row" style="background:${i%2===0?"transparent":"rgba(255,255,255,0.01)"}">
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="expand-btn" data-id="${lead.id}">${isOpen ? "▾" : "▸"}</div>
            <div class="avatar sm" style="background:${mc}22;color:${mc}">${(lead.name||"?")[0].toUpperCase()}</div>
            <span style="color:#e2e8f0;font-weight:500">${lead.name||"—"}</span>
          </div>
        </td>
        <td>${lead.phone||"—"}</td>
        <td style="font-size:12px">${lead.email||"—"}</td>
        <td><span class="badge" style="background:${mc}18;color:${mc}">${lead.mode||"—"}</span></td>
        <td style="font-size:12px">${props}</td>
        <td>${fmtPKR(lead.maxPrice)}</td>
        <td style="font-size:12px;color:#4a5568">${fmtDate(lead.createdAt)}</td>
        <td><span class="badge" style="background:${s.bg};color:${s.text}">${status}</span></td>
      </tr>
      ${isOpen ? `
      <tr class="detail-row">
        <td colspan="8">
          <div class="detail-grid">
            <div class="detail-section">
              <div class="detail-title">📋 Personal Info</div>
              <div class="detail-item"><span>Name</span><span>${lead.name||"—"}</span></div>
              <div class="detail-item"><span>Email</span><span>${lead.email||"—"}</span></div>
              <div class="detail-item"><span>Phone</span><span>${lead.phone||"—"}</span></div>
            </div>
            <div class="detail-section">
              <div class="detail-title">🏠 Property Preferences</div>
              <div class="detail-item"><span>Mode</span><span>${lead.mode||"—"}</span></div>
              <div class="detail-item"><span>Category</span><span>${lead.category||"—"}</span></div>
              <div class="detail-item"><span>Properties</span><span>${props}</span></div>
              <div class="detail-item"><span>Sub Option</span><span>${lead.subOption||"—"}</span></div>
              <div class="detail-item"><span>Bedrooms</span><span>${(lead.bedrooms||[]).join(", ")||"—"}</span></div>
              <div class="detail-item"><span>Location</span><span>${lead.location||"—"}</span></div>
            </div>
            <div class="detail-section">
              <div class="detail-title">💰 Budget & Size</div>
              <div class="detail-item"><span>Min Price</span><span>${fmtPKR(lead.minPrice)}</span></div>
              <div class="detail-item"><span>Max Price</span><span>${fmtPKR(lead.maxPrice)}</span></div>
              <div class="detail-item"><span>Min Size</span><span>${lead.minSize ? lead.minSize+" sqft" : "—"}</span></div>
              <div class="detail-item"><span>Max Size</span><span>${lead.maxSize ? lead.maxSize+" sqft" : "—"}</span></div>
            </div>
            <div class="detail-section">
              <div class="detail-title">📝 Notes</div>
              <div style="font-size:12px;color:#94a3b8;line-height:1.6;padding:4px 0">${lead.description||"No message provided."}</div>
              <div class="detail-item" style="margin-top:8px"><span>Submitted</span><span>${fmtDate(lead.createdAt)}</span></div>
              <div class="detail-item"><span>Status</span><span class="badge" style="background:${s.bg};color:${s.text}">${status}</span></div>
            </div>
          </div>
        </td>
      </tr>` : ""}`;
  }).join("");

  // expand/collapse handlers
  document.querySelectorAll(".expand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (expandedRows.has(id)) expandedRows.delete(id);
      else expandedRows.add(id);
      renderLeadsTable(leads);
    });
  });

  document.getElementById("leads-count").textContent =
    `Showing ${filtered.length} of ${leads.length} leads · Click ▸ to expand full details · Live from Firebase`;
}
