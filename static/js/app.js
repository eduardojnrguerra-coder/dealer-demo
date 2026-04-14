// PineX Systems Demo - Interactive Features

// Mobile Navigation
const menuButton = document.getElementById('menuButton');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

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

// Mobile Menus
const mobileAlertsBtn = document.getElementById('mobileAlertsBtn');
const mobileAlertsMenu = document.getElementById('mobileAlertsMenu');
const mobileQuickAction = document.getElementById('mobileQuickAction');
const mobileQuickMenu = document.getElementById('mobileQuickMenu');
const mobileOverflowBtn = document.getElementById('mobileOverflowBtn');
const mobileOverflowMenu = document.getElementById('mobileOverflowMenu');

mobileAlertsBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileAlertsMenu?.classList.toggle('hidden');
  mobileQuickMenu?.classList.add('hidden');
  mobileOverflowMenu?.classList.add('hidden');
});

mobileQuickAction?.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileQuickMenu?.classList.toggle('hidden');
  mobileAlertsMenu?.classList.add('hidden');
  mobileOverflowMenu?.classList.add('hidden');
});

mobileOverflowBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  mobileOverflowMenu?.classList.toggle('hidden');
  mobileAlertsMenu?.classList.add('hidden');
  mobileQuickMenu?.classList.add('hidden');
});

document.addEventListener('click', () => {
  mobileAlertsMenu?.classList.add('hidden');
  mobileQuickMenu?.classList.add('hidden');
  mobileOverflowMenu?.classList.add('hidden');
});

// Desktop Quick Action Menu
const quickActionButton = document.getElementById('quickActionButton');
const quickActionMenu = document.getElementById('quickActionMenu');
const notificationButton = document.getElementById('notificationButton');
const notificationMenu = document.getElementById('notificationMenu');

quickActionButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  quickActionMenu?.classList.toggle('hidden');
  notificationMenu?.classList.add('hidden');
});

notificationButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  notificationMenu?.classList.toggle('hidden');
  quickActionMenu?.classList.add('hidden');
});

document.addEventListener('click', () => {
  quickActionMenu?.classList.add('hidden');
  notificationMenu?.classList.add('hidden');
});

// Vehicle Add Modal
const addVehicleBtn = document.getElementById('addVehicleBtn');
const vehicleModal = document.getElementById('vehicleModal');
const closeModal = document.getElementById('closeModal');

if (addVehicleBtn) {
  addVehicleBtn.addEventListener('click', () => {
    vehicleModal?.classList.remove('hidden');
    vehicleModal?.classList.add('flex');
  });
}

if (closeModal) {
  closeModal.addEventListener('click', () => {
    vehicleModal?.classList.add('hidden');
    vehicleModal?.classList.remove('flex');
  });
}

// Smart Actions Panel - Vehicle Upload Simulation
const simulateUpload = document.getElementById('simulateUpload');
const uploadProgress = document.getElementById('uploadProgress');
const uploadComplete = document.getElementById('uploadComplete');

if (simulateUpload) {
  simulateUpload.addEventListener('click', () => {
    uploadProgress?.classList.remove('hidden');
    simulateUpload.disabled = true;
    simulateUpload.innerHTML = 'Uploading...';
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        uploadProgress?.classList.add('hidden');
        uploadComplete?.classList.remove('hidden');
        simulateUpload.innerHTML = 'Uploaded to AutoTrader';
      }
    }, 300);
  });
}

// Filter Functionality
const filterBtns = document.querySelectorAll('.filter-btn');
const stockGrid = document.getElementById('stockGrid');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    const cards = stockGrid?.querySelectorAll('.vehicle-card');
    
    cards?.forEach(card => {
      if (!filter || filter === 'All Stock') {
        card.classList.remove('hidden');
      } else if (filter === 'Needs Attention') {
        const hasAttention = card.dataset.needsAttention === 'true';
        hasAttention ? card.classList.remove('hidden') : card.classList.add('hidden');
      } else if (filter === 'Aging Stock') {
        const isAged = card.dataset.aged === 'true';
        isAged ? card.classList.remove('hidden') : card.classList.add('hidden');
      } else if (filter === 'Low Margin') {
        const isLow = card.dataset.lowMargin === 'true';
        isLow ? card.classList.remove('hidden') : card.classList.add('hidden');
      }
    });
  });
});

// Stage Filter
const stageFilter = document.getElementById('stageFilter');
if (stageFilter) {
  stageFilter.addEventListener('change', (e) => {
    const stage = e.target.value;
    const kanbanColumns = document.querySelectorAll('.kanban-column');
    
    kanbanColumns.forEach(col => {
      if (stage === 'All') {
        col.classList.remove('hidden');
      } else {
        const colStage = col.dataset.stage;
        colStage === stage ? col.classList.remove('hidden') : col.classList.add('hidden');
      }
    });
  });
}

// Mobile Move Deal Button
const mobileMoveDealBtn = document.querySelector('.mobileMoveDeal');
if (mobileMoveDealBtn) {
  mobileMoveDealBtn.addEventListener('click', () => {
    alert('Deal stage picker: Select new pipeline stage to move the deal.');
  });
}

// Module Toggle
const moduleToggles = document.querySelectorAll('.module-toggle');
moduleToggles.forEach(toggle => {
  toggle.addEventListener('change', (e) => {
    const module = e.target.dataset.module;
    const section = document.querySelector(`#${module}-section`);
    if (section) {
      e.target.checked ? section.classList.remove('hidden') : section.classList.add('hidden');
    }
  });
});

// Counter Animation
document.querySelectorAll('[data-counter]').forEach(element => {
  const target = Number(element.dataset.counter);
  if (!Number.isFinite(target)) return;
  
  const prefix = element.dataset.prefix || '';
  const duration = 700;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    element.textContent = `${prefix}${value.toLocaleString('en-ZA').replace(/,/g, ' ')}`;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
});

// Alert/Dismiss functionality
const dismissAlert = document.querySelectorAll('.dismiss-alert');
dismissAlert.forEach(btn => {
  btn.addEventListener('click', () => {
    const alert = btn.closest('.alert-row');
    if (alert) alert.remove();
  });
});

// Quick Actions dropdown
const quickActions = document.querySelectorAll('.quick-action-item');
quickActions.forEach(action => {
  action.addEventListener('click', () => {
    console.log('Action:', action.dataset.action);
  });
});

// Calendar Day expand
const calendarDays = document.querySelectorAll('.day-column');
calendarDays.forEach(day => {
  day.addEventListener('click', () => {
    day.classList.toggle('expanded');
  });
});

// Kanban Drag (visual only)
const kanbanCards = document.querySelectorAll('.lead-card');
kanbanCards.forEach(card => {
  card.draggable = true;
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', card.dataset.id);
    card.classList.add('opacity-50');
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('opacity-50');
  });
});

// Chart tooltips initialization
const tooltipTrigger = document.querySelectorAll('[data-chart]');
tooltipTrigger.forEach(trigger => {
  trigger.addEventListener('mouseenter', () => {
    console.log('Show chart tooltip');
  });
});

console.log('PineX Systems Demo initialized');