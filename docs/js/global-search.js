import { fmtDate } from "./utils.js";

// ── Global Search ─────────────────────────────────────────────
// Searches across all collections for building name or area name

export function renderGlobalSearch({  
  buyInterests,
  sellInterests,
  properties,
  members,
  registrations,
}) {
  const query = (document.getElementById("global-search-input")?.value || "").trim().toLowerCase();
  const resultsEl = document.getElementById("global-search-results");
  const countEl   = document.getElementById("global-search-count");
  if (!resultsEl) return;

  // Empty state
  if (!query) {
    resultsEl.innerHTML = `
      <div style="text-align:center;padding:80px 20px;color:#4a5568">
        <div style="font-size:48px;margin-bottom:16px">🔍</div>
        <div style="font-size:16px;font-weight:600;color:#64748b;margin-bottom:8px">Search across all forms</div>
        <div style="font-size:13px;color:#4a5568">Type a building name, area, city, or any field to find matching submissions</div>
      </div>`;
    if (countEl) countEl.textContent = "";
    return;
  }

  // ── Search function — checks every field of a doc ──────────
  function matchesQuery(doc) {
    return JSON.stringify(doc).toLowerCase().includes(query);
  }

  // ── Tag each result with its source ──────────────────────────
  const allResults = [
    ...sellInterests.filter(matchesQuery).map(d    => ({ ...d, _collection: "Sell-Form",     _color: "#f59e0b" })),
    ...buyInterests.filter(matchesQuery).map(d     => ({ ...d, _collection: "Buy-Form",      _color: "#34d399" })),
    ...properties.filter(matchesQuery).map(d       => ({ ...d, _collection: "Property Form",     _color: "#4f8ef7" })),
    ...members.filter(matchesQuery).map(d          => ({ ...d, _collection: "Member",            _color: "#34d399" })),
    ...registrations.filter(matchesQuery).map(d    => ({ ...d, _collection: "Registration",      _color: "#94a3b8" })),
  ];

  if (countEl) {
    countEl.textContent = allResults.length > 0
      ? `${allResults.length} result${allResults.length !== 1 ? "s" : ""} found`
      : "";
  }

  if (allResults.length === 0) {
    resultsEl.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#4a5568">
        <div style="font-size:36px;margin-bottom:12px">😶</div>
        <div style="font-size:15px;font-weight:500;color:#64748b">No results for "<strong style="color:#94a3b8">${query}</strong>"</div>
        <div style="font-size:13px;margin-top:8px;color:#4a5568">Try a different building name, area, or keyword</div>
      </div>`;
    return;
  }

  resultsEl.innerHTML = allResults.map(doc => {
    // Pull the most relevant fields to display
    const buildingData = doc["building-data"] || {};
    const unitData     = doc["unit-data"]     || {};
    const clientData   = doc["client-data"]   || {};

    // Key fields to highlight
    const area     = buildingData.area     || doc.area     || doc.location || "—";
    const building = buildingData.building || doc.building || "—";
    const city     = buildingData.city     || doc.city     || "—";
    const name     = clientData.firstPersonName || doc.name || doc.memberName || "—";
    const email    = clientData.firstPersonEmail || doc.email || "—";
    const phone    = clientData.firstPersonCalling || doc.phone || doc.whatsapp || "—";
    const date     = fmtDate(doc.createdAt);
    const isMember = doc.submittedAsMember;

    // Highlight matching text
    function highlight(text) {
      if (!text || text === "—") return "<span style='color:#4a5568'>—</span>";
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
      return String(text).replace(regex, `<mark style="background:rgba(201,168,76,0.3);color:#e2e8f0;border-radius:2px;padding:0 2px">$1</mark>`);
    }

    return `
      <div style="
        background:#141720;
        border:1px solid rgba(255,255,255,0.06);
        border-left:3px solid ${doc._color};
        border-radius:12px;
        padding:18px 22px;
        margin-bottom:12px;
        transition:border-color 0.2s;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="
              padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;
              background:${doc._color}22;color:${doc._color};letter-spacing:0.04em;
            ">${doc._collection}</span>
            ${isMember ? `<span style="font-size:10px;background:rgba(52,211,153,0.15);color:#34d399;padding:2px 8px;border-radius:4px;font-weight:600">MEMBER</span>` : ""}
          </div>
          <span style="font-size:12px;color:#4a5568">${date}</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
          ${area     !== "—" ? `<div>${fieldRow("📍 Area",     highlight(area))}</div>`     : ""}
          ${building !== "—" ? `<div>${fieldRow("🏢 Building", highlight(building))}</div>` : ""}
          ${city     !== "—" ? `<div>${fieldRow("🌆 City",     highlight(city))}</div>`     : ""}
          ${name     !== "—" ? `<div>${fieldRow("👤 Name",     highlight(name))}</div>`     : ""}
          ${email    !== "—" ? `<div>${fieldRow("✉️ Email",    highlight(email))}</div>`    : ""}
          ${phone    !== "—" ? `<div>${fieldRow("📞 Phone",    highlight(phone))}</div>`    : ""}
        </div>
      </div>`;
  }).join("");
}

function fieldRow(label, value) {
  return `
    <div style="font-size:11px;color:#4a5568;margin-bottom:2px">${label}</div>
    <div style="font-size:13px;color:#cbd5e1">${value}</div>
  `;
}
