// PineX Systems Demo - Interactive Features
console.log('Dealer tour JS version: premium-polish-1');
window.addEventListener('error', (event) => {
  console.error('Dealer tour boot error:', event.error || event.message || event);
});

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
  const isHidden = mobileAlertsMenu?.classList.toggle('hidden');
  mobileAlertsBtn.setAttribute('aria-expanded', String(!isHidden));
  mobileQuickMenu?.classList.add('hidden');
  mobileOverflowMenu?.classList.add('hidden');
});

mobileQuickAction?.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = mobileQuickMenu?.classList.toggle('hidden');
  mobileQuickAction.setAttribute('aria-expanded', String(!isHidden));
  mobileAlertsMenu?.classList.add('hidden');
  mobileOverflowMenu?.classList.add('hidden');
});

mobileOverflowBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const isHidden = mobileOverflowMenu?.classList.toggle('hidden');
  mobileOverflowBtn.setAttribute('aria-expanded', String(!isHidden));
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
  const isHidden = quickActionMenu?.classList.toggle('hidden');
  quickActionButton.setAttribute('aria-expanded', String(!isHidden));
  notificationMenu?.classList.add('hidden');
});

notificationButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  const isHidden = notificationMenu?.classList.toggle('hidden');
  notificationButton.setAttribute('aria-expanded', String(!isHidden));
  quickActionMenu?.classList.add('hidden');
});

document.addEventListener('click', () => {
  quickActionMenu?.classList.add('hidden');
  notificationMenu?.classList.add('hidden');
});

// Dashboard onboarding and guided business tour
const dashboardIntroButtons = document.querySelectorAll('[data-open-dashboard-intro]');
const tourStartupParams = new URLSearchParams(window.location.search);
const hasTourSurface = document.querySelector('[data-tour]') || dashboardIntroButtons.length > 0;
const hasStoredTourState = window.sessionStorage.getItem('pinexDashboardTourState');

  if (hasTourSurface || hasStoredTourState || tourStartupParams.get('tour') === 'welcome') {
    console.log('LIVE DASHBOARD TOUR FILE LOADED');
    window.__dealerTourController = 'app.js';
    console.log('tour init');
  const tourRouteMap = JSON.parse(document.getElementById('tour-route-data')?.textContent || '{}');
  window.DEALER_TOUR_ROUTES = tourRouteMap;
  console.log('tour route map:', tourRouteMap);
  const dashboardTourRoleKey = 'pinexDashboardTourRole';

  function normalizeTourRoleKey(roleKey) {
    const value = String(roleKey || '').trim().toLowerCase();
    if (value === 'dealer-principal' || value === 'dealer_principal' || value === 'principal') return 'owner';
    if (value === 'sales-manager' || value === 'manager') return 'sales-manager';
    if (value === 'sales-executive' || value === 'salesman' || value === 'sales-exec') return 'salesperson';
    if (value === 'workshop-manager' || value === 'workshop') return 'workshop-manager';
    return ['owner', 'sales-manager', 'salesperson', 'workshop-manager'].includes(value) ? value : 'owner';
  }

  const dashboardTourRoleConfigs = {
    owner: {
      label: 'Dealer Principal',
      focus: 'Start with revenue risk, stock exposure, lead quality, and the systems that give owners daily control.',
      order: ['dashboard-overview', 'sales-accountability', 'lead-source-tracking', 'deals', 'stock', 'integrations-hub', 'autotrader', 'cars-coza', 'meta-leads', 'lead-distribution', 'deal-files', 'fi-desk', 'quotations', 'documents', 'handover', 'finance-applications', 'customers', 'leads', 'add-vehicle', 'final-summary'],
    },
    'sales-manager': {
      label: 'Sales Manager',
      focus: 'Start with overdue follow-up risk, fair lead sharing, team accountability, and pipeline movement.',
      order: ['dashboard-overview', 'lead-distribution', 'sales-accountability', 'leads', 'deals', 'customers', 'deal-files', 'fi-desk', 'handover', 'quotations', 'documents', 'stock', 'lead-source-tracking', 'integrations-hub', 'autotrader', 'cars-coza', 'meta-leads', 'finance-applications', 'add-vehicle', 'final-summary'],
    },
    salesperson: {
      label: 'Sales Executive',
      focus: 'Start with next actions, live buyers, deal movement, customer context, and delivery readiness.',
      order: ['leads', 'deals', 'customers', 'deal-files', 'handover', 'quotations', 'documents', 'fi-desk', 'dashboard-overview', 'sales-accountability', 'lead-source-tracking', 'lead-distribution', 'stock', 'integrations-hub', 'autotrader', 'cars-coza', 'meta-leads', 'finance-applications', 'add-vehicle', 'final-summary'],
    },
    'workshop-manager': {
      label: 'Workshop Manager',
      focus: 'Start with delivery readiness, deal-file blockers, finance dependencies, stock flow, and the operational bottlenecks that delay handover.',
      order: ['handover', 'deal-files', 'fi-desk', 'stock', 'dashboard-overview', 'deals', 'customers', 'leads', 'sales-accountability', 'lead-distribution', 'lead-source-tracking', 'integrations-hub', 'autotrader', 'cars-coza', 'meta-leads', 'finance-applications', 'quotations', 'documents', 'add-vehicle', 'final-summary'],
    },
  };

  let selectedTourRoleKey = normalizeTourRoleKey(
    tourStartupParams.get('role') || window.sessionStorage.getItem(dashboardTourRoleKey) || 'owner'
  );
  window.sessionStorage.setItem(dashboardTourRoleKey, selectedTourRoleKey);

  function getSelectedTourRole() {
    return dashboardTourRoleConfigs[selectedTourRoleKey] || dashboardTourRoleConfigs.owner;
  }

  function orderTourStepDefinitionsForRole(stepDefinitions, roleKey) {
    const roleConfig = dashboardTourRoleConfigs[normalizeTourRoleKey(roleKey)] || dashboardTourRoleConfigs.owner;
    const order = roleConfig.order || [];
    const definitionMap = new Map(stepDefinitions.map((step) => [step.id, step]));
    const ordered = [];

    order.forEach((stepId) => {
      const step = definitionMap.get(stepId);
      if (step) {
        ordered.push(step);
        definitionMap.delete(stepId);
      }
    });

    stepDefinitions.forEach((step) => {
      if (definitionMap.has(step.id)) {
        ordered.push(step);
      }
    });

    return ordered;
  }

  const dashboardTourStepDefinitions = [
    {
      id: 'dashboard-overview',
      routeKey: 'dashboard',
      selector: '[data-tour="dashboard-overview"]',
      fallbackSelector: '[data-tour="dashboard-overview"]',
      title: 'Dashboard Overview',
      description: 'This dashboard gives owners and managers one live control room for today\'s sales pace, stock pressure, team execution, and operational blockers.',
      ownerValue: 'Instead of chasing updates through WhatsApp groups, desks, and spreadsheets, you can see where money is moving, where it is leaking, and where intervention is needed.',
      easeValue: 'The most important numbers, warnings, and actions are grouped into clear blocks so decisions can be made in seconds.',
    },
    {
      id: 'lead-source-tracking',
      routeKey: 'dashboard',
      selector: '[data-tour="lead-source-tracking"]',
      fallbackSelector: '[data-tour="dashboard-overview"]',
      title: 'Lead Source Tracking',
      description: 'This system can capture and label leads by source, so your dealership can see whether buyers came from website forms, social media ads, Google campaigns, WhatsApp, referrals, walk-ins, or manual entry.',
      ownerValue: 'You can finally see which channels are producing real opportunities and which ones are wasting budget.',
      easeValue: 'Each source is clearly tagged, summarised, and easy to scan without digging through multiple platforms.',
      bullets: ['Website', 'Meta Ads', 'Google Ads', 'WhatsApp', 'Walk-in', 'Referral'],
    },
    {
      id: 'lead-distribution',
      routeKey: 'dashboard',
      selector: '[data-tour="lead-distribution"]',
      fallbackSelector: '[data-tour="dashboard-overview"]',
      title: 'Lead Distribution / fair sharing between sales staff',
      description: 'Leads can be assigned automatically or manually, depending on how the dealership operates. They can be shared equally between salespeople, routed by branch, or reassigned if no action is taken.',
      ownerValue: 'This reduces missed leads, removes confusion, and helps prevent unfair lead allocation between staff.',
      easeValue: 'Managers can use simple assignment rules instead of trying to manage distribution informally.',
      bullets: ['Round-robin allocation', 'Manual manager assignment', 'Branch-based assignment', 'Vehicle/category-based assignment', 'Reassign after no response'],
    },
    {
      id: 'sales-accountability',
      routeKey: 'dashboard',
      selector: '[data-tour="sales-accountability"]',
      fallbackSelector: '[data-tour="dashboard-overview"]',
      title: 'Sales Accountability',
      description: 'The system shows which salesperson received the lead, how quickly they responded, whether follow-up happened, and how their pipeline is converting.',
      ownerValue: 'Owners and managers can clearly see who is working their leads properly and where deals are being lost.',
      easeValue: 'Response time, overdue follow-ups, conversion, and closed deals are shown in one table.',
      bullets: ['Leads assigned', 'Response time', 'Follow-up overdue', 'Conversion rate', 'Deals closed'],
    },
    {
      id: 'leads',
      routeKey: 'leads',
      selector: '[data-tour="leads-main"]',
      fallbackSelector: '[data-tour="nav-leads"]',
      title: 'Leads',
      description: 'This page gives Sales Executives and managers a clean queue of the buyer actions that matter most right now, especially new, hot, and overdue enquiries.',
      ownerValue: 'It stops valuable enquiries from disappearing into inboxes, WhatsApp threads, or manual notes, which protects response time, lead ownership, and month-end revenue.',
      easeValue: 'The action flow is straightforward, so the team can move from capture to follow-up without extra admin or hunting for context.',
    },
    {
      id: 'deals',
      routeKey: 'deals',
      selector: '[data-tour="deals-main"]',
      fallbackSelector: '[data-tour="nav-deals"]',
      title: 'Deals',
      description: 'Deal Flow keeps negotiation, finance progress, and delivery movement visible from first serious conversation through to sold.',
      ownerValue: 'Management can quickly see where deals are stalling, where gross profit is under pressure, and where revenue is at risk before the month closes.',
      easeValue: 'It is designed to be read quickly, so the team can act immediately instead of searching through notes, files, and side conversations.',
    },
    {
      id: 'deal-files',
      routeKey: 'deal_files',
      selector: '[data-tour="deal-files-main"]',
      fallbackSelector: '[data-tour="nav-deals"]',
      title: 'Deal Files',
      description: 'Deal Files bring buyer details, trade-in position, document status, and next operational action into one working file.',
      ownerValue: 'This keeps sales, F&I, and admin aligned on the same deal instead of handing information around informally.',
      easeValue: 'The latest buyer position is visible the moment the file opens, which keeps handover and follow-up simple.',
    },
    {
      id: 'fi-desk',
      routeKey: 'fi_desk',
      selector: '[data-tour="fi-desk-main"]',
      fallbackSelector: '[data-tour="nav-fi-desk"]',
      title: 'F&I Desk',
      description: 'The F&I Desk keeps approvals, missing documents, settlement figures, and bank progress visible while deals are moving.',
      ownerValue: 'That gives owners and managers control over the finance bottlenecks that slow deliveries and hurt close rate.',
      easeValue: 'The queue is easy to scan, so F&I and sales can move quickly without chasing status manually.',
    },
    {
      id: 'quotations',
      routeKey: 'quotations',
      selector: '[data-tour="quotations-main"]',
      fallbackSelector: '[data-tour="module-main"]',
      title: 'Quotations',
      description: 'Quotations structure the deal properly with pricing, trade-in allowance, settlement figure, Lic & Reg, and buyer-ready numbers.',
      ownerValue: 'This gives the dealership more consistency in how deals are presented and protects margin discipline.',
      easeValue: 'The team can prepare a professional quote without jumping between calculators and paper notes.',
    },
    {
      id: 'documents',
      routeKey: 'documents',
      selector: '[data-tour="documents-main"]',
      fallbackSelector: '[data-tour="module-main"]',
      title: 'Invoices / Documents',
      description: 'This area tracks invoices, supporting documents, Delivery Pack items, and document gaps before handover.',
      ownerValue: 'It reduces last-minute admin surprises and keeps the business tighter on compliance and delivery readiness.',
      easeValue: 'Missing items are obvious, so staff know what to request next without digging through email chains.',
    },
    {
      id: 'handover',
      routeKey: 'handover',
      selector: '[data-tour="handover-main"]',
      fallbackSelector: '[data-tour="nav-deals"]',
      title: 'Handover Board',
      description: 'The Handover Board shows sold units moving through payment, Roadworthy, Lic & Reg, F&I completion, and final delivery booking.',
      ownerValue: 'That gives management a live view of delivery risk instead of finding problems only on handover day.',
      easeValue: 'Everything needed for the next delivery step is visible in one operational board.',
    },
    {
      id: 'stock',
      routeKey: 'stock',
      selector: '[data-tour="stock-main"]',
      fallbackSelector: '[data-tour="nav-stock"]',
      title: 'All Vehicles / Stock',
      description: 'The stock area helps the dealership manage inventory, ageing units, margins, and listing readiness.',
      ownerValue: 'This gives the owner better control over floor stock exposure, pricing pressure, and slow movers.',
      easeValue: 'Vehicles, filters, and actions are grouped clearly so sales and management can work from one view.',
    },
    {
      id: 'add-vehicle',
      routeKey: 'add_vehicle',
      selector: '[data-tour="add-vehicle-main"]',
      fallbackSelector: '[data-tour="nav-add-vehicle"]',
      title: 'Add Vehicle',
      description: 'New units can be added into the system in a structured way so stock records stay accurate from day one.',
      ownerValue: 'It improves stock discipline and reduces admin mistakes before a vehicle even reaches the sales floor.',
      easeValue: 'The workflow is straightforward and designed for normal dealership admin, not technical users.',
    },
    {
      id: 'integrations-hub',
      routeKey: 'integrations',
      selector: '[data-tour="integrations-main"]',
      fallbackSelector: '[data-tour="autotrader-main"]',
      title: 'Integrations Hub',
      description: 'This page brings together the systems that connect stock platforms, marketing enquiries, and dealership operations into one controlled workflow.',
      ownerValue: 'Owners can see how AutoTrader, Cars.co.za, Meta Leads, and finance workflows support the business without forcing the team into disconnected tools, duplicated admin, or blind spots.',
      easeValue: 'Each connector is presented clearly, so it is easy to understand what is live, what is planned, and how it reduces daily admin pressure.',
    },
    {
      id: 'autotrader',
      routeKey: 'integrations',
      selector: '[data-tour="autotrader-main"]',
      fallbackSelector: '[data-tour="integrations-main"]',
      title: 'AutoTrader Integration',
      description: 'This integration helps sync dealership stock to AutoTrader and monitor listing readiness, missing photos, and publishing status.',
      ownerValue: 'It reduces manual admin, improves listing consistency, and helps the dealership get stock in front of buyers faster.',
      easeValue: 'The team can quickly see what is ready to publish and what still needs attention.',
    },
    {
      id: 'cars-coza',
      routeKey: 'integrations',
      selector: '[data-tour="cars-main"]',
      fallbackSelector: '[data-tour="integrations-main"]',
      title: 'Cars.co.za Integration',
      description: 'This section helps manage stock visibility for Cars.co.za and ensures vehicle information is complete before publication.',
      ownerValue: 'More accurate listings mean better visibility, better enquiries, and less wasted admin time.',
      easeValue: 'The stock team can spot listing gaps early and keep publication standards consistent.',
    },
    {
      id: 'meta-leads',
      routeKey: 'integrations',
      selector: '[data-tour="meta-leads-main"]',
      fallbackSelector: '[data-tour="integrations-main"]',
      title: 'Meta Leads',
      description: 'Meta Leads can feed enquiries from Facebook and Instagram campaigns into the dealership workflow.',
      ownerValue: 'The dealership can track ad-driven leads properly, respond faster, and stop valuable enquiries from being lost.',
      easeValue: 'Leads arrive into the same operating flow instead of being copied manually from ad tools.',
    },
    {
      id: 'finance-applications',
      routeKey: 'finance_applications',
      selector: '[data-tour="finance-applications-module-main"]',
      fallbackSelector: '[data-tour="nav-fi-desk"]',
      title: 'Finance Applications',
      description: 'This section keeps finance-related buyer progress visible so the team can track approvals, pending requirements, and deal momentum.',
      ownerValue: 'Finance delays often slow deals down, so keeping this visible improves control and follow-up.',
      easeValue: 'Sales, F&I, and admin can work from the same deal position without separate status chasing.',
    },
    {
      id: 'customers',
      routeKey: 'customers',
      selector: '[data-tour="customers-main"]',
      fallbackSelector: '[data-tour="nav-customers"]',
      title: 'Customers',
      description: 'Customer records connect buyer details, notes, deal history, follow-up activity, and linked enquiries from every major channel.',
      ownerValue: 'This improves handover between staff, follow-up quality, retention, and owner visibility because the latest customer position is not trapped in one person\'s inbox, notebook, or memory.',
      easeValue: 'The team can open one customer record and understand the latest position immediately without checking multiple systems.',
    },
    {
      id: 'final-summary',
      routeKey: null,
      selector: null,
      fallbackSelector: null,
      title: 'What this changes for the dealership',
      description: 'This is why a dealership owner would pay for PineX: one operating system that turns lost enquiries, stuck deals, finance delays, ageing stock, and handover confusion into visible, manageable work.',
      ownerValue: 'That means fewer lost enquiries, better lead ownership, faster deal movement, cleaner handovers, stronger stock visibility, less admin confusion, and better accountability across the whole team.',
      easeValue: 'Instead of buying another reporting layer that staff ignore, the team works from one clear operating rhythm that is easier to manage, easier to monitor, and easier to grow.',
      bullets: [
        'Fewer lost enquiries',
        'Better lead ownership',
        'Faster deal movement',
        'Cleaner handovers',
        'Better stock visibility',
        'Stronger owner control',
        'Less admin confusion',
        'Better accountability'
      ],
    }
  ];

  const dashboardStorageKey = 'pinexDashboardTourSkipped';
  const dashboardSessionKey = 'pinexDashboardTourSeen';
  const dashboardTourStateKey = 'pinexDashboardTourState';
  const dashboardTourLoadingKey = 'pinexDashboardTourLoading';
  let dashboardTourIndex = -1;
  let dashboardTourDom = null;
  let skipLinkState = null;
  let tourTransitionStartedAt = 0;
  let activeTourTarget = null;
  let routeLoadingTimer = null;
  const warmedTourRoutes = new Set();

  function normalizeTourRoute(route) {
    if (!route) return '/';
    const trimmed = route.replace(/\/+$/, '');
    return trimmed || '/';
  }

  function getCurrentTourPathname() {
    return normalizeTourRoute(window.location.pathname);
  }

  function resolveTourRouteKey(routeKey) {
    if (!routeKey) {
      return null;
    }
    return tourRouteMap[routeKey] || null;
  }

  function resolveTourStepRoute(step) {
    if (!step || typeof step !== 'object') return null;

    if (typeof step.route === 'string' && step.route.trim()) {
      return normalizeTourRoute(step.route.trim());
    }

    const mappedRoute = resolveTourRouteKey(step.routeKey);
    if (typeof mappedRoute === 'string' && mappedRoute.trim()) {
      return normalizeTourRoute(mappedRoute.trim());
    }

    const currentPath = getCurrentTourPathname();
    const isDashboardStep =
      step.routeKey === 'dashboard' ||
      step.id === 'dashboard-overview' ||
      step.id === 'lead-source-tracking' ||
      step.id === 'lead-distribution' ||
      step.id === 'sales-accountability';

    if (isDashboardStep) {
      if (currentPath === '/dashboard') {
        return currentPath;
      }

      const dashboardRoute = resolveTourRouteKey('dashboard');
      if (typeof dashboardRoute === 'string' && dashboardRoute.trim()) {
        return normalizeTourRoute(dashboardRoute.trim());
      }

      return '/dashboard';
    }

    return null;
  }

  const orderedDashboardTourDefinitions = orderTourStepDefinitionsForRole(dashboardTourStepDefinitions, selectedTourRoleKey);

  const dashboardTourSteps = orderedDashboardTourDefinitions.map((step) => ({
      ...step,
    route: resolveTourStepRoute(step),
    target: step.selector,
    whatItDoes: step.description,
    whyItMatters: step.ownerValue,
    easyToUse: step.easeValue,
  }));

  console.log('tour steps resolved:', dashboardTourSteps.map((step) => ({
    id: step.id,
    title: step.title,
    routeKey: step.routeKey,
    route: step.route,
    selector: step.selector,
  })));
  console.log('TOUR STEP ARRAY:', dashboardTourSteps);
  console.log('STEP CHECK - Sales Accountability:', dashboardTourSteps.find((step) => step.id === 'sales-accountability'));
  console.log('STEP CHECK - Leads:', dashboardTourSteps.find((step) => step.id === 'leads'));
  console.log('STEP CHECK - Deals:', dashboardTourSteps.find((step) => step.id === 'deals'));
  console.log('STEP CHECK - Customers:', dashboardTourSteps.find((step) => step.id === 'customers'));
  console.log('STEP CHECK - Integrations Hub:', dashboardTourSteps.find((step) => step.id === 'integrations-hub'));
  console.table(dashboardTourSteps.map((step) => ({
    id: step.id,
    title: step.title,
    route: step.route || '(current page)',
    selector: step.selector || '(none)',
  })));

  function readDashboardTourState() {
    try {
      const raw = window.sessionStorage.getItem(dashboardTourStateKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('tour state read failed', error);
      return null;
    }
  }

  function writeDashboardTourState(index) {
    window.sessionStorage.setItem(dashboardTourStateKey, JSON.stringify({ active: true, index }));
  }

  function clearDashboardTourState() {
    window.sessionStorage.removeItem(dashboardTourStateKey);
    window.sessionStorage.removeItem(dashboardTourLoadingKey);
  }

  function logTourTransitionDuration(label) {
    if (!tourTransitionStartedAt) return;
    const duration = Math.round(performance.now() - tourTransitionStartedAt);
    console.log(`Tour transition time (${label}): ${duration}ms`);
    tourTransitionStartedAt = 0;
  }

  function getFirstGuidedStepIndex() {
    const firstIndex = dashboardTourSteps.findIndex((step) => step.id === 'dashboard-overview');
    return firstIndex >= 0 ? firstIndex : 0;
  }

  function getFirstRealTourStepIndex() {
    return dashboardTourSteps.findIndex((step) => {
      if (!step || typeof step !== 'object') return false;
      if (step.id === 'welcome') return false;
      if (step.type === 'welcome') return false;
      if (step.isWelcome === true) return false;
      if (step.hidden === true) return false;
      if (step.isHidden === true) return false;
      if (step.isSentinel === true) return false;
      if (step.id === 'final-summary') return false;
      return true;
    });
  }

  function suspendSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    if (!skipLink || skipLinkState) return;
    skipLinkState = {
      element: skipLink,
      tabindex: skipLink.getAttribute('tabindex'),
      ariaHidden: skipLink.getAttribute('aria-hidden')
    };
    skipLink.setAttribute('tabindex', '-1');
    skipLink.setAttribute('aria-hidden', 'true');
  }

  function restoreSkipLink() {
    if (!skipLinkState?.element) return;
    if (skipLinkState.tabindex === null) {
      skipLinkState.element.removeAttribute('tabindex');
    } else {
      skipLinkState.element.setAttribute('tabindex', skipLinkState.tabindex);
    }
    if (skipLinkState.ariaHidden === null) {
      skipLinkState.element.removeAttribute('aria-hidden');
    } else {
      skipLinkState.element.setAttribute('aria-hidden', skipLinkState.ariaHidden);
    }
    skipLinkState = null;
  }

  function buildDashboardTourDom() {
    try {
      const welcomeBackdrop = document.createElement('div');
      welcomeBackdrop.className = 'tour-welcome-backdrop hidden';

      const welcomeModal = document.createElement('section');
      welcomeModal.className = 'tour-welcome-modal hidden';
      welcomeModal.setAttribute('role', 'dialog');
      welcomeModal.setAttribute('aria-modal', 'true');
      welcomeModal.setAttribute('aria-labelledby', 'tourWelcomeTitle');
      welcomeModal.innerHTML = `
        <p class="tour-modal-label">Dealer onboarding</p>
        <h2 id="tourWelcomeTitle">Welcome to the Dealer Control Room</h2>
        <p class="tour-modal-copy">This system helps you run your dealership from one place, giving you visibility over stock, leads, deals, customer follow-ups, documents, and daily performance.</p>
        <p class="tour-modal-copy">You will now be guided step by step through the system so you can see how easy it is to use and why it helps dealership owners stay in control.</p>
        <div class="tour-role-summary">
          <p class="tour-role-label">Demo focus</p>
          <strong data-tour-role-title>${getSelectedTourRole().label}</strong>
          <p data-tour-role-focus>${getSelectedTourRole().focus}</p>
        </div>
        <div class="tour-modal-actions">
          <button type="button" data-tour-action="start" onclick="window.__dealerTourStart && window.__dealerTourStart(event)">Start Guided Tour</button>
          <button type="button" data-tour-action="enter">Enter Dashboard</button>
          <button type="button" data-tour-action="skip">Skip</button>
        </div>
      `;
      console.log('welcome modal rendered');

      const stepOverlay = document.createElement('div');
      stepOverlay.className = 'tour-overlay hidden';
      stepOverlay.setAttribute('aria-hidden', 'true');

      const highlightBox = document.createElement('div');
      highlightBox.className = 'tour-highlight-box hidden';
      highlightBox.setAttribute('aria-hidden', 'true');

      const routeLoading = document.createElement('div');
      routeLoading.className = 'tour-route-loading hidden';
      routeLoading.innerHTML = `
        <div class="tour-route-loading-card">
          <span class="tour-loading-dot" aria-hidden="true"></span>
          <strong data-tour-loading-label>Opening next guided step...</strong>
        </div>
      `;

      const stepCard = document.createElement('aside');
      stepCard.className = 'tour-step-card hidden';
      stepCard.innerHTML = `
        <div class="tour-progress-bar" aria-hidden="true"><span data-tour-progress-bar></span></div>
        <div class="tour-step-content" data-tour-content>
          <p class="tour-step-label" data-tour-progress>Step 1 of ${dashboardTourSteps.length}</p>
          <h3 data-tour-title>Dashboard Overview</h3>
          <div class="tour-copy-block">
            <p class="tour-copy-heading">What it does</p>
            <p class="tour-copy" data-tour-description></p>
          </div>
          <div class="tour-copy-block">
            <p class="tour-copy-heading">Why it matters</p>
            <p class="tour-copy" data-tour-owner></p>
          </div>
          <div class="tour-copy-block">
            <p class="tour-copy-heading">Easy to use</p>
            <p class="tour-copy" data-tour-ease></p>
          </div>
          <p class="tour-fallback-note hidden" data-tour-fallback-note></p>
          <ul class="tour-step-list hidden" data-tour-bullets></ul>
        </div>
        <div class="tour-step-footer">
          <div class="tour-step-actions">
            <button type="button" data-tour-action="back" class="tour-secondary-btn">Back</button>
            <button type="button" data-tour-action="next" class="tour-primary-btn">Next</button>
            <button type="button" data-tour-action="restart" class="tour-secondary-btn hidden">Restart Tour</button>
            <button type="button" data-tour-action="finish" class="tour-link-btn">Skip Tour</button>
          </div>
        </div>
      `;
      console.log('step card created');

      document.body.append(welcomeBackdrop, welcomeModal, stepOverlay, highlightBox, routeLoading, stepCard);
      console.log('welcome modal appended to DOM');
      console.log('step card appended to DOM');

      const directStartButton = welcomeModal.querySelector('[data-tour-action="start"]');
      if (directStartButton) {
        directStartButton.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          startGuidedTour();
        };
      }

      return {
        welcomeBackdrop,
        welcomeModal,
        stepOverlay,
        highlightBox,
        routeLoading,
        routeLoadingLabel: routeLoading.querySelector('[data-tour-loading-label]'),
        stepCard,
        progress: stepCard.querySelector('[data-tour-progress]'),
        progressBar: stepCard.querySelector('[data-tour-progress-bar]'),
        title: stepCard.querySelector('[data-tour-title]'),
        description: stepCard.querySelector('[data-tour-description]'),
        ownerValue: stepCard.querySelector('[data-tour-owner]'),
        easeValue: stepCard.querySelector('[data-tour-ease]'),
        roleTitle: welcomeModal.querySelector('[data-tour-role-title]'),
        roleFocus: welcomeModal.querySelector('[data-tour-role-focus]'),
        fallbackNote: stepCard.querySelector('[data-tour-fallback-note]'),
        bullets: stepCard.querySelector('[data-tour-bullets]'),
        backButton: stepCard.querySelector('[data-tour-action="back"]'),
        nextButton: stepCard.querySelector('[data-tour-action="next"]'),
        restartButton: stepCard.querySelector('[data-tour-action="restart"]'),
        finishButton: stepCard.querySelector('[data-tour-action="finish"]')
      };
    } catch (error) {
      console.error('tour modal creation failed', error);
      return null;
    }
  }

  function cleanupWelcomeQuery() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') !== 'welcome' && !params.get('role')) return;
    params.delete('tour');
    params.delete('role');
    const cleanQuery = params.toString();
    const nextUrl = cleanQuery ? `${window.location.pathname}?${cleanQuery}` : window.location.pathname;
    window.history.replaceState({}, '', nextUrl);
  }

  function setDashboardSessionSeen() {
    window.sessionStorage.setItem(dashboardSessionKey, 'true');
  }

  function showRouteLoading(label = 'Opening next guided step...') {
    if (!dashboardTourDom?.routeLoading) return;
    if (routeLoadingTimer) {
      window.clearTimeout(routeLoadingTimer);
    }
    routeLoadingTimer = window.setTimeout(() => {
      dashboardTourDom.routeLoadingLabel.textContent = label;
      dashboardTourDom.routeLoading.classList.remove('hidden');
      routeLoadingTimer = null;
    }, 90);
  }

  function hideRouteLoading() {
    if (!dashboardTourDom?.routeLoading) return;
    if (routeLoadingTimer) {
      window.clearTimeout(routeLoadingTimer);
      routeLoadingTimer = null;
    }
    dashboardTourDom.routeLoading.classList.add('hidden');
    window.sessionStorage.removeItem(dashboardTourLoadingKey);
  }

  function warmTourRoutes() {
    const criticalRouteKeys = ['leads', 'deals', 'deal_files', 'fi_desk', 'stock', 'integrations', 'customers'];
    criticalRouteKeys.forEach((routeKey) => {
      const route = resolveTourRouteKey(routeKey);
      if (!route || warmedTourRoutes.has(route)) return;

      const prefetchLink = document.createElement('link');
      prefetchLink.rel = 'prefetch';
      prefetchLink.href = route;
      prefetchLink.as = 'document';
      document.head.append(prefetchLink);
      warmedTourRoutes.add(route);
    });
  }

  function hideWelcomeModal() {
    if (!dashboardTourDom) return;
    dashboardTourDom.welcomeBackdrop.classList.add('hidden');
    dashboardTourDom.welcomeModal.classList.add('hidden');
    restoreSkipLink();
  }

  function clearTourHighlight() {
    if (!dashboardTourDom) return;
    dashboardTourDom.highlightBox.classList.add('hidden');
    if (activeTourTarget) {
      activeTourTarget.classList.remove('tour-target-active');
      activeTourTarget = null;
    }
  }

  function hideStepFlow() {
    if (!dashboardTourDom) return;
    dashboardTourDom.stepOverlay.classList.add('hidden');
    dashboardTourDom.stepCard.classList.add('hidden');
    dashboardTourDom.stepCard.classList.remove('centered');
    clearTourHighlight();
  }

  function finishDashboardTour() {
    hideStepFlow();
    hideWelcomeModal();
    hideRouteLoading();
    clearDashboardTourState();
    dashboardTourIndex = -1;
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  }

  function logWelcomeModalState() {
    console.log('welcome modal exists:', !!document.querySelector('.tour-welcome-modal'));
    console.log('step card exists:', !!document.querySelector('.tour-step-card'));
    if (dashboardTourDom?.welcomeModal) {
      const styles = window.getComputedStyle(dashboardTourDom.welcomeModal);
      console.log('welcome modal styles:', {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity
      });
    }
  }

  function focusIntoWelcomeModal() {
    const startButton = dashboardTourDom?.welcomeModal?.querySelector('[data-tour-action="start"]');
    if (!startButton) return;
    const active = document.activeElement;
    if (active && active !== document.body && !dashboardTourDom.welcomeModal.contains(active) && typeof active.blur === 'function') {
      active.blur();
    }
    startButton.focus({ preventScroll: true });
    console.log('focus moved into modal');
    console.log('active element:', document.activeElement);
  }

  function showWelcomeModal(forceOpen = false) {
    const startButton = dashboardTourDom?.welcomeModal?.querySelector('[data-tour-action="start"]');
    if (!dashboardTourDom?.welcomeModal || !dashboardTourDom?.welcomeBackdrop || !startButton) {
      console.warn('welcome modal missing - aborting tour startup');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const forcedByQuery = params.get('tour') === 'welcome';
    const skipped = window.localStorage.getItem(dashboardStorageKey) === 'true';
    const seenThisSession = window.sessionStorage.getItem(dashboardSessionKey) === 'true';
    if (!forceOpen && getCurrentTourPathname() !== '/dashboard' && !forcedByQuery) {
      return;
    }
    if (!forceOpen && !forcedByQuery && (skipped || seenThisSession)) {
      return;
    }

    hideStepFlow();
    hideRouteLoading();
    cleanupWelcomeQuery();
    suspendSkipLink();
    if (dashboardTourDom.roleTitle) {
      dashboardTourDom.roleTitle.textContent = getSelectedTourRole().label;
    }
    if (dashboardTourDom.roleFocus) {
      dashboardTourDom.roleFocus.textContent = getSelectedTourRole().focus;
    }
    dashboardTourDom.welcomeBackdrop.classList.remove('hidden');
    dashboardTourDom.welcomeModal.classList.remove('hidden');
    console.log('welcome modal made visible');
    logWelcomeModalState();

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(focusIntoWelcomeModal);
    });
  }

  function positionHighlightBox(target) {
    if (!dashboardTourDom || !target) return;
    const rect = target.getBoundingClientRect();
    const inset = window.innerWidth < 768 ? 4 : 6;
    const left = Math.max(8, rect.left - inset);
    const top = Math.max(8, rect.top - inset);
    const right = Math.min(window.innerWidth - 8, rect.right + inset);
    const bottom = Math.min(window.innerHeight - 8, rect.bottom + inset);
    dashboardTourDom.highlightBox.style.left = `${left}px`;
    dashboardTourDom.highlightBox.style.top = `${top}px`;
    dashboardTourDom.highlightBox.style.width = `${Math.max(0, right - left)}px`;
    dashboardTourDom.highlightBox.style.height = `${Math.max(0, bottom - top)}px`;
    dashboardTourDom.highlightBox.classList.remove('hidden');
    if (activeTourTarget && activeTourTarget !== target) {
      activeTourTarget.classList.remove('tour-target-active');
    }
    activeTourTarget = target;
    activeTourTarget.classList.add('tour-target-active');
  }

  function positionStepCard(target, centered = false) {
    if (!dashboardTourDom) return;
    const { stepCard } = dashboardTourDom;
    const padding = 20;

    if (window.innerWidth < 1024) {
      stepCard.classList.remove('centered');
      stepCard.style.left = `${padding}px`;
      stepCard.style.right = `${padding}px`;
      stepCard.style.top = `${padding}px`;
      stepCard.style.bottom = `${padding}px`;
      stepCard.style.width = 'auto';
      return;
    }

    if (centered || !target) {
      stepCard.classList.add('centered');
      stepCard.style.left = '';
      stepCard.style.top = '';
      stepCard.style.right = '';
      stepCard.style.bottom = '';
      stepCard.style.width = '';
      return;
    }

    stepCard.classList.remove('centered');
    const gap = 18;
    const rect = target.getBoundingClientRect();
    const cardRect = stepCard.getBoundingClientRect();
    const cardWidth = cardRect.width || 420;
    const cardHeight = cardRect.height || Math.min(520, window.innerHeight - (padding * 2));
    const fitsRight = rect.right + gap + cardWidth <= window.innerWidth - padding;
    const fitsLeft = rect.left - gap - cardWidth >= padding;
    const fitsBelow = rect.bottom + gap + cardHeight <= window.innerHeight - padding;
    const fitsAbove = rect.top - gap - cardHeight >= padding;

    let left = null;
    let top = null;

    if (fitsRight || fitsLeft) {
      left = fitsRight ? rect.right + gap : rect.left - gap - cardWidth;
      top = rect.top + (rect.height / 2) - (cardHeight / 2);
    } else if (fitsBelow || fitsAbove) {
      left = rect.left + (rect.width / 2) - (cardWidth / 2);
      top = fitsBelow ? rect.bottom + gap : rect.top - gap - cardHeight;
      const maxLeft = window.innerWidth - padding - cardWidth;
      if (left < padding) left = padding;
      if (left > maxLeft) {
        left = Math.max(padding, maxLeft);
      }
    } else {
      positionStepCard(null, true);
      return;
    }

    if (top < padding) top = padding;
    const maxTop = window.innerHeight - padding - cardHeight;
    if (top > maxTop) {
      top = Math.max(padding, maxTop);
    }

    stepCard.style.left = `${left}px`;
    stepCard.style.top = `${top}px`;
    stepCard.style.right = 'auto';
    stepCard.style.bottom = 'auto';
    stepCard.style.width = '';
  }

  function getTourTarget(step, options = {}) {
    const { allowFallback = true } = options;
    if (!step?.selector && !step?.fallbackSelector) {
      console.log('Tour target lookup:', {
        stepTitle: step?.title || '(unknown)',
        selectorUsed: null,
        targetFound: false,
        dimensions: null,
        fallbackUsed: false
      });
      return { target: null, usedFallback: false };
    }

    if (step.selector) {
      const exactTarget = document.querySelector(step.selector);
      if (exactTarget) {
        const rect = exactTarget.getBoundingClientRect();
        console.log('Tour target lookup:', {
          stepTitle: step.title,
          selectorUsed: step.selector,
          targetFound: true,
          dimensions: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            top: Math.round(rect.top),
            left: Math.round(rect.left)
          },
          fallbackUsed: false
        });
        return { target: exactTarget, usedFallback: false };
      }
    }

    if (allowFallback && step.fallbackSelector) {
      const fallbackTarget = document.querySelector(step.fallbackSelector);
      if (fallbackTarget) {
        const rect = fallbackTarget.getBoundingClientRect();
        console.warn('Fallback target used on correct page:', step.fallbackSelector, 'for step', step.id);
        console.log('Tour target lookup:', {
          stepTitle: step.title,
          selectorUsed: step.fallbackSelector,
          targetFound: true,
          dimensions: {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            top: Math.round(rect.top),
            left: Math.round(rect.left)
          },
          fallbackUsed: true
        });
        return { target: fallbackTarget, usedFallback: true };
      }
    }

    console.warn('Tour target not found for step on current route:', step.id);
    console.log('Tour target lookup:', {
      stepTitle: step.title,
      selectorUsed: step.selector || step.fallbackSelector || null,
      targetFound: false,
      dimensions: null,
      fallbackUsed: false
    });
    return { target: null, usedFallback: false };
  }

  function isTargetMostlyInView(target) {
    if (!target) return false;
    const rect = target.getBoundingClientRect();
    return rect.top >= 80 && rect.bottom <= (window.innerHeight - 80);
  }

  function goToTourStep(index) {
      const step = dashboardTourSteps[index];
      if (!step) {
        console.error('goToTourStep aborted: missing step at index', index);
        return;
      }
      console.log('goToTourStep called', index);
      const previousStep = dashboardTourSteps[dashboardTourIndex] || null;
      const currentPathname = getCurrentTourPathname();
      const targetRoute = resolveTourStepRoute(step);
      tourTransitionStartedAt = performance.now();
      writeDashboardTourState(index);
      dashboardTourIndex = index;
      step.route = targetRoute;

      console.log('Tour transition request');
      console.log('Current step title:', previousStep?.title || 'Welcome');
      console.log('Next step title:', step.title);
      console.log("STEP OBJECT:", step);
      console.log("CURRENT PATH:", currentPathname);
      console.log("TARGET ROUTE:", targetRoute || '(same page)');
      console.log("WILL NAVIGATE:", !!targetRoute && targetRoute !== currentPathname);

      if (step.routeKey && !targetRoute) {
        console.warn(`tour route missing for step "${step.id}" using route key "${step.routeKey}"`);
        logTourTransitionDuration('route missing');
        return;
      }

    if (targetRoute && targetRoute !== currentPathname) {
      console.log('Cross-page step detected');
      console.log('Current path:', currentPathname);
      console.log('Target route:', targetRoute);
      console.log('Navigating before target lookup');
      const loadingLabel = 'Opening section...';
      window.sessionStorage.setItem(dashboardTourLoadingKey, loadingLabel);
      showRouteLoading(loadingLabel);
      console.log('Navigating to new route');
      logTourTransitionDuration('navigation start');
      window.location.assign(targetRoute);
      return;
    }

    console.log('Same route detected, rendering step locally');
    renderDashboardTourStep(index);
  }

  function startGuidedTour() {
      const firstStepIndex = getFirstRealTourStepIndex();
      const firstStep = dashboardTourSteps[firstStepIndex];
      const resolvedRoute = resolveTourStepRoute(firstStep);
      const currentPathname = getCurrentTourPathname();

      console.log('Start Guided Tour clicked');
      console.log('Resolved first real step index:', firstStepIndex);
      console.log('Resolved first real step object:', firstStep);
      console.log('Raw first step object:', firstStep);
      console.log('Resolved route:', resolvedRoute);
      console.log('Current pathname:', currentPathname);
      console.log('Will render locally:', !!resolvedRoute && resolvedRoute === currentPathname);
      console.log('Will navigate:', !!resolvedRoute && resolvedRoute !== currentPathname);

      if (!Number.isInteger(firstStepIndex) || firstStepIndex < 0 || !firstStep) {
        console.error('Cannot start guided tour: first step is missing');
        return;
      }

      if (!resolvedRoute && currentPathname === '/dashboard') {
        console.warn('No explicit route found, but already on dashboard. Rendering locally.');
        writeDashboardTourState(firstStepIndex);
        setDashboardSessionSeen();
        hideWelcomeModal();
        console.log('Calling goToTourStep');
        window.requestAnimationFrame(() => {
          goToTourStep(firstStepIndex);
        });
        return;
      }

      if (!resolvedRoute) {
        console.error('Cannot start guided tour: first step route is invalid', firstStep);
        return;
      }

      firstStep.route = resolvedRoute;
      writeDashboardTourState(firstStepIndex);
      setDashboardSessionSeen();
      hideWelcomeModal();
      console.log('Calling goToTourStep');
    window.requestAnimationFrame(() => {
      goToTourStep(firstStepIndex);
    });
  }

  window.__dealerTourStart = function(event) {
    try {
      if (event?.preventDefault) event.preventDefault();
      if (event?.stopPropagation) event.stopPropagation();
      console.log('Start Guided Tour clicked');
      console.log('startGuidedTour exists:' + typeof startGuidedTour);

      const firstStepIndex = getFirstRealTourStepIndex();
      const firstStep = dashboardTourSteps[firstStepIndex];
      console.log('Resolved first real step index:', firstStepIndex);
      console.log('Resolved first real step object:', firstStep);

      if (typeof startGuidedTour !== 'function') {
        throw new Error('startGuidedTour is not available');
      }

      console.log('Calling goToTourStep');
      startGuidedTour();
    } catch (error) {
      console.error('NUCLEAR START ERROR:', error);
    }
  };

  function revealDashboardTourStep(step, target) {
    dashboardTourDom.stepOverlay.classList.remove('hidden');
    dashboardTourDom.stepCard.classList.remove('hidden');
    if (target) {
      positionHighlightBox(target);
      positionStepCard(target, false);
    } else {
      positionStepCard(null, true);
    }
    hideRouteLoading();
    dashboardTourDom.nextButton.focus({ preventScroll: true });
    logTourTransitionDuration('render complete');
  }

  function renderDashboardTourStep(index, options = {}) {
    if (!dashboardTourDom) return;
    const step = dashboardTourSteps[index];
    if (!step) return;
    const currentPathname = getCurrentTourPathname();
    const targetRoute = resolveTourStepRoute(step);

    if (targetRoute && targetRoute !== currentPathname) {
      console.log('Render blocked until route match');
      console.log('Current path:', currentPathname);
      console.log('Target route:', targetRoute);
      console.log('Navigating before target lookup');
      return;
    }

    dashboardTourIndex = index;
    hideWelcomeModal();
    dashboardTourDom.stepOverlay.classList.remove('hidden');
    dashboardTourDom.stepCard.classList.remove('hidden');
    clearTourHighlight();

    dashboardTourDom.progress.textContent = `Step ${index + 1} of ${dashboardTourSteps.length}`;
    dashboardTourDom.progressBar.style.width = `${((index + 1) / dashboardTourSteps.length) * 100}%`;
    dashboardTourDom.title.textContent = step.title;
    dashboardTourDom.description.textContent = step.whatItDoes || '';
    dashboardTourDom.ownerValue.textContent = step.whyItMatters || '';
    dashboardTourDom.easeValue.textContent = step.easyToUse || '';
    dashboardTourDom.backButton.disabled = index === 0;
    dashboardTourDom.backButton.classList.toggle('opacity-50', index === 0);
    const isFinalStep = index === dashboardTourSteps.length - 1;
    dashboardTourDom.nextButton.textContent = isFinalStep ? 'Enter Full Demo' : 'Next';
    dashboardTourDom.finishButton.textContent = isFinalStep ? 'Close Tour' : 'Skip Tour';
    dashboardTourDom.restartButton.classList.toggle('hidden', !isFinalStep);
    dashboardTourDom.fallbackNote.classList.add('hidden');
    dashboardTourDom.fallbackNote.textContent = '';

    if (step.bullets?.length) {
      dashboardTourDom.bullets.innerHTML = step.bullets.map((bullet) => `<li>${bullet}</li>`).join('');
      dashboardTourDom.bullets.classList.remove('hidden');
    } else {
      dashboardTourDom.bullets.innerHTML = '';
      dashboardTourDom.bullets.classList.add('hidden');
    }

    const waitForTarget = (attempts = 0) => {
      console.log('Looking for target on current page only after route match');
      const { target, usedFallback } = getTourTarget(step, { allowFallback: true });
      if (step.selector && !target && attempts < 4) {
        window.setTimeout(() => waitForTarget(attempts + 1), 40);
        return;
      }

      if (!target) {
        console.warn('Tour target missing, using centered fallback', step);
        dashboardTourDom.fallbackNote.textContent = 'This step is using the nearest available view because a dedicated highlight block was not found on this page.';
        dashboardTourDom.fallbackNote.classList.remove('hidden');
        revealDashboardTourStep(step, null);
        return;
      }

      if (usedFallback) {
        console.log('Fallback target used on correct page');
      }

      if (target.closest('#sidebar') && window.innerWidth < 1024) {
        openSidebar();
      }

      if (!isTargetMostlyInView(target)) {
        target.scrollIntoView({
          behavior: 'auto',
          block: window.innerWidth < 1024 ? 'start' : 'center',
          inline: 'nearest'
        });
      }

      const revealDelay = target.closest('#sidebar') && window.innerWidth < 1024 ? 48 : isTargetMostlyInView(target) ? 0 : 10;
      if (revealDelay === 0) {
        window.requestAnimationFrame(() => revealDashboardTourStep(step, target));
        return;
      }
      window.setTimeout(() => revealDashboardTourStep(step, target), revealDelay);
    };

    waitForTarget();
  }

  function bindDashboardTourEvents() {
    if (!dashboardTourDom) return;

    dashboardIntroButtons.forEach((button) => {
      button.addEventListener('click', () => {
        clearDashboardTourState();
        finishDashboardTour();
        showWelcomeModal(true);
      });
    });

    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('tour-welcome-backdrop')) {
        event.preventDefault();
        event.stopPropagation();
        setDashboardSessionSeen();
        finishDashboardTour();
        return;
      }

      const actionButton = event.target.closest('[data-tour-action]');
      if (!actionButton) return;

      const action = actionButton.getAttribute('data-tour-action');
      if (!action) return;

      event.preventDefault();
      event.stopPropagation();

      if (action === 'start') {
        startGuidedTour();
        return;
      }

      if (action === 'enter') {
        setDashboardSessionSeen();
        finishDashboardTour();
        return;
      }

      if (action === 'skip') {
        window.localStorage.setItem(dashboardStorageKey, 'true');
        setDashboardSessionSeen();
        finishDashboardTour();
        return;
      }

      if (action === 'back') {
        if (dashboardTourIndex > 0) {
          console.log('Tour back clicked');
          console.log('Current step title:', dashboardTourSteps[dashboardTourIndex]?.title || '(unknown)');
          console.log('Previous step title:', dashboardTourSteps[dashboardTourIndex - 1]?.title || '(unknown)');
          goToTourStep(dashboardTourIndex - 1);
        }
        return;
      }

      if (action === 'next') {
        if (dashboardTourIndex >= dashboardTourSteps.length - 1) {
          setDashboardSessionSeen();
          finishDashboardTour();
          return;
        }
        console.log('Tour next clicked');
        console.log('Current step title:', dashboardTourSteps[dashboardTourIndex]?.title || '(unknown)');
        console.log('Next step title:', dashboardTourSteps[dashboardTourIndex + 1]?.title || '(unknown)');
        goToTourStep(dashboardTourIndex + 1);
        return;
      }

      if (action === 'finish') {
        setDashboardSessionSeen();
        finishDashboardTour();
        return;
      }

      if (action === 'restart') {
        clearDashboardTourState();
        dashboardTourIndex = -1;
        showWelcomeModal(true);
        return;
      }
    });

    window.addEventListener('resize', () => {
      if (dashboardTourIndex < 0 || !dashboardTourDom || dashboardTourDom.stepCard.classList.contains('hidden')) return;
      const step = dashboardTourSteps[dashboardTourIndex];
      const { target } = getTourTarget(step, { allowFallback: true });
      if (target) {
        positionHighlightBox(target);
        positionStepCard(target, false);
      } else {
        positionStepCard(null, true);
      }
    });
  }

  function resumeDashboardTourFromState() {
      const state = readDashboardTourState();
      if (!state?.active || !Number.isInteger(state.index)) {
        return false;
      }

    const step = dashboardTourSteps[state.index];
      if (!step) {
        clearDashboardTourState();
        return false;
      }

      const resolvedRoute = resolveTourStepRoute(step);
      step.route = resolvedRoute;

      if (step.routeKey && !resolvedRoute) {
        console.warn(`tour resume route missing for step "${step.id}" using route key "${step.routeKey}"`);
        clearDashboardTourState();
        return false;
      }

    console.log('Resuming tour on new page');
    console.log('Tour resume check');
    console.log('Resume step id:', step.id);
    console.log('Resume step title:', step.title);
      console.log('Resume route:', resolvedRoute || '(same page)');
      console.log('Current pathname:', getCurrentTourPathname());

      if (resolvedRoute && normalizeTourRoute(resolvedRoute) !== getCurrentTourPathname()) {
        console.log('Resume route does not match current page yet');
        return false;
      }

    const pendingLabel = window.sessionStorage.getItem(dashboardTourLoadingKey);
    if (pendingLabel) {
      showRouteLoading(pendingLabel);
    }
    console.log('Resume route matches current page, rendering step locally');
    renderDashboardTourStep(state.index);
    return true;
  }

  dashboardTourDom = buildDashboardTourDom();
  if (dashboardTourDom) {
    warmTourRoutes();
    bindDashboardTourEvents();
    if (!resumeDashboardTourFromState()) {
      showWelcomeModal();
    }
  }
}

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

// Demo confirmation for enterprise trust cues on destructive or external actions
document.querySelectorAll('[data-confirm-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.confirmAction || 'This action';
    const confirmed = window.confirm(`${action}?\n\nDemo only: no live records will be changed.`);
    if (confirmed) {
      button.classList.add('is-confirmed');
      button.setAttribute('aria-label', `${action} queued in demo mode`);
    }
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
