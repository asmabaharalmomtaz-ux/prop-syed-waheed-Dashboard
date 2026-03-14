export function getStatus(lead) {
  const d = lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date();
  const h = (Date.now() - d.getTime()) / 3600000;
  if (h < 6)  return "New";
  if (h < 24) return "Hot";
  if (h < 72) return "Warm";
  return "Cold";
}

export function fmtDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

export function fmtPKR(v) {
  return v ? "PKR " + Number(v).toLocaleString() : "—";
}

export const STATUS = {
  New:  { bg:"rgba(52,211,153,0.15)",  text:"#34d399" },
  Hot:  { bg:"rgba(239,68,68,0.15)",   text:"#ef4444" },
  Warm: { bg:"rgba(251,146,60,0.15)",  text:"#fb923c" },
  Cold: { bg:"rgba(96,165,250,0.15)",  text:"#60a5fa" },
};

export const MODE_COLOR = {
  rent:         "#a78bfa",
  buy:          "#4f8ef7",
  availability: "#34d399",
};
