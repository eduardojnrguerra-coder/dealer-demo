console.log('dashboard.js loaded (charts only, no tour controller)');

async function loadDashboardCharts() {
  const response = await fetch('/api/dashboard');
  const data = await response.json();
  const chartColor = '#0f4c81';
  const slate = '#475569';
  const teal = '#14b8a6';

  const monthly = document.getElementById('monthlySalesChart');
  if (monthly) {
    new Chart(monthly, {
      type: 'line',
      data: {
        labels: data.monthlyLabels,
        datasets: [{
          label: 'Units sold',
          data: data.monthlySales,
          borderColor: chartColor,
          backgroundColor: 'rgba(15, 76, 129, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: chartColor
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  const salesperson = document.getElementById('salespersonChart');
  if (salesperson) {
    new Chart(salesperson, {
      type: 'bar',
      data: {
        labels: Object.keys(data.salespersonSales),
        datasets: [{
          label: 'Deals closed',
          data: Object.values(data.salespersonSales),
          backgroundColor: [chartColor, '#2563eb', slate, teal, '#64748b'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
      }
    });
  }

  const grossProfit = document.getElementById('grossProfitChart');
  if (grossProfit) {
    new Chart(grossProfit, {
      type: 'bar',
      data: {
        labels: Object.keys(data.grossProfit).map((name) => name.split(' ')[0]),
        datasets: [{
          label: 'Gross Profit',
          data: Object.values(data.grossProfit),
          backgroundColor: [chartColor, '#1d4ed8', slate, teal, '#64748b'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Gross Profit: R${Number(context.raw).toLocaleString('en-ZA').replace(/,/g, ' ')}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R${Number(value / 1000).toFixed(0)}k`
            }
          }
        }
      }
    });
  }

  const stockAgeing = document.getElementById('stockAgeingChart');
  if (stockAgeing) {
    new Chart(stockAgeing, {
      type: 'doughnut',
      data: {
        labels: data.stockAgeing.map((bucket) => bucket.bucket),
        datasets: [{
          data: data.stockAgeing.map((bucket) => bucket.units),
          backgroundColor: [teal, chartColor, '#f59e0b', '#dc2626'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: '62%'
      }
    });
  }
}

loadDashboardCharts().catch(() => {});
