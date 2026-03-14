import { fmtPKR, fmtDate } from "./utils.js";

const expandedProps = new Set();

// Pull nested field safely
function g(obj, ...keys) {
  return keys.reduce((o, k) => (o && o[k] !== undefined && o[k] !== '' ? o[k] : null), obj) || "—";
}

export function renderPropertiesTable(properties) {
  const container = document.getElementById("props-container");
  if (!container) return;

  if (!properties.length) {
    container.innerHTML = `<div class="empty-cell" style="padding:40px;text-align:center;color:#4a5568">No property submissions yet.</div>`;
    return;
  }

  // Search/filter
  const search = (document.getElementById("props-search")?.value || "").toLowerCase();
  const filtered = properties.filter(p => {
    const bd = p["building-data"] || {};
    const txt = [bd.building, bd.area, bd.city, bd.country, p["marketing"]?.marketingReferenceNo]
      .filter(Boolean).join(" ").toLowerCase();
    return txt.includes(search);
  });

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-cell" style="padding:40px;text-align:center;color:#4a5568">No properties match your search.</div>`;
    return;
  }

  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#4a5568;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)"></th>
          <th style="padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#4a5568;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">Building</th>
          <th style="padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#4a5568;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">Area / City</th>
          <th style="padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#4a5568;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">Unit</th>
          <th style="padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#4a5568;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">Client</th>
          <th style="padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#4a5568;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">Sell Price</th>
          <th style="padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#4a5568;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">Ref No</th>
          <th style="padding:12px 16px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#4a5568;font-weight:600;text-align:left;border-bottom:1px solid rgba(255,255,255,0.06)">Date</th>
        </tr>
      </thead>
      <tbody id="props-tbody">
        ${filtered.map((p, i) => renderPropertyRow(p, i)).join("")}
      </tbody>
    </table>`;

  // attach expand handlers
  container.querySelectorAll(".prop-expand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (expandedProps.has(id)) expandedProps.delete(id);
      else expandedProps.add(id);
      renderPropertiesTable(properties);
    });
  });

  document.getElementById("props-count").textContent =
    `Showing ${filtered.length} of ${properties.length} submissions · Click ▸ to expand full details`;
}

function renderPropertyRow(p, i) {
  const bd   = p["building-data"]  || {};
  const ud   = p["unit-data"]      || {};
  const cd   = p["client-data"]    || {};
  const rd   = p["rental-data"]    || {};
  const mkt  = p["marketing"]      || {};
  const isOpen = expandedProps.has(p.id);
  const rowBg  = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)";

  const mainRow = `
    <tr style="background:${rowBg}">
      <td style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.04)">
        <div class="prop-expand-btn expand-btn" data-id="${p.id}">${isOpen ? "▾" : "▸"}</div>
      </td>
      <td style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.04);color:#e2e8f0;font-weight:500;font-size:13px">${bd.building||"—"}</td>
      <td style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.04);color:#94a3b8;font-size:13px">${bd.area||"—"} · ${bd.city||"—"}</td>
      <td style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.04);color:#94a3b8;font-size:12px">Fl ${ud.floor||"—"} · Unit ${ud.unitNumber||"—"}</td>
      <td style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.04);color:#94a3b8;font-size:13px">${cd.firstPersonName||"—"}</td>
      <td style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.04);color:#94a3b8;font-size:13px">${ud.sellDemandPrice ? fmtPKR(ud.sellDemandPrice) : "—"}</td>
      <td style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.04)">
        <span class="badge" style="background:rgba(79,142,247,0.12);color:#4f8ef7">${mkt.marketingReferenceNo||"—"}</span>
      </td>
      <td style="padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.04);color:#4a5568;font-size:12px">${fmtDate(p.createdAt)}</td>
    </tr>`;

  if (!isOpen) return mainRow;

  const detailRow = `
    <tr>
      <td colspan="8" style="padding:0;border-bottom:1px solid rgba(255,255,255,0.06)">
        <div style="padding:24px 24px 24px 52px;background:rgba(79,142,247,0.03);border-top:1px solid rgba(79,142,247,0.1)">

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:24px">

            <!-- Building Data -->
            <div>
              <div style="font-size:11px;font-weight:600;color:#4f8ef7;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">🏢 Building Data</div>
              ${detailItem("Country",    bd.country)}
              ${detailItem("City",       bd.city)}
              ${detailItem("Area",       bd.area)}
              ${detailItem("District",   bd.district)}
              ${detailItem("Street",     bd.street)}
              ${detailItem("Building",   bd.building)}
              ${detailItem("Block",      bd.block)}
              ${detailItem("Purpose",    bd.propertyPurpose)}
              ${detailItem("Floors",     bd.numFloors)}
              ${detailItem("Units",      bd.numUnits)}
              ${detailItem("Ownership",  bd.ownerAreaType)}
              ${detailItem("Power",      bd.powerProvider)}
              ${detailItem("Service Charge/yr", bd.serviceChargeYearly ? fmtPKR(bd.serviceChargeYearly) : null)}
            </div>

            <!-- Unit Data -->
            <div>
              <div style="font-size:11px;font-weight:600;color:#34d399;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">🏠 Unit Data</div>
              ${detailItem("Floor",         ud.floor)}
              ${detailItem("Unit No",       ud.unitNumber)}
              ${detailItem("Category",      ud.unitCategory)}
              ${detailItem("Type",          ud.unitType)}
              ${detailItem("Furnishing",    ud.furnishingStatus)}
              ${detailItem("Net Area",      ud.netArea ? ud.netArea+" sqft" : null)}
              ${detailItem("Gross Area",    ud.grossArea ? ud.grossArea+" sqft" : null)}
              ${detailItem("Balcony",       ud.balconyArea ? ud.balconyArea+" sqft" : null)}
              ${detailItem("Built Up",      ud.builtUpArea ? ud.builtUpArea+" sqft" : null)}
              ${detailItem("Min Price",     ud.sellMinPrice ? fmtPKR(ud.sellMinPrice) : null)}
              ${detailItem("Max Price",     ud.sellMaxPrice ? fmtPKR(ud.sellMaxPrice) : null)}
              ${detailItem("Demand Price",  ud.sellDemandPrice ? fmtPKR(ud.sellDemandPrice) : null)}
              ${detailItem("Sold Price",    ud.sellSoldPrice ? fmtPKR(ud.sellSoldPrice) : null)}
              ${detailItem("Payment",       ud.paymentSchedule)}
            </div>

            <!-- Client + Rental + Marketing -->
            <div>
              <div style="font-size:11px;font-weight:600;color:#a78bfa;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">👤 Client</div>
              ${detailItem("Name",      cd.firstPersonName)}
              ${detailItem("Email",     cd.firstPersonEmail)}
              ${detailItem("Phone",     cd.firstPersonCalling)}
              ${detailItem("WhatsApp",  cd.firstPersonWhatsapp)}
              ${detailItem("Title",     cd.firstPersonTitle)}
              ${cd.secondPersonName ? detailItem("2nd Person", cd.secondPersonName) : ""}
              ${cd.secondPersonCalling ? detailItem("2nd Phone", cd.secondPersonCalling) : ""}

              <div style="font-size:11px;font-weight:600;color:#fb923c;text-transform:uppercase;letter-spacing:0.08em;margin:16px 0 12px">🔑 Rental</div>
              ${detailItem("Yearly",    rd.rentalYearlyPrice ? fmtPKR(rd.rentalYearlyPrice) : null)}
              ${detailItem("Monthly",   rd.rentalMonthlyPrice ? fmtPKR(rd.rentalMonthlyPrice) : null)}
              ${detailItem("Cheques",   rd.rentalNumCheques)}
              ${detailItem("Lease",     rd.rentalLeaseTime)}
              ${detailItem("Expiry",    rd.rentalExpiryTime)}
              ${detailItem("Moving",    rd.rentalMovingDate)}

              <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin:16px 0 12px">📋 Marketing</div>
              ${detailItem("Ref No",       mkt.marketingReferenceNo)}
              ${detailItem("Agency",       mkt.marketingAgencyName)}
              ${detailItem("Broker Lic",   mkt.marketingBrokerLicenseNo)}
              ${detailItem("DLD Permit",   mkt.marketingDldPermitNo)}
              ${detailItem("Listed From",  mkt.marketingListedFrom)}
              ${detailItem("Listed To",    mkt.marketingListedTo)}
              ${detailItem("Zone",         mkt.marketingZoneName)}
            </div>
          </div>

          ${renderApartmentTypes(p.apartmentTypes)}
          ${renderDocuments(p.documents)}
        </div>
      </td>
    </tr>`;

  return mainRow + detailRow;
}

function detailItem(label, value) {
  if (!value || value === "—") return "";
  return `
    <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);font-size:12px">
      <span style="color:#4a5568;flex-shrink:0">${label}</span>
      <span style="color:#e2e8f0;text-align:right">${value}</span>
    </div>`;
}

function renderApartmentTypes(aptTypes) {
  if (!aptTypes || !Object.keys(aptTypes).length) return "";
  const rows = Object.keys(aptTypes);
  const cols = [...new Set(rows.flatMap(r => Object.keys(aptTypes[r] || {})))];
  if (!cols.length) return "";

  return `
    <div style="margin-top:16px">
      <div style="font-size:11px;font-weight:600;color:#4f8ef7;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">📊 Apartment Types</div>
      <div style="overflow-x:auto">
        <table style="width:auto;border-collapse:collapse;font-size:12px">
          <thead>
            <tr>
              <th style="padding:6px 12px;background:rgba(255,255,255,0.04);color:#4a5568;font-weight:600;text-align:left;border:1px solid rgba(255,255,255,0.06)"></th>
              ${cols.map(c => `<th style="padding:6px 12px;background:rgba(255,255,255,0.04);color:#4f8ef7;font-weight:600;text-align:center;border:1px solid rgba(255,255,255,0.06)">${c}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td style="padding:5px 12px;color:#94a3b8;font-weight:500;border:1px solid rgba(255,255,255,0.04);background:rgba(255,255,255,0.02)">${r}</td>
                ${cols.map(c => `<td style="padding:5px 12px;color:#e2e8f0;text-align:center;border:1px solid rgba(255,255,255,0.04)">${aptTypes[r]?.[c] || "—"}</td>`).join("")}
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderDocuments(docs) {
  if (!docs) return "";
  const entries = Object.entries(docs).filter(([, v]) => v && v.length);
  if (!entries.length) return "";

  return `
    <div style="margin-top:16px">
      <div style="font-size:11px;font-weight:600;color:#34d399;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">📎 Documents</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${entries.map(([key, url]) => {
          const urls = Array.isArray(url) ? url : [url];
          return urls.filter(Boolean).map((u, i) => `
            <a href="${u}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);border-radius:6px;color:#34d399;font-size:11px;text-decoration:none">
              📄 ${key}${urls.length > 1 ? " "+(i+1) : ""}
            </a>`).join("");
        }).join("")}
      </div>
    </div>`;
}
