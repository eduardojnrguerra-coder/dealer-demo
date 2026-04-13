const stockGrid = document.getElementById('stockGrid');
const filterButtons = document.querySelectorAll('[data-filter]');
const modal = document.getElementById('vehicleModal');
const closeModal = document.getElementById('closeModal');

function formatRand(value) {
  return `R${Number(value || 0).toLocaleString('en-ZA').replace(/,/g, ' ')}`;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    stockGrid.querySelectorAll('.vehicle-card').forEach((card) => {
      const show =
        filter === 'All Stock' ||
        card.dataset.status === filter ||
        (filter === 'Aging Stock' && card.dataset.aged === 'true') ||
        (filter === 'Low Margin' && card.dataset.lowMargin === 'true') ||
        (filter === 'High Margin' && card.dataset.highMargin === 'true') ||
        (filter === 'Fast Movers' && card.dataset.fastMover === 'true') ||
        (filter === 'Needs Attention' && card.dataset.needsAttention === 'true');
      card.style.display = show ? '' : 'none';
    });
  });
});

document.querySelectorAll('[data-demo-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const original = button.textContent;
    button.textContent = 'Action queued';
    button.classList.add('is-confirmed');
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove('is-confirmed');
    }, 1400);
  });
});

document.querySelectorAll('[data-open-detail]').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.vehicle-card');
    const vehicle = JSON.parse(card.dataset.vehicle);
    const profit = vehicle.profit ?? ((vehicle.selling_price || 0) - (vehicle.cost_price || 0));
    const margin = vehicle.margin ?? (vehicle.selling_price ? (profit / vehicle.selling_price) * 100 : 0);

    document.getElementById('modalStock').textContent = vehicle.stock_number;
    document.getElementById('modalTitle').textContent = `${vehicle.year} ${vehicle.make}`;
    document.getElementById('modalModel').textContent = vehicle.model;
    const modalImage = document.getElementById('modalImage');
    modalImage.src = `/static/images/${vehicle.image}`;
    modalImage.alt = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    document.getElementById('modalStats').innerHTML = [
      ['Mileage', `${Number(vehicle.mileage).toLocaleString('en-ZA').replace(/,/g, ' ')} km`],
      ['Colour', vehicle.color],
      ['Cost price', formatRand(vehicle.cost_price)],
      ['Selling price', formatRand(vehicle.selling_price)],
      ['Expected profit', formatRand(profit)],
      ['Margin', `${margin.toFixed(1)}%`],
      ['Days in stock', vehicle.days_in_stock],
      ['Status', vehicle.status]
    ].map(([label, value]) => `<div class="rounded-lg border border-slate-200 p-3"><span class="block text-xs font-bold uppercase tracking-wide text-slate-400">${label}</span><strong class="mt-1 block text-slate-950">${value ?? '-'}</strong></div>`).join('');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });
});

closeModal?.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
});

modal?.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
});
