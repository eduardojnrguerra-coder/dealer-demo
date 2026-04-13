const teamCanvas = document.getElementById('teamChart');
const teamDataElement = document.getElementById('team-data');

if (teamCanvas && teamDataElement) {
  const team = JSON.parse(teamDataElement.textContent);
  new Chart(teamCanvas, {
    type: 'bar',
    data: {
      labels: team.map((person) => person.name.split(' ')[0]),
      datasets: [
        { label: 'Calls', data: team.map((person) => person.calls_made), backgroundColor: '#475569', borderRadius: 8 },
        { label: 'Test drives', data: team.map((person) => person.test_drives_booked), backgroundColor: '#0f4c81', borderRadius: 8 },
        { label: 'Closed deals', data: team.map((person) => person.deals_closed), backgroundColor: '#14b8a6', borderRadius: 8 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}
