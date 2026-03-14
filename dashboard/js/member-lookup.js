import { fmtDate } from "./utils.js";

// Called from app.js with all collections data
export function renderMemberLookup({ members, registrations, sellInterests, buyInterests, rentInterests, offplanInterests }) {
  const query = (document.getElementById("lookup-search")?.value || "").trim().toLowerCase();
  const resultsEl = document.getElementById("lookup-results");
  if (!resultsEl) return;

  if (!query) {
    resultsEl.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#4a5568">
        <div style="font-size:40px;margin-bottom:16px">🔍</div>
        <div style="font-size:15px;font-weight:500;color:#64748b">Search by member name or phone number</div>
        <div style="font-size:13px;margin-top:8px;color:#4a5568">Finds all form activity across every collection</div>
      </div>`;
    return;
  }

  // Search members collection for matching people
  const matchedMembers = members.filter(m =>
    (m.name        || "").toLowerCase().includes(query) ||
    (m.whatsapp    || "").toLowerCase().includes(query) ||
    (m.phone       || "").toLowerCase().includes(query) ||
    (m.memberPhone || "").toLowerCase().includes(query)
  );

  // Also search by memberName/memberPhone across all interest collections
  const allInterestDocs = [
    ...sellInterests.map(d => ({ ...d, _source: "Sell Interest" })),
    ...buyInterests.map(d  => ({ ...d, _source: "Buy Interest"  })),
    ...rentInterests.map(d => ({ ...d, _source: "Rent Interest" })),
    ...offplanInterests.map(d => ({ ...d, _source: "Off-Plan Interest" })),
    ...registrations.map(d => ({ ...d, _source: "Registration" })),
  ];

  // Find unique identifiers that match the query
  const matchedKeys = new Set();
  allInterestDocs.forEach(d => {
    if (
      (d.memberName  || "").toLowerCase().includes(query) ||
      (d.memberPhone || "").toLowerCase().includes(query) ||
      (d.name        || "").toLowerCase().includes(query) ||
      (d.phone       || "").toLowerCase().includes(query)
    ) {
      const key = d.memberPhone || d.phone || d.memberName || d.name || d.id;
      matchedKeys.add(key);
    }
  });

  // Also add matched members' phones
  matchedMembers.forEach(m => {
    const key = m.whatsapp || m.phone || m.name;
    if (key) matchedKeys.add(key.toLowerCase());
  });

  if (matchedKeys.size === 0) {
    resultsEl.innerHTML = `<div style="text-align:center;padding:40px;color:#4a5568">No results found for "<strong style="color:#94a3b8">${query}</strong>"</div>`;
    return;
  }

  // Group all docs by person
  const people = {};
  allInterestDocs.forEach(d => {
    const nameKey  = (d.memberName  || d.name  || "").toLowerCase();
    const phoneKey = (d.memberPhone || d.phone || "").toLowerCase();
    const personKey = phoneKey || nameKey;
    if (!personKey) return;

    // Check if this person matches any of our matched keys
    const matches = [...matchedKeys].some(k => personKey.includes(k) || k.includes(personKey) || nameKey.includes(k) || k.includes(nameKey));
    if (!matches) return;

    if (!people[personKey]) {
      people[personKey] = {
        name:  d.memberName  || d.name  || "—",
        phone: d.memberPhone || d.phone || "—",
        rollNo: d.memberRollNo || "—",
        isMember: d.submittedAsMember || false,
        submissions: [],
      };
    }
    people[personKey].submissions.push({ source: d._source, date: fmtDate(d.createdAt) });
  });

  // Also include matched members with zero submissions
  matchedMembers.forEach(m => {
    const personKey = (m.whatsapp || m.phone || m.name || "").toLowerCase();
    if (!people[personKey]) {
      people[personKey] = {
        name: m.name || "—",
        phone: m.whatsapp || m.phone || "—",
        rollNo: m.rollNo || "—",
        isMember: true,
        submissions: [],
      };
    }
  });

  const peopleList = Object.values(people);

  if (!peopleList.length) {
    resultsEl.innerHTML = `<div style="text-align:center;padding:40px;color:#4a5568">No results found for "<strong style="color:#94a3b8">${query}</strong>"</div>`;
    return;
  }

  resultsEl.innerHTML = peopleList.map(p => {
    const formCounts = {};
    p.submissions.forEach(s => { formCounts[s.source] = (formCounts[s.source] || 0) + 1; });

    const formTags = Object.entries(formCounts).map(([form, count]) => {
      const colors = {
        "Sell Interest":      { bg: "rgba(245,158,11,0.15)",  text: "#f59e0b"  },
        "Buy Interest":       { bg: "rgba(52,211,153,0.15)",  text: "#34d399"  },
        "Rent Interest":      { bg: "rgba(167,139,250,0.15)", text: "#a78bfa"  },
        "Off-Plan Interest":  { bg: "rgba(251,191,36,0.15)",  text: "#fbbf24"  },
        "Registration":       { bg: "rgba(79,142,247,0.15)",  text: "#4f8ef7"  },
      };
      const c = colors[form] || { bg: "rgba(148,163,184,0.15)", text: "#94a3b8" };
      return `<span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:${c.bg};color:${c.text};margin-right:6px;margin-bottom:6px;display:inline-block">
        ${form} × ${count}
      </span>`;
    }).join("");

    return `
      <div style="background:#141720;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px 24px;margin-bottom:14px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
              <span style="font-size:16px;font-weight:600;color:#e2e8f0">${p.name}</span>
              ${p.isMember
                ? `<span style="font-size:10px;background:rgba(52,211,153,0.15);color:#34d399;padding:2px 8px;border-radius:4px;font-weight:600">MEMBER</span>`
                : `<span style="font-size:10px;background:rgba(148,163,184,0.15);color:#94a3b8;padding:2px 8px;border-radius:4px;font-weight:600">GUEST</span>`}
            </div>
            <div style="font-size:13px;color:#4a5568">📞 ${p.phone} ${p.rollNo !== "—" ? `&nbsp;·&nbsp; 🪪 ${p.rollNo}` : ""}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:28px;font-weight:700;color:#4f8ef7;line-height:1">${p.submissions.length}</div>
            <div style="font-size:11px;color:#4a5568;margin-top:2px">total submission${p.submissions.length !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div style="flex-wrap:wrap">${formTags || '<span style="font-size:12px;color:#4a5568">No form submissions yet</span>'}</div>
      </div>`;
  }).join("");
}
