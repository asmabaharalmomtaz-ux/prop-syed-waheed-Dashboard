import { fmtDate } from "./utils.js";

let expandedBuy = new Set();

export function renderBuyTable(docs) {
  const search = (document.getElementById("buy-search")?.value || "").toLowerCase();
  const filtered = docs.filter(d => !search || [d.memberName, d.memberPhone, d.memberRollNo, d.location, d.building].some(v => (v||"").toLowerCase().includes(search)));

  const container = document.getElementById("buy-container");
  const countEl   = document.getElementById("buy-count");
  if (!container) return;

  if (!filtered.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#4a5568">${search ? "No results found." : "No buy interest submissions yet."}</div>`;
    countEl.textContent = "";
    return;
  }

  container.innerHTML = `<table>
    <thead><tr>
      <th></th><th>Member</th><th>Phone</th><th>Location</th><th>Building</th>
      <th>Property Status</th><th>Bedrooms</th><th>Date</th>
    </tr></thead>
    <tbody id="buy-tbody"></tbody>
  </table>`;

  const tbody = document.getElementById("buy-tbody");
  filtered.forEach((d) => {
    const isMember = d.submittedAsMember;
    const isExp    = expandedBuy.has(d.id);

    const tr = document.createElement("tr");
    tr.style.cssText = "cursor:pointer;transition:background 0.15s";
    tr.onmouseover = () => tr.style.background = "rgba(255,255,255,0.03)";
    tr.onmouseout  = () => tr.style.background = "";
    tr.innerHTML = `
      <td style="width:32px;text-align:center">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:rgba(79,142,247,0.15);color:#4f8ef7;font-size:11px;font-weight:700;transition:transform 0.2s;transform:${isExp?"rotate(90deg)":"rotate(0deg)"}">▶</span>
      </td>
      
      <td>
        ${isMember ? `<span style="font-size:10px;background:rgba(52,211,153,0.15);color:#34d399;padding:2px 6px;border-radius:4px;margin-right:6px">MEMBER</span>` : `<span style="font-size:10px;background:rgba(148,163,184,0.15);color:#94a3b8;padding:2px 6px;border-radius:4px;margin-right:6px">GUEST</span>`}
        <span style="color:#e2e8f0;font-weight:500">${d.memberName || "—"}</span>
      </td>
      <td style="color:#94a3b8;font-size:13px">${d.memberPhone || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${d.location || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${d.building || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${d.propertyStatus || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${Array.isArray(d.bedrooms) ? d.bedrooms.join(", ") : (d.bedrooms || "—")}</td>
      <td style="color:#94a3b8;font-size:13px">${fmtDate(d.createdAt)}</td>`;
    tr.addEventListener("click", () => { expandedBuy.has(d.id) ? expandedBuy.delete(d.id) : expandedBuy.add(d.id); renderBuyTable(docs); });
    tbody.appendChild(tr);

    const det = document.createElement("tr");
    det.style.display = isExp ? "table-row" : "none";
    det.innerHTML = `<td colspan="8" style="padding:0">
    <td style="width:32px;text-align:center">
        <span style="
          display:inline-flex;align-items:center;justify-content:center;
          width:20px;height:20px;border-radius:50%;
          background:rgb(219, 177, 37);color:#4f8ef7;
          font-size:11px;font-weight:700;transition:transform 0.2s;
          transform:${expandedBuy.has(d.id) ? "rotate(90deg)" : "rotate(0deg)"}
        ">▶</span>
      </td>
      <div style="background:rgba(15,17,23,0.6);border-left:3px solid #34d399;padding:20px 28px">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px">
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:10px;font-weight:600">📋 Submission Info</div>
            ${dr("Member Name",   d.memberName)}
            ${dr("Phone",        d.memberPhone)}
            ${dr("Roll No",      d.memberRollNo)}
            ${dr("Submitted As", d.submittedAsMember ? "Member ✅" : "Guest")}
            ${dr("Date",         fmtDate(d.createdAt))}
          </div>
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:10px;font-weight:600">🏠 Property Preferences</div>
            ${dr("Location",      d.location)}
            ${dr("Building",      d.building)}
            ${dr("Property Status", d.propertyStatus)}
            ${dr("Category",      d.category)}
            ${dr("Developer",     d.developerName)}
            ${dr("Property Type", Array.isArray(d.propertyType) ? d.propertyType.join(", ") : d.propertyType)}
          </div>
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:10px;font-weight:600">💰 Budget & Size</div>
            ${dr("Bedrooms",    Array.isArray(d.bedrooms) ? d.bedrooms.join(", ") : d.bedrooms)}
            ${dr("Min Price",   d.minPrice)}
            ${dr("Max Price",   d.maxPrice)}
            ${dr("Min Size",    d.minSize)}
            ${dr("Max Size",    d.maxSize)}
            ${dr("Description", d.description)}
          </div>
        </div>
      </div>
    </td>`;
    tbody.appendChild(det);
  });

  countEl.textContent = `${filtered.length} submission${filtered.length !== 1 ? "s" : ""}`;
}

function dr(label, value) {
  if (!value && value !== 0) return "";
  return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);gap:12px">
    <span style="font-size:12px;color:#4a5568;flex-shrink:0">${label}</span>
    <span style="font-size:12px;color:#cbd5e1;text-align:right">${value}</span>
  </div>`;
}
