import { fmtDate } from "./utils.js";

let expandedRegs = new Set();

export function renderRegistrationsTable(docs) {
  const search = (document.getElementById("regs-search")?.value || "").toLowerCase();
  const filtered = docs.filter(d => !search || [d.name, d.email, d.phone, d.jobTitle].some(v => (v||"").toLowerCase().includes(search)));

  const container = document.getElementById("regs-container");
  const countEl   = document.getElementById("regs-count");
  if (!container) return;

  if (!filtered.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#4a5568">${search ? "No results found." : "No registrations yet."}</div>`;
    countEl.textContent = "";
    return;
  }

  container.innerHTML = `<table>
    <thead><tr>
      <th></th><th>Name</th><th>Phone</th><th>Email</th>
      <th>Job Title</th><th>Joining Date</th><th>Date</th>
    </tr></thead>
    <tbody id="regs-tbody"></tbody>
  </table>`;

  const tbody = document.getElementById("regs-tbody");
  filtered.forEach((d) => {
    const isExp = expandedRegs.has(d.id);

    const tr = document.createElement("tr");
    tr.style.cssText = "cursor:pointer;transition:background 0.15s";
    tr.onmouseover = () => tr.style.background = "rgba(255,255,255,0.03)";
    tr.onmouseout  = () => tr.style.background = "";
    tr.innerHTML = `
      <td style="width:32px;text-align:center">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:rgba(79,142,247,0.15);color:#4f8ef7;font-size:11px;font-weight:700;transition:transform 0.2s;transform:${isExp?"rotate(90deg)":"rotate(0deg)"}">▶</span>
      </td>
      <td style="color:#e2e8f0;font-weight:500">${d.name || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${d.phone || d.whatsapp || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${d.email || "—"}</td>
      <td>
        <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(79,142,247,0.12);color:#4f8ef7">
          ${d.jobTitle || "—"}
        </span>
      </td>
      <td style="color:#94a3b8;font-size:13px">${d.joiningDate || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${fmtDate(d.createdAt)}</td>`;
    tr.addEventListener("click", () => { expandedRegs.has(d.id) ? expandedRegs.delete(d.id) : expandedRegs.add(d.id); renderRegistrationsTable(docs); });
    tbody.appendChild(tr);

    const det = document.createElement("tr");
    det.style.display = isExp ? "table-row" : "none";
    det.innerHTML = `<td colspan="7" style="padding:0">
      <div style="background:rgba(15,17,23,0.6);border-left:3px solid #4f8ef7;padding:20px 28px">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px">
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:10px;font-weight:600">👤 Personal Info</div>
            ${dr("Name",         d.name)}
            ${dr("Email",        d.email)}
            ${dr("Phone",        d.phone || d.whatsapp)}
            ${dr("Job Title",    d.jobTitle)}
            ${dr("Joining Date", d.joiningDate)}
            ${dr("Registered",   fmtDate(d.createdAt))}
          </div>
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:10px;font-weight:600">💼 Work Info</div>
            ${dr("Work Place",     d.workPlaceType)}
            ${dr("Working Hours",  d.workingHours)}
            ${dr("Currency",       d.currency)}
            ${dr("Login Time",     d.loginTime)}
            ${dr("Logout Time",    d.logoutTime)}
          </div>
          <div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:10px;font-weight:600">🏦 Bank Info</div>
            ${dr("Bank Type",      d.bankType)}
            ${dr("Bank Name",      d.bankName)}
            ${dr("IBAN",           d.iban)}
            ${dr("Person Name",    d.personName)}
            ${dr("Account No",     d.accountNumber)}
          </div>
        </div>
        ${d.documentFile ? `
          <div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.05)">
            <a href="${d.documentFile}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:8px;background:rgba(79,142,247,0.12);color:#4f8ef7;font-size:13px;font-weight:500;text-decoration:none;border:1px solid rgba(79,142,247,0.2)">
              📄 View CV / CNIC Document
            </a>
          </div>` : ""}
      </div>
    </td>`;
    tbody.appendChild(det);
  });

  countEl.textContent = `${filtered.length} registration${filtered.length !== 1 ? "s" : ""}`;
}

function dr(label, value) {
  if (!value && value !== 0) return "";
  return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);gap:12px">
    <span style="font-size:12px;color:#4a5568;flex-shrink:0">${label}</span>
    <span style="font-size:12px;color:#cbd5e1;text-align:right">${value}</span>
  </div>`;
}
