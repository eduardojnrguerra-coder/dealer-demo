// PineX Systems Demo Charts

// Monthly Sales Chart
const monthlyCtx = document.getElementById('monthlySalesChart');
if (monthlyCtx) {
  new Chart(monthlyCtx, {
    type: 'bar',
    data: {
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [{
        label: 'Units Sold',
        data: [18, 22, 25, 21, 28, 31, 17],
        backgroundColor: '#0f4c81',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// Gross Profit Chart
const gpCtx = document.getElementById('grossProfitChart');
if (gpCtx) {
  new Chart(gpCtx, {
    type: 'bar',
    data: {
      labels: ['Lerato', 'Johan', 'Ayesha', 'Sipho', 'Megan'],
      datasets: [{
        label: 'Gross Profit (R)',
        data: [384500, 312800, 261400, 194900, 142700],
        backgroundColor: ['#0f4c81', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: '#e2e8f0' } },
        y: { grid: { display: false } }
      }
    }
  });
}

// Team Performance Chart
const teamCtx = document.getElementById('teamChart');
if (teamCtx) {
  new Chart(teamCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          label: 'Calls Made',
          data: [126, 104, 97, 88],
          borderColor: '#0f4c81',
          tension: 0.3
        },
        {
          label: 'Test Drives',
          data: [14, 12, 10, 9],
          borderColor: '#22c55e',
          tension: 0.3
        },
        {
          label: 'Deals Closed',
          data: [8, 6, 5, 4],
          borderColor: '#f59e0b',
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// Deal Funnel Chart
const funnelCtx = document.getElementById('dealFunnelChart');
if (funnelCtx) {
  new Chart(funnelCtx, {
    type: 'bar',
    data: {
      labels: ['Lead → Contact', 'Contact → Test Drive', 'Test Drive → F&I', 'F&I → Delivery'],
      datasets: [{
        label: 'Conversion %',
        data: [88, 57, 58, 57],
        backgroundColor: ['#22c55e', '#84cc16', '#eab308', '#f97316'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false } }
    }
  });
}

// Stock Ageing Chart
const ageingCtx = document.getElementById('stockAgeingChart');
if (ageingCtx) {
  new Chart(ageingCtx, {
    type: 'doughnut',
    data: {
      labels: ['0-30 days', '31-60 days', '61-90 days', '90+ days'],
      datasets: [{
        data: [9, 8, 5, 2],
        backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}