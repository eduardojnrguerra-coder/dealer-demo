import json
import os
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

from flask import Flask, jsonify, render_template


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "demo_data.json"

app = Flask(__name__)


def load_data():
    with DATA_FILE.open("r", encoding="utf-8") as file:
        return json.load(file)


def currency(value):
    return f"R{int(value):,}".replace(",", " ")


def number(value):
    return f"{int(value):,}".replace(",", " ")


app.jinja_env.filters["currency"] = currency
app.jinja_env.filters["number"] = number


def dealership_data():
    data = load_data()
    vehicles = data["vehicles"]
    leads = data["leads"]
    salespeople = data["salespeople"]
    bookings = data["bookings"]
    deals = data["recent_deals"]
    deal_jackets = data.get("deal_jackets", [])
    finance_applications = data.get("finance_applications", [])
    trade_ins = data.get("trade_ins", [])
    recon_board = data.get("recon_board", [])
    delivery_planning = data.get("delivery_planning", [])

    active_deal_statuses = {"Negotiation", "Finance Review", "Approved", "Test Drive Booked"}
    sold_this_month = [v for v in vehicles if v["status"] == "Sold"]
    active_leads = [lead for lead in leads if lead["stage"] not in {"Sold", "Lost"}]
    pending_finance = [lead for lead in leads if lead["stage"] == "Finance Review"]
    followups_today = data["followups"]
    docs_outstanding = sum(
        len([doc for doc in jacket.get("documents", []) if not doc.get("received")])
        for jacket in deal_jackets
    )

    monthly_profit = sum(vehicle["selling_price"] - vehicle["cost_price"] for vehicle in sold_this_month)
    kpis = {
        "stock_count": len([v for v in vehicles if v["status"] in {"In Stock", "Reserved"}]),
        "sold_month": len(sold_this_month),
        "gross_profit": monthly_profit,
        "active_deals": len([lead for lead in leads if lead["stage"] in active_deal_statuses]),
        "pending_finance": len(pending_finance),
        "followups_due": len(followups_today),
        "recon_units": len(recon_board),
        "trade_in_appraisals": len([item for item in trade_ins if item["status"] != "Appraisal Approved"]),
        "delivery_ready": len([item for item in delivery_planning if item["status"] == "Ready for Handover"]),
        "docs_outstanding": docs_outstanding,
    }

    search_records = []
    for vehicle in vehicles:
        search_records.append(
            {
                "label": f"{vehicle['stock_number']} - {vehicle['year']} {vehicle['make']} {vehicle['model']}",
                "type": "Stock",
                "url": "/stock",
            }
        )
    for lead in leads:
        search_records.append(
            {
                "label": f"{lead['customer']} - {lead['vehicle']}",
                "type": "Lead",
                "url": "/pipeline",
            }
        )
    for jacket in deal_jackets:
        search_records.append(
            {
                "label": f"{jacket['id']} - {jacket['customer']} - {jacket['stock_number']}",
                "type": "Deal Jacket",
                "url": f"/deal-jackets/{jacket['id']}",
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
    }


@app.context_processor
def inject_globals():
    return {
        "app_name": "Arcta DealerOS",
        "current_year": date.today().year,
    }


@app.route("/")
@app.route("/login")
def login():
    return render_template("login.html", page_title="Login")


@app.route("/dashboard")
def dashboard():
    context = dealership_data()
    return render_template("dashboard.html", page_title="Dashboard", active_page="Dashboard", **context)


@app.route("/stock")
def stock():
    context = dealership_data()
    vehicles = context["vehicles"]
    stock_summary = Counter(vehicle["status"] for vehicle in vehicles)
    return render_template(
        "stock.html",
        page_title="Vehicle Stock",
        active_page="Stock",
        stock_summary=stock_summary,
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
        grouped.setdefault(lead["stage"], []).append(lead)
    return render_template(
        "pipeline.html",
        page_title="Sales Pipeline",
        active_page="Sales Pipeline",
        columns=columns,
        grouped_leads=grouped,
        **context,
    )


@app.route("/customers")
def customers():
    context = dealership_data()
    return render_template("customers.html", page_title="Customers", active_page="Customers", **context)


@app.route("/deal-jackets")
@app.route("/deal-jackets/<jacket_id>")
def deal_jackets(jacket_id=None):
    context = dealership_data()
    jackets = context["deal_jackets"]
    selected = next((jacket for jacket in jackets if jacket["id"] == jacket_id), jackets[0] if jackets else None)
    return render_template(
        "deal_jackets.html",
        page_title="Deal Jackets",
        active_page="Deal Jackets",
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
        bookings_by_day[booking["day"]].append(booking)
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
        grouped.setdefault(item["stage"], []).append(item)
    return render_template(
        "recon_board.html",
        page_title="Recon Board",
        active_page="Recon Board",
        recon_stages=stages,
        grouped_recon=grouped,
        **context,
    )


@app.route("/delivery-planning")
def delivery_planning():
    context = dealership_data()
    return render_template(
        "delivery_planning.html",
        page_title="Delivery Planning",
        active_page="Delivery Planning",
        **context,
    )


@app.route("/sales-team")
def sales_team():
    context = dealership_data()
    ranked = sorted(context["salespeople"], key=lambda item: item["gross_profit"], reverse=True)
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


@app.route("/integrations")
def integrations():
    context = dealership_data()
    return render_template(
        "integrations.html",
        page_title="Integrations",
        active_page="Integrations",
        **context,
    )


@app.route("/settings")
def settings():
    context = dealership_data()
    return render_template("settings.html", page_title="Settings", active_page="Settings", **context)


@app.route("/api/dashboard")
def dashboard_api():
    context = dealership_data()
    charts = context["data"]["charts"]
    salesperson_sales = {
        person["name"]: person["deals_closed"] for person in context["salespeople"]
    }
    gross_profit = {
        person["name"]: person["gross_profit"] for person in context["salespeople"]
    }
    return jsonify(
        {
            "monthlySales": charts["monthly_sales"],
            "monthlyLabels": charts["monthly_labels"],
            "salespersonSales": salesperson_sales,
            "grossProfit": gross_profit,
            "stockAgeing": context["data"].get("stock_ageing", []),
            "dealFunnel": context["data"].get("deal_funnel", []),
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
