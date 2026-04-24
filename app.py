import json
import os
from collections import Counter, defaultdict
from copy import deepcopy
from datetime import date
from pathlib import Path

from flask import Flask, jsonify, render_template, url_for


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "demo_data.json"
BRANDING_FILE = BASE_DIR / "data" / "branding.json"

DEFAULT_BRANDING = {
    "company_name": "PineX Systems",
    "system_tagline": "Powered by PineX Systems",
    "logo": "images/pinex-logo.svg",
}
DEFAULT_SALES_EXECUTIVE = "Lerato Mokoena"
DEFAULT_SALESPERSON = {
    "name": DEFAULT_SALES_EXECUTIVE,
    "role": "Sales Executive",
    "leads_assigned": 0,
    "calls_made": 0,
    "test_drives_booked": 0,
    "deals_closed": 0,
    "conversion_rate": 0,
    "gross_profit": 0,
}
DEFAULT_DATA = {
    "charts": {"monthly_labels": [], "monthly_sales": []},
    "vehicles": [],
    "salespeople": [DEFAULT_SALESPERSON],
    "leads": [],
    "recent_deals": [],
    "followups": [],
    "bookings": [],
    "tasks": [],
    "overdue": [],
    "role_snapshot": [],
    "today_glance": [],
    "operational_flags": [],
    "recent_activity": [],
    "stock_ageing": [],
    "deal_funnel": [],
    "deal_jackets": [],
    "finance_applications": [],
    "trade_ins": [],
    "recon_board": [],
    "delivery_planning": [],
    "integrations": [],
}

app = Flask(__name__)


def static_asset_version(*parts):
    try:
        return int((BASE_DIR / "static" / Path(*parts)).stat().st_mtime)
    except OSError:
        return int(date.today().strftime("%Y%m%d"))


def load_data():
    data = deepcopy(DEFAULT_DATA)
    try:
        with DATA_FILE.open("r", encoding="utf-8") as file:
            loaded = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return data

    if not isinstance(loaded, dict):
        return data

    for key, default_value in DEFAULT_DATA.items():
        value = loaded.get(key, default_value)
        if isinstance(default_value, list):
            data[key] = value if isinstance(value, list) else default_value
        elif isinstance(default_value, dict):
            data[key] = value if isinstance(value, dict) else default_value
        else:
            data[key] = value

    if not data["salespeople"]:
        data["salespeople"] = [DEFAULT_SALESPERSON.copy()]
    charts = data.get("charts", {})
    data["charts"] = {
        "monthly_labels": charts.get("monthly_labels", []) if isinstance(charts, dict) else [],
        "monthly_sales": charts.get("monthly_sales", []) if isinstance(charts, dict) else [],
    }
    return data


def load_branding():
    branding = DEFAULT_BRANDING.copy()
    try:
        with BRANDING_FILE.open("r", encoding="utf-8") as file:
            configured = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return branding

    if isinstance(configured, dict):
        for key in DEFAULT_BRANDING:
            value = configured.get(key)
            if isinstance(value, str) and value.strip():
                branding[key] = value.strip()
    return branding


def currency(value):
    try:
        amount = int(value or 0)
    except (TypeError, ValueError):
        amount = 0
    return f"R{amount:,}".replace(",", " ")


def number(value):
    try:
        amount = int(value or 0)
    except (TypeError, ValueError):
        amount = 0
    return f"{amount:,}".replace(",", " ")


app.jinja_env.filters["currency"] = currency
app.jinja_env.filters["number"] = number


MODULE_PAGES = {
    "add-vehicle": {
        "title": "Add Vehicle",
        "section": "Inventory",
        "summary": "Capture a new unit with Natis, Roadworthy, photos, pricing, and listing readiness in one guided workflow.",
        "actions": ["Start stock capture", "Add vehicle photos", "Request Roadworthy", "Prepare Cars.co.za listing"],
        "metrics": [("Draft units", 3), ("Missing photos", 4), ("Listings incomplete", 5)],
    },
    "bulk-upload": {
        "title": "Imports / Bulk Upload",
        "section": "Inventory",
        "summary": "Import stock sheets, validate required fields, and prepare bulk listings for retail channels.",
        "actions": ["Upload stock sheet", "Map columns", "Validate pricing", "Queue listing sync"],
        "metrics": [("Rows ready", 24), ("Needs review", 2), ("Channel updates", 11)],
    },
    "quotations": {
        "title": "Quotations",
        "section": "Sales",
        "summary": "Build buyer-ready quotations with trade-in allowance, settlement figure, Lic & Reg, and F&I notes so margin and deal momentum stay controlled.",
        "actions": ["Create quotation", "Add trade-in", "Send to buyer", "Convert to deal file"],
        "metrics": [("Open quotes", 9), ("Accepted today", 2), ("Awaiting buyer", 4)],
    },
    "documents": {
        "title": "Invoices / Documents",
        "section": "Sales",
        "summary": "Track OTPs, invoices, Delivery Packs, signed documents, and buyer document gaps before admin confusion slows delivery.",
        "actions": ["Prepare invoice", "Review Delivery Pack", "Request Copy of ID", "Request Proof of Residence"],
        "metrics": [("Docs outstanding", 8), ("Delivery Packs", 5), ("Ready to invoice", 3)],
    },
    "leads": {
        "title": "Leads",
        "section": "Leads / CRM",
        "summary": "Prioritise new, hot, and overdue leads so Sales Executives know who to call next before valuable enquiries are lost.",
        "actions": ["Add lead", "Assign Sales Executive", "Book follow-up", "Send WhatsApp"],
        "metrics": [("Active leads", 21), ("Hot leads", 8), ("Overdue", 4)],
    },
    "follow-ups": {
        "title": "Follow-ups",
        "section": "Leads / CRM",
        "summary": "Daily call, WhatsApp, and appointment queue focused on keeping buyer momentum alive.",
        "actions": ["Log call", "Send WhatsApp", "Book test drive", "Escalate stale lead"],
        "metrics": [("Due today", 5), ("Overdue", 4), ("Auto reminders", 7)],
    },
    "job-cards": {
        "title": "Job Cards",
        "section": "Workshop / Service",
        "summary": "Manage workshop prep, parts blockers, Roadworthy items, and turnaround risk for stock and sold units.",
        "actions": ["Open Job Card", "Assign technician", "Order parts", "Mark Roadworthy"],
        "metrics": [("Open jobs", 7), ("Waiting parts", 2), ("Ready today", 3)],
    },
    "appointments": {
        "title": "Appointments",
        "section": "Workshop / Service",
        "summary": "View test drives, service appointments, finance callbacks, collections, and handovers in one diary.",
        "actions": ["Book service", "Book test drive", "Confirm handover", "Notify buyer"],
        "metrics": [("Today", 6), ("This week", 15), ("Overdue callbacks", 2)],
    },
    "service-history": {
        "title": "Service History",
        "section": "Workshop / Service",
        "summary": "Keep a clean vehicle prep and service record for trade-ins, stock, and customer-owned vehicles.",
        "actions": ["Add service note", "Attach invoice", "Flag comeback", "Request history"],
        "metrics": [("Vehicles tracked", 24), ("History gaps", 3), ("Roadworthy files", 6)],
    },
    "sales-reports": {
        "title": "Sales Reports",
        "section": "Reports",
        "summary": "Review unit sales, Gross Profit, conversion, and Sales Executive activity by branch and date range.",
        "actions": ["View GP report", "Export CSV", "Compare branches", "Send DP pack"],
        "metrics": [("Units sold", 17), ("Gross Profit", "R1 296 300"), ("Target achieved", "72%")],
    },
    "inventory-reports": {
        "title": "Inventory Reports",
        "section": "Reports",
        "summary": "Understand stock turn, ageing exposure, low-margin units, missing photos, and listing completeness.",
        "actions": ["Ageing report", "Margin review", "Photo gaps", "Channel readiness"],
        "metrics": [("Aged 60+", 7), ("Low margin", 5), ("Stock value", "R6 721 900")],
    },
    "lead-performance": {
        "title": "Lead Performance",
        "section": "Reports",
        "summary": "Compare lead sources, response times, conversion, missed follow-ups, and revenue at risk.",
        "actions": ["Source report", "Response SLA", "Lost leads", "Team follow-up pack"],
        "metrics": [("Website leads", 8), ("AutoTrader leads", 5), ("Stale leads", 4)],
    },
    "autotrader": {
        "title": "AutoTrader",
        "section": "Integrations",
        "summary": "Future connector for stock publishing, listing sync, lead capture, and price-position monitoring.",
        "actions": ["Map stock fields", "Preview listings", "Sync leads", "Review channel status"],
        "metrics": [("Connector", "Planned"), ("Listing hooks", 24), ("Lead sync", "Ready")],
    },
    "cars": {
        "title": "Cars.co.za",
        "section": "Integrations",
        "summary": "Future connector for Cars.co.za stock publishing, buyer leads, and inventory performance feedback.",
        "actions": ["Prepare listings", "Sync photos", "Import enquiries", "Review failed listings"],
        "metrics": [("Connector", "Planned"), ("Ready listings", 19), ("Photo gaps", 4)],
    },
    "meta-leads": {
        "title": "Meta Leads",
        "section": "Integrations",
        "summary": "Capture Facebook and Instagram leads directly into Deal Flow with assignment and SLA tracking.",
        "actions": ["Connect page", "Map campaigns", "Assign routing", "Test lead capture"],
        "metrics": [("Connector", "Optional"), ("Campaigns", 3), ("Leads this month", 6)],
    },
    "finance-applications": {
        "title": "Finance Applications",
        "section": "Integrations",
        "summary": "Prepare bank application workflow hooks for F&I submission, document checks, approval tracking, and finance delay visibility.",
        "actions": ["Review F&I queue", "Check docs", "Submit to bank", "Track approvals"],
        "metrics": [("Pending bank", 4), ("Docs missing", 6), ("Approved", 3)],
    },
    "dealership-profile": {
        "title": "Dealership Profile",
        "section": "Settings",
        "summary": "Configure branch details, contact numbers, address, dealership branding, and regional defaults.",
        "actions": ["Edit branch", "Update branding", "Set contact details", "Review public profile"],
        "metrics": [("Branches", 3), ("Users", 11), ("Brand status", "Live")],
    },
    "users-roles": {
        "title": "Users / Roles",
        "section": "Settings",
        "summary": "Demo-ready role structure for Owner, Sales Manager, Sales Executive, Workshop Manager, F&I, and Admin.",
        "actions": ["Invite user", "Assign role", "Review permissions", "Audit activity"],
        "metrics": [("Active users", 11), ("Roles", 6), ("Pending invites", 2)],
    },
    "preferences": {
        "title": "Preferences",
        "section": "Settings",
        "summary": "Set branch defaults for date ranges, Gross Profit targets, notification rules, and workflow labels.",
        "actions": ["Update targets", "Set alerts", "Configure automations", "Save defaults"],
        "metrics": [("Alerts", 9), ("Automations", 5), ("Targets", "Active")],
    },
}


ROLE_DASHBOARDS = {
    "owner": {
        "title": "Owner / Dealer Principal",
        "badge": "Dealer Principal View",
        "focus": "Overall performance, profit, stock turn, team execution, and risk.",
        "widgets": ["Gross Profit protection", "Stock ageing exposure", "Team conversion", "Delivery risk"],
        "actions": ["Review profit at risk", "Open sales reports", "Escalate stale stock", "Check delivery packs"],
    },
    "sales-manager": {
        "title": "Sales Manager",
        "badge": "Sales Manager View",
        "focus": "Team follow-up quality, pending deals, test drive conversion, and missed revenue.",
        "widgets": ["Team Deal Flow", "Overdue follow-ups", "Test drives booked", "Hot leads by source"],
        "actions": ["Assign leads", "Coach Sales Executive", "Move stuck deals", "Review daily calls"],
    },
    "salesperson": {
        "title": "Salesperson",
        "badge": "Sales Executive View",
        "focus": "Own buyers, own deals, follow-ups due today, and personal conversion.",
        "widgets": ["My active leads", "My buyers", "My test drives", "Deals awaiting F&I"],
        "actions": ["Call buyer", "Send WhatsApp", "Book test drive", "Start deal file"],
    },
    "workshop-manager": {
        "title": "Workshop Manager",
        "badge": "Workshop Manager View",
        "focus": "Open Job Cards, parts blockers, Roadworthy status, and stock turnaround.",
        "widgets": ["Open Job Cards", "Waiting parts", "Ready for floor", "Delivery prep risk"],
        "actions": ["Assign technician", "Order parts", "Update Roadworthy", "Release to floor"],
    },
    "admin": {
        "title": "Admin",
        "badge": "Admin View",
        "focus": "Documents, approvals, user access, Delivery Packs, and compliance-ready paperwork.",
        "widgets": ["Docs outstanding", "Delivery Pack queue", "User access", "F&I document gaps"],
        "actions": ["Request documents", "Prepare invoice", "Archive deal file", "Review user roles"],
    },
}


def lead_needs_followup(lead):
    last_contact = lead.get("last_contact", "").lower()
    return (
        lead.get("stage") not in {"Sold", "Lost"}
        and any(marker in last_contact for marker in ["3 days", "4 days", "5 days", "6 days"])
    )


def build_navigation_groups():
    return [
        {
            "label": "Command",
            "items": [
                {"label": "Dashboard", "endpoint": "dashboard", "icon": "01"},
            ],
        },
        {
            "label": "Inventory",
            "items": [
                {"label": "All Vehicles", "endpoint": "stock", "icon": "02"},
                {"label": "Add Vehicle", "endpoint": "module_page", "slug": "add-vehicle", "icon": "03"},
                {"label": "Imports / Bulk Upload", "endpoint": "module_page", "slug": "bulk-upload", "icon": "04"},
            ],
        },
        {
            "label": "Sales",
            "items": [
                {"label": "Deals", "endpoint": "pipeline", "icon": "05"},
                {"label": "Deal Files", "endpoint": "deal_jackets", "icon": "06"},
                {"label": "F&I Desk", "endpoint": "fi_desk", "icon": "07"},
                {"label": "Quotations", "endpoint": "module_page", "slug": "quotations", "icon": "08"},
                {"label": "Invoices / Documents", "endpoint": "module_page", "slug": "documents", "icon": "09"},
                {"label": "Handover Board", "endpoint": "delivery_planning", "icon": "10"},
            ],
        },
        {
            "label": "Leads / CRM",
            "items": [
                {"label": "Leads", "endpoint": "module_page", "slug": "leads", "icon": "11"},
                {"label": "Customers", "endpoint": "customers", "icon": "12"},
                {"label": "Follow-ups", "endpoint": "module_page", "slug": "follow-ups", "icon": "13"},
            ],
        },
        {
            "label": "Workshop / Service",
            "items": [
                {"label": "Job Cards", "endpoint": "module_page", "slug": "job-cards", "icon": "14"},
                {"label": "Appointments", "endpoint": "calendar", "icon": "15"},
                {"label": "Service History", "endpoint": "module_page", "slug": "service-history", "icon": "16"},
                {"label": "Workshop Queue", "endpoint": "recon_board", "icon": "17"},
            ],
        },
        {
            "label": "Reports",
            "items": [
                {"label": "Sales Reports", "endpoint": "module_page", "slug": "sales-reports", "icon": "18"},
                {"label": "Inventory Reports", "endpoint": "module_page", "slug": "inventory-reports", "icon": "19"},
                {"label": "Lead Performance", "endpoint": "module_page", "slug": "lead-performance", "icon": "20"},
                {"label": "Reports Hub", "endpoint": "reports", "icon": "21"},
            ],
        },
        {
            "label": "Integrations",
            "items": [
                {"label": "AutoTrader", "endpoint": "module_page", "slug": "autotrader", "icon": "22"},
                {"label": "Cars.co.za", "endpoint": "module_page", "slug": "cars", "icon": "23"},
                {"label": "Meta Leads", "endpoint": "module_page", "slug": "meta-leads", "icon": "24"},
                {"label": "Finance Applications", "endpoint": "module_page", "slug": "finance-applications", "icon": "25"},
                {"label": "Integrations Hub", "endpoint": "integrations", "icon": "26"},
            ],
        },
        {
            "label": "Settings",
            "items": [
                {"label": "Dealership Profile", "endpoint": "module_page", "slug": "dealership-profile", "icon": "27"},
                {"label": "Users / Roles", "endpoint": "module_page", "slug": "users-roles", "icon": "28"},
                {"label": "Preferences", "endpoint": "module_page", "slug": "preferences", "icon": "29"},
                {"label": "Settings Hub", "endpoint": "settings", "icon": "30"},
            ],
        },
    ]


def nav_href(item):
    if item.get("endpoint") == "module_page":
        return url_for("module_page", slug=item.get("slug", "leads"))
    return url_for(item.get("endpoint", "dashboard"))


def is_nav_active(item, active_page):
    if not active_page:
        return False
    label = item.get("label", "")
    aliases = {
        "Dashboard": {"Dashboard", "Control Room"},
        "All Vehicles": {"Stock", "Vehicle Stock", "All Vehicles"},
        "Deals": {"Deal Flow", "Sales Pipeline", "Deals"},
        "Customers": {"Buyers", "Customers"},
        "Appointments": {"Calendar", "Appointments"},
        "Workshop Queue": {"Workshop Queue", "Recon Board"},
    }
    return active_page == label or active_page in aliases.get(label, set())


def dealership_data():
    data = load_data()
    vehicles = data.get("vehicles", [])
    leads = data.get("leads", [])
    salespeople = data.get("salespeople", []) or [DEFAULT_SALESPERSON.copy()]
    bookings = data.get("bookings", [])
    deals = data.get("recent_deals", [])
    deal_jackets = data.get("deal_jackets", [])
    finance_applications = data.get("finance_applications", [])
    trade_ins = data.get("trade_ins", [])
    recon_board = data.get("recon_board", [])
    delivery_planning = data.get("delivery_planning", [])

    active_deal_statuses = {"Negotiation", "Finance Review", "Approved", "Test Drive Booked"}
    sold_this_month = [v for v in vehicles if v.get("status") == "Sold"]
    active_leads = [lead for lead in leads if lead.get("stage") not in {"Sold", "Lost"}]
    pending_finance = [lead for lead in leads if lead.get("stage") == "Finance Review"]
    followups_today = data.get("followups", [])
    docs_outstanding = sum(
        len([doc for doc in jacket.get("documents", []) if not doc.get("received")])
        for jacket in deal_jackets
    )
    unfollowed_leads = [lead for lead in leads if lead_needs_followup(lead)]
    stuck_finance = [app for app in finance_applications if app.get("status") != "Approved"]
    stuck_deals = [
        lead for lead in leads if lead.get("stage") in {"Finance Review", "Negotiation"}
    ]
    aged_vehicles = [vehicle for vehicle in vehicles if vehicle.get("days_in_stock", 0) > 60]
    deals_closed_today = [
        lead for lead in leads if lead.get("stage") == "Sold" and "today" in lead.get("last_contact", "").lower()
    ]

    monthly_profit = sum(
        vehicle.get("selling_price", 0) - vehicle.get("cost_price", 0)
        for vehicle in sold_this_month
    )
    average_deal_value = (
        sum(lead.get("value", 0) for lead in active_leads) / len(active_leads) if active_leads else 0
    )
    gross_profit_rate = (
        monthly_profit / sum(vehicle.get("selling_price", 0) for vehicle in sold_this_month)
        if sold_this_month and sum(vehicle.get("selling_price", 0) for vehicle in sold_this_month)
        else 0.14
    )
    gross_profit_today = (
        int((monthly_profit / len(sold_this_month)) * len(deals_closed_today))
        if sold_this_month
        else 0
    )
    estimated_lost_profit = int(len(unfollowed_leads) * average_deal_value * gross_profit_rate)
    kpis = {
        "stock_count": len([v for v in vehicles if v.get("status") in {"In Stock", "Reserved"}]),
        "sold_month": len(sold_this_month),
        "gross_profit": monthly_profit,
        "active_deals": len([lead for lead in leads if lead.get("stage") in active_deal_statuses]),
        "pending_finance": len(pending_finance),
        "followups_due": len(followups_today),
        "recon_units": len(recon_board),
        "trade_in_appraisals": len([item for item in trade_ins if item.get("status") != "Appraisal Approved"]),
        "delivery_ready": len([item for item in delivery_planning if item.get("status") == "Ready for Handover"]),
        "docs_outstanding": docs_outstanding,
    }
    today_performance = {
        "deals_closed": len(deals_closed_today),
        "gross_profit": gross_profit_today,
        "deals_stuck": len(stuck_finance),
        "overdue_followups": len(unfollowed_leads) + len(data.get("overdue", [])),
    }
    missed_opportunities = {
        "unfollowed_leads": len(unfollowed_leads),
        "average_deal_value": int(average_deal_value),
        "estimated_lost_profit": estimated_lost_profit,
        "leads": unfollowed_leads,
    }
    alert_counts = {
        "leads_not_contacted": len(unfollowed_leads),
        "deals_stuck": len(stuck_deals),
        "aged_vehicles": len(aged_vehicles),
    }
    lead_sources = Counter(lead.get("source", "Unknown") for lead in leads)
    lead_source_performance = []
    for source, count in lead_sources.most_common():
        source_leads = [lead for lead in leads if lead.get("source") == source]
        won = len([lead for lead in source_leads if lead.get("stage") == "Sold"])
        overdue = len([lead for lead in source_leads if lead_needs_followup(lead)])
        lead_source_performance.append(
            {
                "source": source,
                "count": count,
                "won": won,
                "overdue": overdue,
                "conversion": int((won / count) * 100) if count else 0,
            }
        )
    source_showcase = [
        {
            "label": "Website",
            "count": len([lead for lead in leads if lead.get("source") == "Website"]),
        },
        {
            "label": "Meta Ads",
            "count": len([lead for lead in leads if lead.get("source") in {"Facebook", "Instagram"}]),
        },
        {
            "label": "Google Ads",
            "count": max(len([lead for lead in leads if lead.get("source") == "Google Ads"]), 2),
        },
        {
            "label": "WhatsApp",
            "count": max(len([lead for lead in leads if lead.get("source") == "WhatsApp"]), 3),
        },
        {
            "label": "Walk-in",
            "count": len([lead for lead in leads if lead.get("source") == "Walk-in"]),
        },
        {
            "label": "Referral",
            "count": len([lead for lead in leads if lead.get("source") == "Referral"]),
        },
    ]
    lead_distribution_methods = [
        {
            "label": "Round-robin allocation",
            "detail": "Share new enquiries evenly across the sales floor.",
        },
        {
            "label": "Manual manager assignment",
            "detail": "Let management place the right lead with the right Sales Executive.",
        },
        {
            "label": "Branch-based assignment",
            "detail": "Route leads automatically to the correct branch or region.",
        },
        {
            "label": "Vehicle/category-based assignment",
            "detail": "Send bakkie, SUV, or premium stock leads to the right specialist.",
        },
        {
            "label": "Reassign after no response",
            "detail": "Escalate unattended leads before opportunities go cold.",
        },
    ]
    response_time_defaults = {
        "Lerato Mokoena": "14 min",
        "Johan Botha": "19 min",
        "Ayesha Naidoo": "27 min",
        "Sipho Dlamini": "32 min",
        "Megan Jacobs": "24 min",
    }
    sales_accountability = []
    for person in salespeople:
        salesperson_name = person.get("name", "Sales Executive")
        assigned = [lead for lead in leads if lead.get("salesperson") == salesperson_name]
        overdue = len([lead for lead in assigned if lead_needs_followup(lead)])
        sales_accountability.append(
            {
                "name": salesperson_name,
                "leads_assigned": person.get("leads_assigned", len(assigned)),
                "response_time": response_time_defaults.get(salesperson_name, "22 min"),
                "follow_up_overdue": overdue,
                "conversion_rate": person.get("conversion_rate", 0),
                "deals_closed": person.get("deals_closed", 0),
            }
        )
    integration_showcase = [
        "Website forms",
        "WhatsApp enquiries",
        "Social ad leads",
        "Google leads",
        "Manual captured leads",
        "Stock updates",
        "Deal progress",
        "Customer records",
    ]
    top_salespeople = sorted(
        salespeople,
        key=lambda person: person.get("gross_profit", 0),
        reverse=True,
    )[:4]
    inventory_aging_summary = [
        {"label": "0-30 days", "count": len([v for v in vehicles if v.get("days_in_stock", 0) <= 30 and v.get("status") != "Sold"]), "tone": "success"},
        {"label": "31-60 days", "count": len([v for v in vehicles if 31 <= v.get("days_in_stock", 0) <= 60 and v.get("status") != "Sold"]), "tone": "info"},
        {"label": "61-90 days", "count": len([v for v in vehicles if 61 <= v.get("days_in_stock", 0) <= 90 and v.get("status") != "Sold"]), "tone": "warning"},
        {"label": "90+ days", "count": len([v for v in vehicles if v.get("days_in_stock", 0) > 90 and v.get("status") != "Sold"]), "tone": "danger"},
    ]
    dashboard_metrics = [
        {"label": "Total Stock", "value": len(vehicles), "detail": "All captured vehicles"},
        {"label": "Active Leads", "value": len(active_leads), "detail": "Buyers still in Deal Flow"},
        {"label": "Cars Sold This Month", "value": len(sold_this_month), "detail": "Units closed and delivered"},
        {"label": "Monthly Revenue", "value": sum(vehicle.get("selling_price", 0) for vehicle in sold_this_month), "detail": "Sold-unit retail value", "currency": True},
        {"label": "Workshop Jobs Open", "value": len(recon_board), "detail": "Active Job Cards"},
        {"label": "Vehicles Aged 60+ Days", "value": len(aged_vehicles), "detail": "Stock tying up cash"},
    ]
    dashboard_alerts = [
        {
            "title": "Overdue follow-ups",
            "detail": f"{len(unfollowed_leads)} buyer follow-ups need action before close of business.",
            "severity": "critical" if unfollowed_leads else "info",
        },
        {
            "title": "Stale stock",
            "detail": f"{len(aged_vehicles)} vehicles have crossed 60 Days in Stock.",
            "severity": "warning" if aged_vehicles else "info",
        },
        {
            "title": "Missing vehicle photos",
            "detail": "4 listings need photo completion before AutoTrader or Cars.co.za sync.",
            "severity": "warning",
        },
        {
            "title": "Incomplete listings",
            "detail": "5 stock records need VIN, registration, or retail description checks.",
            "severity": "info",
        },
    ]
    notifications = []
    if unfollowed_leads:
        lead = unfollowed_leads[0]
        notifications.append(
            {
                "type": "urgent",
                "title": "Lead not contacted",
                "detail": f"{lead.get('customer', 'A buyer')} needs a Sales Executive call now.",
            }
        )
    if stuck_finance:
        finance = stuck_finance[0]
        notifications.append(
            {
                "type": "warning",
                "title": "Deal awaiting finance",
                "detail": f"{finance.get('customer', 'A buyer')} is still at {finance.get('status', 'F&I review')}.",
            }
        )
    ready_delivery = next(
        (item for item in delivery_planning if item.get("status") == "Ready for Handover"),
        delivery_planning[0] if delivery_planning else None,
    )
    if ready_delivery:
        notifications.append(
            {
                "type": "success",
                "title": "Vehicle ready for delivery",
                "detail": f"{ready_delivery.get('vehicle', 'A vehicle')} is ready for handover.",
            }
        )

    search_records = []
    for vehicle in vehicles:
        search_records.append(
            {
                "label": f"{vehicle.get('stock_number', 'Stock')} - {vehicle.get('year', '')} {vehicle.get('make', '')} {vehicle.get('model', '')}".strip(),
                "type": "Stock",
                "url": "/stock",
            }
        )
    for lead in leads:
        search_records.append(
            {
                "label": f"{lead.get('customer', 'Buyer')} - {lead.get('vehicle', 'Vehicle')}",
                "type": "Lead",
                "url": "/pipeline",
            }
        )
    for jacket in deal_jackets:
        search_records.append(
            {
                "label": f"{jacket.get('id', 'Deal File')} - {jacket.get('customer', 'Buyer')} - {jacket.get('stock_number', 'Stock')}",
                "type": "Deal File",
                "url": f"/deal-jackets/{jacket.get('id', '')}",
            }
        )

    return {
        "data": data,
        "vehicles": vehicles,
        "leads": leads,
        "salespeople": salespeople,
        "bookings": bookings,
        "recent_deals": deals,
        "followups": followups_today,
        "kpis": kpis,
        "active_leads": active_leads,
        "deal_jackets": deal_jackets,
        "finance_applications": finance_applications,
        "trade_ins": trade_ins,
        "recon_board": recon_board,
        "delivery_planning": delivery_planning,
        "integrations": data.get("integrations", []),
        "search_records": search_records,
        "today_performance": today_performance,
        "missed_opportunities": missed_opportunities,
        "alert_counts": alert_counts,
        "notifications": notifications,
        "dashboard_metrics": dashboard_metrics,
        "dashboard_alerts": dashboard_alerts,
        "lead_source_performance": lead_source_performance,
        "source_showcase": source_showcase,
        "lead_distribution_methods": lead_distribution_methods,
        "sales_accountability": sales_accountability,
        "integration_showcase": integration_showcase,
        "top_salespeople": top_salespeople,
        "inventory_aging_summary": inventory_aging_summary,
    }


def sales_executive_context(name=DEFAULT_SALES_EXECUTIVE):
    context = dealership_data()
    salespeople = context.get("salespeople", []) or [DEFAULT_SALESPERSON.copy()]
    person = next(
        (salesperson for salesperson in salespeople if salesperson.get("name") == name),
        salespeople[0],
    )
    person_name = person.get("name", DEFAULT_SALES_EXECUTIVE)
    assigned_leads = [lead for lead in context.get("leads", []) if lead.get("salesperson") == person_name]
    active_leads = [lead for lead in assigned_leads if lead.get("stage") not in {"Sold", "Lost"}]
    followups = [item for item in context.get("followups", []) if item.get("salesperson") == person_name]
    bookings = [booking for booking in context.get("bookings", []) if booking.get("owner") == person_name]
    deal_files = [
        jacket for jacket in context.get("deal_jackets", []) if jacket.get("sales_executive") == person_name
    ]
    awaiting_fi = [
        lead for lead in assigned_leads if lead.get("stage") in {"Finance Review", "Approved"}
    ]
    columns = [
        "New Lead",
        "Contacted",
        "Interested",
        "Test Drive Booked",
        "Negotiation",
        "Finance Review",
        "Approved",
        "Sold",
        "Lost",
    ]
    grouped = {column: [] for column in columns}
    for lead in assigned_leads:
        grouped.setdefault(lead.get("stage", "New Lead"), []).append(lead)

    my_notifications = []
    stale_leads = [lead for lead in assigned_leads if lead_needs_followup(lead)]
    if stale_leads:
        lead = stale_leads[0]
        my_notifications.append(
            {
                "type": "urgent",
                "title": "Buyer follow-up overdue",
                "detail": f"{lead.get('customer', 'A buyer')} has not been contacted since {lead.get('last_contact', 'the last activity')}.",
            }
        )
    if awaiting_fi:
        lead = awaiting_fi[0]
        my_notifications.append(
            {
                "type": "warning",
                "title": "Deal awaiting F&I",
                "detail": f"{lead.get('customer', 'A buyer')} is sitting at {lead.get('stage', 'F&I')}.",
            }
        )
    next_booking = bookings[0] if bookings else None
    if next_booking:
        my_notifications.append(
            {
                "type": "success",
                "title": "Customer notified",
                "detail": f"{next_booking.get('customer', 'A buyer')} has a {next_booking.get('type', 'booking')} on {next_booking.get('day', 'the diary')} at {next_booking.get('time', 'the booked time')}.",
            }
        )

    restricted_search = []
    for lead in assigned_leads:
        restricted_search.append(
            {
                "label": f"{lead.get('customer', 'Buyer')} - {lead.get('vehicle', 'Vehicle')}",
                "type": "My Buyer",
                "url": "/sales-executive-view",
            }
        )
    for jacket in deal_files:
        restricted_search.append(
            {
                "label": f"{jacket.get('id', 'Deal File')} - {jacket.get('customer', 'Buyer')} - {jacket.get('stock_number', 'Stock')}",
                "type": "My Deal File",
                "url": "/sales-executive-view",
            }
        )

    context.update(
        {
            "sales_exec": person,
            "my_leads": assigned_leads,
            "my_active_leads": active_leads,
            "my_followups": followups,
            "my_bookings": bookings,
            "my_deal_files": deal_files,
            "my_awaiting_fi": awaiting_fi,
            "my_pipeline_columns": columns,
            "my_grouped_leads": grouped,
            "my_notifications": my_notifications,
            "notifications": my_notifications,
            "search_records": restricted_search,
        }
    )
    return context


@app.context_processor
def inject_globals():
    branding = load_branding()
    tour_routes = {
        "dashboard": url_for("dashboard"),
        "leads": url_for("leads_page"),
        "sales_team": url_for("sales_team"),
        "deals": url_for("pipeline"),
        "deal_files": url_for("deal_jackets"),
        "fi_desk": url_for("fi_desk"),
        "quotations": url_for("module_page", slug="quotations"),
        "documents": url_for("module_page", slug="documents"),
        "handover": url_for("delivery_planning"),
        "stock": url_for("stock"),
        "add_vehicle": url_for("add_vehicle_page"),
        "integrations": url_for("integrations"),
        "finance_applications": url_for("module_page", slug="finance-applications"),
        "customers": url_for("customers"),
    }
    return {
        "branding": branding,
        "app_name": branding["company_name"],
        "current_year": date.today().year,
        "navigation_groups": build_navigation_groups(),
        "nav_href": nav_href,
        "is_nav_active": is_nav_active,
        "tour_routes": tour_routes,
        "asset_versions": {
            "app_js": static_asset_version("js", "app.js"),
            "dashboard_js": static_asset_version("js", "dashboard.js"),
            "style_css": static_asset_version("css", "style.css"),
        },
    }


@app.route("/")
@app.route("/login")
def login():
    return render_template("login.html", page_title="Login")


@app.route("/dashboard")
def dashboard():
    context = dealership_data()
    return render_template(
        "dashboard.html",
        page_title="Dealer Control Room",
        active_page="Dashboard",
        active_view="principal",
        role_badge="Dealer Principal View",
        user_initials="MV",
        **context,
    )


@app.route("/sales-executive-view")
@app.route("/salesman-view")
def sales_executive_view():
    context = sales_executive_context()
    return render_template(
        "sales_executive_view.html",
        page_title="Sales Executive View",
        active_page="Dashboard",
        active_view="salesman",
        role_badge="Sales Executive View",
        user_initials="LM",
        **context,
    )


@app.route("/stock")
def stock():
    context = dealership_data()
    vehicles = context["vehicles"]
    stock_summary = Counter(vehicle.get("status", "Unknown") for vehicle in vehicles)
    stock_vehicles = []
    for index, vehicle in enumerate(vehicles):
        selling_price = vehicle.get("selling_price", 0) or 0
        cost_price = vehicle.get("cost_price", 0) or 0
        profit = selling_price - cost_price
        margin = (profit / selling_price * 100) if selling_price else 0
        days_in_stock = vehicle.get("days_in_stock", 0) or 0
        completeness = max(58, min(100, 98 - (12 if days_in_stock > 60 else 0) - (8 if margin < 10 else 0) - (index % 3) * 4))
        photo_count = 6 - (index % 4)
        stock_vehicles.append(
            {
                **vehicle,
                "profit": profit,
                "margin": margin,
                "listing_completeness": completeness,
                "photo_count": photo_count,
                "vin": f"AAVZZZ{vehicle.get('stock_number', 'AF-0000').replace('-', '')}{index:02d}",
                "registration": f"{['GP', 'NW', 'FS', 'KZN'][index % 4]} {1042 + index} {['AF', 'PX', 'ZA'][index % 3]}",
                "channel_status": "Ready to sync" if completeness >= 90 else "Needs listing work",
                "is_aged": days_in_stock > 60,
                "is_low_margin": margin < 10,
                "is_high_margin": margin >= 15,
                "is_fast_mover": days_in_stock <= 30 and vehicle.get("status") != "Sold",
                "needs_attention": days_in_stock > 60 or margin < 10,
            }
        )

    total_stock_value = sum(
        item.get("selling_price", 0) for item in stock_vehicles if item.get("status") != "Sold"
    )
    total_potential_profit = sum(
        item["profit"] for item in stock_vehicles if item.get("status") != "Sold"
    )
    estimated_profit_at_risk = sum(
        item["profit"] for item in stock_vehicles if item["is_aged"] and item.get("status") != "Sold"
    )
    aged_count = len([item for item in stock_vehicles if item["is_aged"] and item.get("status") != "Sold"])
    low_margin_count = len(
        [item for item in stock_vehicles if item["is_low_margin"] and item.get("status") != "Sold"]
    )
    fastest = min(
        [item for item in stock_vehicles if item.get("status") != "Sold"],
        key=lambda item: item.get("days_in_stock", 0),
        default=None,
    )
    slowest = max(
        [item for item in stock_vehicles if item.get("status") != "Sold"],
        key=lambda item: item.get("days_in_stock", 0),
        default=None,
    )
    stock_profit_summary = {
        "total_stock_value": total_stock_value,
        "total_potential_profit": total_potential_profit,
        "estimated_profit_at_risk": estimated_profit_at_risk,
    }
    stock_insights = [
        f"{aged_count} vehicles older than 60 days",
        f"{low_margin_count} vehicles below 10% margin",
        f"Top mover: {fastest.get('make', 'Vehicle')} {fastest.get('model', '')} ({fastest.get('days_in_stock', 0)} days)" if fastest else "Top mover: no active stock",
        f"Slow mover: {slowest.get('make', 'Vehicle')} {slowest.get('model', '')} ({slowest.get('days_in_stock', 0)} days)" if slowest else "Slow mover: no active stock",
    ]
    return render_template(
        "stock.html",
        page_title="Vehicle Stock",
        active_page="Stock",
        stock_summary=stock_summary,
        stock_vehicles=stock_vehicles,
        stock_profit_summary=stock_profit_summary,
        stock_insights=stock_insights,
        **context,
    )


@app.route("/pipeline")
@app.route("/deals")
def pipeline():
    context = dealership_data()
    columns = [
        "New Lead",
        "Contacted",
        "Interested",
        "Test Drive Booked",
        "Negotiation",
        "Finance Review",
        "Approved",
        "Sold",
        "Lost",
    ]
    grouped = {column: [] for column in columns}
    for lead in context["leads"]:
        grouped.setdefault(lead.get("stage", "New Lead"), []).append(lead)
    overdue_leads = [lead for lead in context["leads"] if lead_needs_followup(lead)]
    lead_sources = Counter(lead.get("source", "Unknown") for lead in context["leads"])
    lead_source_summary = [{"source": source, "count": count} for source, count in lead_sources.most_common()]
    return render_template(
        "pipeline.html",
        page_title="Deal Flow",
        active_page="Deal Flow",
        columns=columns,
        grouped_leads=grouped,
        overdue_leads=overdue_leads,
        lead_source_summary=lead_source_summary,
        **context,
    )


@app.route("/customers")
def customers():
    context = dealership_data()
    return render_template("customers.html", page_title="Buyers", active_page="Buyers", **context)


@app.route("/deal-jackets")
@app.route("/deal-jackets/<jacket_id>")
def deal_jackets(jacket_id=None):
    context = dealership_data()
    jackets = context["deal_jackets"]
    selected = next(
        (jacket for jacket in jackets if jacket.get("id") == jacket_id),
        jackets[0] if jackets else None,
    )
    return render_template(
        "deal_jackets.html",
        page_title="Deal Files",
        active_page="Deal Files",
        selected_jacket=selected,
        **context,
    )


@app.route("/fi-desk")
def fi_desk():
    context = dealership_data()
    return render_template("fi_desk.html", page_title="F&I Desk", active_page="F&I Desk", **context)


@app.route("/trade-ins")
def trade_ins():
    context = dealership_data()
    return render_template("trade_ins.html", page_title="Trade-ins", active_page="Trade-ins", **context)


@app.route("/calendar")
def calendar():
    context = dealership_data()
    bookings_by_day = defaultdict(list)
    for booking in context["bookings"]:
        bookings_by_day[booking.get("day", "Unscheduled")].append(booking)
    return render_template(
        "calendar.html",
        page_title="Calendar",
        active_page="Calendar",
        bookings_by_day=dict(bookings_by_day),
        **context,
    )


@app.route("/recon-board")
def recon_board():
    context = dealership_data()
    stages = [
        "Awaiting Inspection",
        "Parts Ordered",
        "In Workshop",
        "Valet / Detail",
        "Roadworthy",
        "Ready for Floor",
        "Ready for Delivery",
    ]
    grouped = {stage: [] for stage in stages}
    for item in context["recon_board"]:
        grouped.setdefault(item.get("stage", "Awaiting Inspection"), []).append(item)
    return render_template(
        "recon_board.html",
        page_title="Workshop Queue",
        active_page="Workshop Queue",
        recon_stages=stages,
        grouped_recon=grouped,
        **context,
    )


@app.route("/delivery-planning")
def delivery_planning():
    context = dealership_data()
    return render_template(
        "delivery_planning.html",
        page_title="Handover Board",
        active_page="Handover Board",
        **context,
    )


@app.route("/sales-team")
def sales_team():
    context = dealership_data()
    ranked = sorted(
        context["salespeople"] or [DEFAULT_SALESPERSON.copy()],
        key=lambda item: item.get("gross_profit", 0),
        reverse=True,
    )
    return render_template(
        "sales_team.html",
        page_title="Sales Team",
        active_page="Sales Team",
        ranked_salespeople=ranked,
        **context,
    )


@app.route("/reports")
def reports():
    context = dealership_data()
    return render_template("reports.html", page_title="Reports", active_page="Reports", **context)


@app.route("/finance-compliance")
def finance_compliance():
    context = dealership_data()
    vehicles = context.get("vehicles", [])
    stock_summary = {"In Stock": 0, "Reserved": 0, "Sold": 0}
    for v in vehicles:
        status = v.get("status", "Unknown")
        if status in stock_summary:
            stock_summary[status] += 1
    total_stock_value = sum(v.get("selling_price", 0) for v in vehicles if v.get("status") != "Sold")
    stock_profit_summary = {
        "total_stock_value": total_stock_value,
        "total_potential_profit": 0,
        "estimated_profit_at_risk": 0,
    }
    context.update({"stock_summary": stock_summary, "stock_profit_summary": stock_profit_summary})
    return render_template(
        "finance_compliance.html",
        page_title="Finance & Compliance",
        active_page="Finance & Compliance",
        **context,
    )


@app.route("/integrations")
def integrations():
    context = dealership_data()
    return render_template("integrations.html", page_title="Integrations", active_page="Integrations", **context)


@app.route("/settings")
def settings():
    context = dealership_data()
    return render_template("settings.html", page_title="Settings", active_page="Settings", **context)


@app.route("/module/<slug>")
def module_page(slug):
    context = dealership_data()
    module = MODULE_PAGES.get(slug, MODULE_PAGES["leads"])
    module_tour_target = {
        "leads": "leads-main",
        "add-vehicle": "add-vehicle-main",
        "quotations": "quotations-main",
        "documents": "documents-main",
        "finance-applications": "finance-applications-main",
    }.get(slug, "module-main")
    return render_template(
        "module_page.html",
        page_title=module["title"],
        active_page=module["title"],
        module=module,
        module_slug=slug,
        module_tour_target=module_tour_target,
        **context,
    )


@app.route("/leads")
def leads_page():
    return module_page("leads")


@app.route("/add-vehicle")
def add_vehicle_page():
    return module_page("add-vehicle")


@app.route("/role/<role_key>")
def role_dashboard(role_key):
    if role_key == "salesperson":
        return sales_executive_view()
    context = dealership_data()
    role = ROLE_DASHBOARDS.get(role_key, ROLE_DASHBOARDS["owner"])
    return render_template(
        "role_dashboard.html",
        page_title=role["title"],
        active_page="Dashboard",
        active_view="principal" if role_key != "salesperson" else "salesman",
        role_badge=role["badge"],
        user_initials="MV" if role_key in {"owner", "sales-manager"} else "WM" if role_key == "workshop-manager" else "AD",
        selected_role=role,
        selected_role_key=role_key,
        **context,
    )


@app.route("/api/dashboard")
def dashboard_api():
    context = dealership_data()
    charts = context["data"].get("charts", {})
    salesperson_sales = {
        person.get("name", "Sales Executive"): person.get("deals_closed", 0)
        for person in context["salespeople"]
    }
    gross_profit = {
        person.get("name", "Sales Executive"): person.get("gross_profit", 0)
        for person in context["salespeople"]
    }
    return jsonify(
        {
            "monthlySales": charts.get("monthly_sales", []),
            "monthlyLabels": charts.get("monthly_labels", []),
            "salespersonSales": salesperson_sales,
            "grossProfit": gross_profit,
            "stockAgeing": context["data"].get("stock_ageing", []),
            "dealFunnel": context["data"].get("deal_funnel", []),
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
