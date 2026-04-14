import json
import os
from collections import Counter, defaultdict
from copy import deepcopy
from datetime import date
from pathlib import Path

from flask import Flask, jsonify, render_template


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


def lead_needs_followup(lead):
    last_contact = lead.get("last_contact", "").lower()
    return (
        lead.get("stage") not in {"Sold", "Lost"}
        and any(marker in last_contact for marker in ["3 days", "4 days", "5 days", "6 days"])
    )


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
    return {
        "branding": branding,
        "app_name": branding["company_name"],
        "current_year": date.today().year,
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
    for vehicle in vehicles:
        selling_price = vehicle.get("selling_price", 0) or 0
        cost_price = vehicle.get("cost_price", 0) or 0
        profit = selling_price - cost_price
        margin = (profit / selling_price * 100) if selling_price else 0
        days_in_stock = vehicle.get("days_in_stock", 0) or 0
        stock_vehicles.append(
            {
                **vehicle,
                "profit": profit,
                "margin": margin,
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
    return render_template(
        "pipeline.html",
        page_title="Deal Flow",
        active_page="Deal Flow",
        columns=columns,
        grouped_leads=grouped,
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
