# Smart Inventory Manager

## Project Overview

The Smart Inventory Manager is a comprehensive, full-stack application designed to help businesses track, manage, and analyze their inventory with modern, data-driven tools. It features a web dashboard for managers, a companion mobile app for warehouse operators, and a powerful backend with AI-powered forecasting and anomaly detection.

This project was built to demonstrate a wide range of modern development skills, including backend API design, frontend development with a major component library, mobile app development, and the practical application of machine learning.

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
```bash
cd backend
# Create a virtual environment
python -m venv venv
source venv/bin/activate 
# Install dependencies
pip install -r requirements.txt 
# Create a .env file (copy from .env.template) and fill in your details
# Start the database
docker-compose up -d
# Run the server
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
# Install dependencies
npm install
# Start the development server
npm start
```

### 3. Mobile App
```bash
cd mobile_app
# Get dependencies
flutter pub get
# Update the IP address in lib/services/api_service.dart to match your backend server
# Run the app on a connected emulator or device
flutter run
```