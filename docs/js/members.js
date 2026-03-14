import { fmtDate } from "./utils.js";

let expandedMembers = new Set();

// ── Render Members Table ──────────────────────────────────────
export function renderMembersTable(members) {
  const search = (document.getElementById("members-search")?.value || "").toLowerCase();

  const filtered = members.filter(m => {
    if (!search) return true;
    return (
      (m.name        || "").toLowerCase().includes(search) ||
      (m.email       || "").toLowerCase().includes(search) ||
      (m.whatsapp    || "").toLowerCase().includes(search) ||
      (m.jobTitle    || "").toLowerCase().includes(search) ||
      (m.rollNo      || "").toLowerCase().includes(search)
    );
  });

  const container = document.getElementById("members-container");
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-cell" style="padding:40px;text-align:center;color:#4a5568">
      ${search ? "No members match your search." : "No members registered yet."}
    </div>`;
    document.getElementById("members-count").textContent = "";
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Roll No</th>
          <th>Name</th>
          <th>Email</th>
          <th>WhatsApp</th>
          <th>Job Title</th>
          <th>Joining Date</th>
          <th>Contract</th>
        </tr>
      </thead>
      <tbody id="members-tbody"></tbody>
    </table>
  `;

  const tbody = document.getElementById("members-tbody");

  filtered.forEach((m, i) => {
    const isExpanded = expandedMembers.has(m.id);
    const contract = m.terminateContract && m.fixedTermContract
      ? "Both"
      : m.terminateContract
      ? "Open-ended"
      : m.fixedTermContract
      ? "Fixed term"
      : "—";

    // ── Summary row ───────────────────────────────────────────
    const tr = document.createElement("tr");
    tr.style.cssText = "cursor:pointer;transition:background 0.15s";
    tr.onmouseover = () => tr.style.background = "rgba(255,255,255,0.03)";
    tr.onmouseout  = () => tr.style.background = "";
    tr.innerHTML = `
      <td style="width:32px;text-align:center">
        <span style="
          display:inline-flex;align-items:center;justify-content:center;
          width:20px;height:20px;border-radius:50%;
          background:rgba(79,142,247,0.15);color:#4f8ef7;
          font-size:11px;font-weight:700;transition:transform 0.2s;
          transform:${isExpanded ? "rotate(90deg)" : "rotate(0deg)"}
        ">▶</span>
      </td>
      <td><span style="font-family:monospace;font-size:12px;color:#a78bfa;
        background:rgba(167,139,250,0.1);padding:2px 8px;border-radius:6px">
        ${m.rollNo || "—"}
      </span></td>
      <td style="font-weight:500;color:#e2e8f0">${m.name || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.email || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${m.whatsapp || "—"}</td>
      <td>
        <span style="
          padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;
          background:rgba(79,142,247,0.12);color:#4f8ef7;
        ">${m.jobTitle || "—"}</span>
      </td>
      <td style="color:#94a3b8;font-size:13px">${m.joiningDate || "—"}</td>
      <td style="color:#94a3b8;font-size:13px">${contract}</td>
    `;
    tr.addEventListener("click", () => toggleMemberRow(m.id, detailTr));
    tbody.appendChild(tr);

    // ── Expandable detail row ─────────────────────────────────
    const detailTr = document.createElement("tr");
    detailTr.id = `member-detail-${m.id}`;
    detailTr.style.display = isExpanded ? "table-row" : "none";
    detailTr.innerHTML = `
      <td colspan="8" style="padding:0">
        <div style="
          background:rgba(15,17,23,0.6);
          border-left:3px solid #4f8ef7;
          padding:24px 28px;
          animation: fadeIn 0.2s ease;
        ">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px">

            <!-- Personal Info -->
            <div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:12px;font-weight:600">
                👤 Personal Info
              </div>
              ${detailRow("Name",     m.name)}
              ${detailRow("Email",    m.email)}
              ${detailRow("WhatsApp", m.whatsapp)}
              ${detailRow("Roll No",  m.rollNo)}
              ${detailRow("Registered", fmtDate(m.createdAt))}
            </div>

            <!-- Work Info -->
            <div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:12px;font-weight:600">
                💼 Work Info
              </div>
              ${detailRow("Job Title",       m.jobTitle)}
              ${detailRow("Work Place Type", m.workPlaceType)}
              ${detailRow("Working Hours",   m.workingHours)}
              ${detailRow("Currency",        m.currency)}
              ${detailRow("Log In Time",     m.loginTime)}
              ${detailRow("Log Out Time",    m.logoutTime)}
              ${detailRow("Joining Date",    m.joiningDate)}
            </div>

            <!-- Bank Info -->
            <div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:12px;font-weight:600">
                🏦 Bank Info
              </div>
              ${detailRow("Bank Type",      m.bankType)}
              ${m.bankType === "Bank Account" ? `
                ${detailRow("Bank Name", m.bankName)}
                ${detailRow("IBAN",      m.iban)}
              ` : `
                ${detailRow("Person Name",     m.personName)}
                ${detailRow("Account Number",  m.accountNumber)}
              `}
            </div>

            <!-- Contract -->
            <div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:12px;font-weight:600">
                📋 Contract
              </div>
              ${detailRow("Open-ended contract",  m.terminateContract ? "✅ Yes" : "—")}
              ${detailRow("Fixed term contract",  m.fixedTermContract  ? "✅ Yes" : "—")}
            </div>

          </div>

          <!-- CV / Document link -->
          ${m.documentFile ? `
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.05)">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a5568;margin-bottom:10px;font-weight:600">
                📎 CV / CNIC Document
              </div>
              <a href="${m.documentFile}" target="_blank" rel="noopener" style="
                display:inline-flex;align-items:center;gap:8px;
                padding:8px 16px;border-radius:8px;
                background:rgba(79,142,247,0.12);color:#4f8ef7;
                font-size:13px;font-weight:500;text-decoration:none;
                border:1px solid rgba(79,142,247,0.2);
                transition:background 0.15s;
              "
              onmouseover="this.style.background='rgba(79,142,247,0.22)'"
              onmouseout="this.style.background='rgba(79,142,247,0.12)'">
                📄 View Document
              </a>
            </div>
          ` : ""}

        </div>
      </td>
    `;
    tbody.appendChild(detailTr);
  });

  document.getElementById("members-count").textContent =
    `${filtered.length} member${filtered.length !== 1 ? "s" : ""}${search ? " found" : " registered"}`;
}

// ── Toggle expand/collapse ────────────────────────────────────
function toggleMemberRow(id, detailTr) {
  if (expandedMembers.has(id)) {
    expandedMembers.delete(id);
    detailTr.style.display = "none";
  } else {
    expandedMembers.add(id);
    detailTr.style.display = "table-row";
  }
}

// ── Helper: single detail key-value row ──────────────────────
function detailRow(label, value) {
  if (!value && value !== 0) return "";
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;
      padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04);gap:12px">
      <span style="font-size:12px;color:#4a5568;flex-shrink:0">${label}</span>
      <span style="font-size:12px;color:#cbd5e1;text-align:right">${value}</span>
    </div>
  `;
}










