const stockGrid = document.getElementById('stockGrid');
const stockFilterButtons = Array.from(document.querySelectorAll('[data-stock-filter]'));
const stockRows = Array.from(document.querySelectorAll('[data-stock-row]'));
const stockCards = Array.from(document.querySelectorAll('[data-stock-item="card"]'));
const stockEmptyState = document.querySelector('[data-stock-empty]');
const stockTableEmpty = document.querySelector('[data-stock-table-empty]');
const stockTableEmptyMessage = document.querySelector('[data-stock-table-empty-message]');
const stockFilterStatus = document.querySelector('[data-stock-filter-status]');
const stockSummaryElements = Array.from(document.querySelectorAll('[data-stock-summary]')).reduce(
  (accumulator, element) => {
    accumulator[element.dataset.stockSummary] = element;
    return accumulator;
  },
  {}
);
const searchInputs = Array.from(document.querySelectorAll('.stock-search-input'));
const modal = document.getElementById('vehicleModal');
const closeModal = document.getElementById('closeModal');
const stockRowsByNumber = new Map(
  stockRows.map((row) => [row.dataset.stockNumber || '', row])
);
let activeStockFilter =
  stockFilterButtons.find((button) => button.classList.contains('active'))?.dataset.stockFilter || 'all';

function formatRand(value) {
  return `R${Number(value || 0).toLocaleString('en-ZA').replace(/,/g, ' ')}`;
}

function formatCount(value) {
  return Number(value || 0).toLocaleString('en-ZA');
}

function readBoolean(value) {
  return value === 'true';
}

function readVehicleData(card) {
  const vehicle = JSON.parse(card.dataset.vehicle || '{}');
  const status = String(card.dataset.status || vehicle.status || '').trim();
  const daysInStock = Number(card.dataset.daysInStock || vehicle.days_in_stock || 0);
  const margin = Number(card.dataset.margin || vehicle.margin || 0);
  const photoCount = Number(card.dataset.photoCount || vehicle.photo_count || 0);
  const listingCompleteness = Number(
    card.dataset.listingCompleteness || vehicle.listing_completeness || 0
  );

  return {
    ...vehicle,
    status,
    days_in_stock: daysInStock,
    margin,
    photo_count: photoCount,
    listing_completeness: listingCompleteness,
    channel_status: String(card.dataset.channelStatus || vehicle.channel_status || '').trim(),
    is_aged: readBoolean(card.dataset.aged) || daysInStock >= 60,
    is_low_margin: readBoolean(card.dataset.lowMargin) || margin < 10,
    is_high_margin: readBoolean(card.dataset.highMargin) || margin >= 15,
    is_fast_mover:
      readBoolean(card.dataset.fastMover) || (daysInStock <= 30 && status.toLowerCase() !== 'sold'),
    needs_attention: readBoolean(card.dataset.needsAttention)
  };
}

function buildSearchableText(vehicle) {
  return [
    vehicle.stock_number,
    vehicle.registration,
    vehicle.vin,
    vehicle.make,
    vehicle.model,
    vehicle.year,
    vehicle.status,
    vehicle.color
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

const stockItems = stockCards.map((card) => {
  const vehicle = readVehicleData(card);
  const stockNumber = card.dataset.stockNumber || vehicle.stock_number || '';
  return {
    stockNumber,
    card,
    row: stockRowsByNumber.get(stockNumber) || null,
    vehicle,
    searchable: buildSearchableText(vehicle)
  };
});

function getSearchTokens() {
  return searchInputs
    .map((input) => input.value.trim().toLowerCase())
    .filter(Boolean);
}

function matchesSearch(searchableText, searchTokens) {
  if (!searchTokens.length) {
    return true;
  }

  return searchTokens.every((token) => searchableText.includes(token));
}

function isNeedsAttentionVehicle(vehicle) {
  const status = String(vehicle.status || '').toLowerCase();
  const channelStatus = String(vehicle.channel_status || '').toLowerCase();
  const hasWarningStatus = ['draft', 'in recon', 'warning'].includes(status);

  if (status === 'sold') {
    return false;
  }

  return (
    Boolean(vehicle.needs_attention) ||
    Number(vehicle.photo_count || 0) < 5 ||
    Number(vehicle.listing_completeness || 0) < 85 ||
    channelStatus.includes('needs') ||
    hasWarningStatus
  );
}

function matchesStockFilter(vehicle, filterKey) {
  const status = String(vehicle.status || '').toLowerCase();
  const liveStock = status !== 'sold';

  switch (filterKey) {
    case 'needs-attention':
      return isNeedsAttentionVehicle(vehicle);
    case 'aging':
      return liveStock && (Boolean(vehicle.is_aged) || Number(vehicle.days_in_stock || 0) >= 60);
    case 'low-margin':
      return Boolean(vehicle.is_low_margin) || Number(vehicle.margin || 0) < 10;
    case 'high-margin':
      return Boolean(vehicle.is_high_margin) || Number(vehicle.margin || 0) >= 15;
    case 'fast-movers':
      return liveStock && (Boolean(vehicle.is_fast_mover) || Number(vehicle.days_in_stock || 0) <= 30);
    case 'all':
    default:
      return true;
  }
}

function setFilterButtonState(filterKey) {
  stockFilterButtons.forEach((button) => {
    const isActive = button.dataset.stockFilter === filterKey;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function updateStockSummaries(visibleItems) {
  const visibleVehicles = visibleItems.map((item) => item.vehicle);
  const activeVehicles = visibleVehicles.filter(
    (vehicle) => String(vehicle.status || '').toLowerCase() !== 'sold'
  );

  const totals = {
    totalStockValue: activeVehicles.reduce(
      (sum, vehicle) => sum + Number(vehicle.selling_price || 0),
      0
    ),
    totalPotentialProfit: activeVehicles.reduce(
      (sum, vehicle) => sum + Number(vehicle.profit || 0),
      0
    ),
    profitAtRisk: activeVehicles.reduce((sum, vehicle) => {
      if (Boolean(vehicle.is_aged) || Number(vehicle.days_in_stock || 0) >= 60) {
        return sum + Number(vehicle.profit || 0);
      }
      return sum;
    }, 0),
    totalRecords: visibleVehicles.length,
    availableFloorStock: visibleVehicles.filter((vehicle) => {
      const status = String(vehicle.status || '').toLowerCase();
      return status === 'in stock' || status === 'available';
    }).length,
    reservedUnits: visibleVehicles.filter(
      (vehicle) => String(vehicle.status || '').toLowerCase() === 'reserved'
    ).length,
    deliveryPackUnits: visibleVehicles.filter(
      (vehicle) => String(vehicle.status || '').toLowerCase() === 'sold'
    ).length
  };

  if (stockSummaryElements['total-stock-value']) {
    stockSummaryElements['total-stock-value'].textContent = formatRand(totals.totalStockValue);
  }
  if (stockSummaryElements['total-potential-profit']) {
    stockSummaryElements['total-potential-profit'].textContent = formatRand(
      totals.totalPotentialProfit
    );
  }
  if (stockSummaryElements['profit-at-risk']) {
    stockSummaryElements['profit-at-risk'].textContent = formatRand(totals.profitAtRisk);
  }
  if (stockSummaryElements['total-records']) {
    stockSummaryElements['total-records'].textContent = formatCount(totals.totalRecords);
  }
  if (stockSummaryElements['available-floor-stock']) {
    stockSummaryElements['available-floor-stock'].textContent = formatCount(
      totals.availableFloorStock
    );
  }
  if (stockSummaryElements['reserved-units']) {
    stockSummaryElements['reserved-units'].textContent = formatCount(totals.reservedUnits);
  }
  if (stockSummaryElements['delivery-pack-units']) {
    stockSummaryElements['delivery-pack-units'].textContent = formatCount(
      totals.deliveryPackUnits
    );
  }
}

function updateFilterStatus(visibleCount) {
  if (!stockFilterStatus) {
    return;
  }

  const activeLabel =
    stockFilterButtons.find((button) => button.dataset.stockFilter === activeStockFilter)?.textContent?.trim() ||
    'All Stock';
  const vehicleLabel = visibleCount === 1 ? 'vehicle' : 'vehicles';
  stockFilterStatus.textContent = `${activeLabel}: ${formatCount(visibleCount)} ${vehicleLabel} in view`;
}

function updateEmptyStates(visibleCount, visibleRowCount) {
  if (stockEmptyState) {
    stockEmptyState.hidden = visibleCount !== 0;
  }

  if (!stockTableEmpty || !stockTableEmptyMessage) {
    return;
  }

  if (visibleRowCount > 0) {
    stockTableEmpty.hidden = true;
    return;
  }

  stockTableEmpty.hidden = false;

  if (visibleCount === 0) {
    stockTableEmptyMessage.innerHTML =
      '<strong>No vehicles match this stock command right now.</strong><span>Try another filter to bring active stock back into view.</span>';
    return;
  }

  stockTableEmptyMessage.innerHTML =
    '<strong>No matching vehicles in this command table.</strong><span>Matching stock cards are still shown below for this filter.</span>';
}

function applyStockView(options = {}) {
  const { logFilter = false } = options;
  const searchTokens = getSearchTokens();
  const visibleItems = [];
  let visibleRowCount = 0;

  setFilterButtonState(activeStockFilter);

  stockItems.forEach((item) => {
    const filterMatch = matchesStockFilter(item.vehicle, activeStockFilter);
    const searchMatch = matchesSearch(item.searchable, searchTokens);
    const isVisible = filterMatch && searchMatch;

    item.card.hidden = !isVisible;

    if (item.row) {
      item.row.hidden = !isVisible;
      if (isVisible) {
        visibleRowCount += 1;
      }
    }

    if (isVisible) {
      visibleItems.push(item);
    }
  });

  updateStockSummaries(visibleItems);
  updateFilterStatus(visibleItems.length);
  updateEmptyStates(visibleItems.length, visibleRowCount);

  if (logFilter) {
    console.log('Stock filter clicked:', activeStockFilter);
    console.log('Matching vehicle count:', visibleItems.length);
  }

  return visibleItems;
}

stockFilterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeStockFilter = button.dataset.stockFilter || 'all';
    applyStockView({ logFilter: true });
  });
});

searchInputs.forEach((input) => {
  input.addEventListener('input', () => {
    applyStockView();
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
    const profit = vehicle.profit ?? (vehicle.selling_price || 0) - (vehicle.cost_price || 0);
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
    ]
      .map(
        ([label, value]) =>
          `<div class="rounded-lg border border-slate-200 p-3"><span class="block text-xs font-bold uppercase tracking-wide text-slate-400">${label}</span><strong class="mt-1 block text-slate-950">${value ?? '-'}</strong></div>`
      )
      .join('');

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

applyStockView();
