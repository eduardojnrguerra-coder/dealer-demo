# Arcta DealerOS

Arcta DealerOS is a polished, client-facing Flask demo for a modern South African car dealership management system. It shows how a Dealer Principal, Used Vehicle Manager, Stock Controller, Sales Executives, and F&I team can manage floor stock, active leads, Deal Jackets, bookings, recon, deliveries, and Gross Profit visibility from one operating system.

The app uses mock demo data only. There is no database or real authentication in version 1, which keeps it simple to run locally and easy to deploy as a live preview.

## Features

- Premium login screen with demo entry
- Executive dashboard with KPI cards, Chart.js charts, operational flags, stock ageing, deal funnel, recent activity, and follow-ups
- Vehicle stock command view with 24 realistic vehicles, filters, badges, margins, aged stock flags, and a detail modal
- Kanban-style sales pipeline with 24 active and closed leads
- Customer desk and Deal Jacket profile view
- Dedicated F&I desk for bank status, instalment estimates, settlement figures, required documents, insurance, and payout notes
- Trade-in appraisal page for service history, tyre/body/interior condition, and valuation status
- Recon / workshop prep board with Job Cards and Roadworthy flow
- Delivery planning board for sold units progressing toward handover
- Integrations hub with brand-safe placeholder connector cards
- Weekly calendar and operational booking view
- Sales team leaderboard with conversion, activity, closed deals, and gross profit
- Intentional placeholder pages for Reports and Settings
- Responsive layout using Tailwind CSS CDN and light custom CSS
- Deployment-ready Flask setup for Render

## Tech Stack

- Python Flask
- Jinja templates
- Tailwind CSS via CDN
- Vanilla JavaScript
- Chart.js
- JSON demo data
- Gunicorn for production serving

## Project Structure

```text
dealer_demo/
  app.py
  requirements.txt
  Procfile
  README.md
  data/
    demo_data.json
  static/
    css/
      style.css
    js/
      app.js
      dashboard.js
      stock.js
      pipeline.js
      calendar.js
      team.js
    images/
      suv.svg
      hatch.svg
      bakkie.svg
      sedan.svg
  templates/
    base.html
    calendar.html
    customers.html
    dashboard.html
    deal_jackets.html
    delivery_planning.html
    fi_desk.html
    integrations.html
    login.html
    pipeline.html
    recon_board.html
    reports.html
    sales_team.html
    settings.html
    stock.html
    trade_ins.html
```

## Local Setup

1. Open a terminal in the project folder:

```bash
cd dealer_demo
```

2. Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the app:

```bash
python app.py
```

5. Open the local demo:

```text
http://localhost:5000
```

Use the **Enter Demo** button on the login page to open the dashboard. The sidebar includes the full operational demo: Dashboard, Stock, Sales Pipeline, Customers, Deal Jackets, F&I Desk, Trade-ins, Calendar, Recon Board, Delivery Planning, Sales Team, Reports, Integrations, and Settings.

## Deploying to Render

1. Push this `dealer_demo` folder to a GitHub repository.
2. In Render, choose **New +** and then **Web Service**.
3. Connect your GitHub repository.
4. Set the service root directory to `dealer_demo` if the repository contains other folders.
5. Use these settings:

```text
Environment: Python
Build Command: pip install -r requirements.txt
Start Command: gunicorn app:app
```

6. No environment variables are required for the demo. Render will provide the `PORT` environment variable automatically.
7. Click **Create Web Service**.
8. When deployment finishes, Render will provide a public URL that you can send to the client.

## Python Version

This app works on current Render Python runtimes. A `runtime.txt` file is not required for version 1. If you want to pin a runtime later, use a Render-supported Python version such as:

```text
python-3.11.9
```

## Demo Notes

- All vehicles, leads, Deal Jackets, finance applications, bookings, trade-ins, recon items, delivery planning records, sales activity, and KPI values are mock data.
- Login is intentionally mocked for client preview purposes.
- There is no database in version 1.
- Stock filters, pipeline summaries, charts, global search, modal details, navigation, and quick actions are interactive enough for a live sales demo without adding unnecessary complexity.

## Suggested Next Improvements

- Add a real database and admin data editing
- Add customer profiles and deal document tracking
- Add finance approval workflow screens
- Add workshop integration and job cards
- Add authentication and role-based permissions
- Add CSV import/export for dealership stock
