let areaChart = null;
let pieChart  = null;

export function renderAreaChart(leads) {
  const counts = {};
  leads.forEach(l => {
    const d = l.createdAt?.toDate ? l.createdAt.toDate() : new Date();
    const k = d.toLocaleDateString("en-US", { month:"short" });
    counts[k] = (counts[k] || 0) + 1;
  });
  const labels = Object.keys(counts).slice(-6);
  const ctx    = document.getElementById("areaChart").getContext("2d");
  if (areaChart) areaChart.destroy();
  areaChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Leads",
        data:  labels.map(k => counts[k]),
        borderColor: "#4f8ef7",
        borderWidth: 2,
        fill: true,
        backgroundColor: (c) => {
          const g = c.chart.ctx.createLinearGradient(0, 0, 0, 180);
          g.addColorStop(0, "rgba(79,142,247,0.3)");
          g.addColorStop(1, "rgba(79,142,247,0)");
          return g;
        },
        tension: 0.4,
        pointBackgroundColor: "#4f8ef7",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color:"rgba(255,255,255,0.04)" }, ticks: { color:"#4a5568" } },
        y: { grid: { color:"rgba(255,255,255,0.04)" }, ticks: { color:"#4a5568" } },
      },
    },
  });
}

export function renderPieChart(leads) {
  const c = { rent:0, buy:0, availability:0 };
  leads.forEach(l => { if (l.mode && c[l.mode] !== undefined) c[l.mode]++; });
  const ctx = document.getElementById("pieChart").getContext("2d");
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Rent", "Buy", "Availability"],
      datasets: [{
        data: [c.rent, c.buy, c.availability],
        backgroundColor: ["#a78bfa", "#4f8ef7", "#34d399"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color:"#94a3b8", font:{ size:11 }, boxWidth:10, padding:12 },
        },
      },
    },
  });
}
