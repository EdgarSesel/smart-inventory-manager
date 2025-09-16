# Smart Inventory Manager

## Project Overview

The Smart Inventory Manager is a full-stack reference application to help teams track, manage, and analyze inventory across a web dashboard and a companion mobile app. The backend exposes a FastAPI REST API backed by a PostgreSQL database; the web UI is a React + MUI dashboard for managers, and the mobile app (Flutter) is focused on fast SKU lookup and stock updates for operators.


---

## Features

*   **Secure Authentication:** JWT-based user login for both web and mobile platforms.
*   **Web Dashboard (for Managers):**
    *   **BI & KPI Metrics:** At-a-glance cards for "Total Products" and "Low Stock Items".
    *   **Interactive Data Grid:** A sortable, filterable table for all products.
    *   **Data Visualization:** A detailed view for each product with a chart showing its historical stock levels.
    *   **AI Demand Forecasting:** The chart overlays an AI-generated forecast of future demand based on sales history.
    *   **AI Anomaly Detection:** A report that flags unusual inventory movements (e.g., unusually large quantities or transactions at odd hours).
*   **Mobile App (for Operators):**
    *   Built with Flutter for a cross-platform native experience.
    *   Allows operators to look up products by SKU.
    *   Provides a simple interface for quickly updating stock quantities in real-time.

---

## Tech Stack

*   **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL
*   **AI / Machine Learning:** `prophet` (for forecasting), `scikit-learn` (for anomaly detection), `pandas`
*   **Frontend:** React, MUI (Material-UI) component library, Chart.js, Axios
*   **Mobile:** Flutter, Dart
*   **Database & Deployment:** Docker, Docker Compose

---

## Setup & Installation

### 1. Backend
```powershell
# From the repository root
cd backend

# (Optional) Create a Python virtual environment
python -m venv venv
# Windows PowerShell activation (use CMD or Bash equivalent if needed):
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Copy or create a .env file (the repo includes a .env.template you can copy)
# Edit backend/.env to set DATABASE_URL, SECRET_KEY, etc.

# Start the PostgreSQL database using the project's Docker Compose file
# (this will create a container named `smart-inventory-db` in development)
docker-compose -f .\backend\docker-compose.yml up -d

# Important: recent changes use a soft-delete column on products named `is_deleted`.
# If you upgraded code but not the DB schema you may see errors such as:
#   "column products.is_deleted does not exist"
# Fix quickly by running the following inside the DB container (see next section for alternatives):
docker exec -i smart-inventory-db psql -U admin -d inventory_db -c "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;"

# Run the FastAPI server (development)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend
```powershell
cd frontend
# Install dependencies
npm install
# Start the development server (default: http://localhost:3000)
npm start
```

### 3. Mobile App
```powershell
cd mobile_app
# Get Flutter dependencies
flutter pub get

# IMPORTANT: open `lib/services/api_service.dart` and set the backend base URL to match
# your development host. Examples:
# - Android emulator (Android Studio): http://10.0.2.2:8000
# - iOS simulator: http://localhost:8000
# - Real device: use your machine's LAN IP, e.g. http://192.168.1.42:8000

# Run the app on an attached device or emulator
flutter run
```
