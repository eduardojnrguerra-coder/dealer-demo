const menuButton = document.getElementById('menuButton');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const quickActionButton = document.getElementById('quickActionButton');
const quickActionMenu = document.getElementById('quickActionMenu');
const globalSearch = document.getElementById('globalSearch');
const searchResults = document.getElementById('searchResults');
const searchDataElement = document.getElementById('global-search-data');

function closeSidebar() {
  sidebar?.classList.add('-translate-x-full');
  overlay?.classList.add('hidden');
}

function openSidebar() {
  sidebar?.classList.remove('-translate-x-full');
  overlay?.classList.remove('hidden');
}

menuButton?.addEventListener('click', openSidebar);
overlay?.addEventListener('click', closeSidebar);

quickActionButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  quickActionMenu?.classList.toggle('hidden');
});

document.addEventListener('click', () => {
  quickActionMenu?.classList.add('hidden');
});

const searchRecords = searchDataElement ? JSON.parse(searchDataElement.textContent) : [];

function renderSearchResults(query) {
  if (!searchResults) return;
  const value = query.trim().toLowerCase();
  if (value.length < 2) {
    searchResults.classList.add('hidden');
    searchResults.innerHTML = '';
    return;
  }

  const matches = searchRecords
    .filter((record) => record.label.toLowerCase().includes(value))
    .slice(0, 6);

  searchResults.innerHTML = matches.length
    ? matches.map((record) => `<a class="search-result" href="${record.url}"><span>${record.type}</span><strong>${record.label}</strong></a>`).join('')
    : '<div class="px-3 py-2 text-sm font-semibold text-slate-500">No matching stock, customer, or deal jacket.</div>';
  searchResults.classList.remove('hidden');
}

globalSearch?.addEventListener('input', (event) => renderSearchResults(event.target.value));

document.querySelectorAll('[data-counter]').forEach((element) => {
  const target = Number(element.dataset.counter);
  if (!Number.isFinite(target)) return;
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const duration = 700;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${prefix}${value.toLocaleString('en-ZA').replace(/,/g, ' ')}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});
