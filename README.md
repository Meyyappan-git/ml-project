# DemandSphere AI - Pan-India Demand Forecasting System

A full-stack application that leverages Google Trends, simulated social media, and e-commerce data to forecast product demand across 28 Indian states using a scikit-learn RandomForestRegressor.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Leaflet.js, Recharts
- **Backend**: Python, FastAPI, scikit-learn, pytrends, MongoDB (pymongo)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate

pip install -r requirements.txt

# Create .env file based on .env.example
cp .env.example .env
# Edit .env with your MongoDB URI (or use a local fallback if disconnected)

# Train the ML model
python train.py

# Run the FastAPI server
python main.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Run the React dev server
npm run dev
```

### 3. One-Command Local Run (Windows PowerShell)
You can start both frontend and backend concurrently using:
```powershell
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; .\venv\Scripts\activate; python main.py`""
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""
```

## Features
- **Real-time Map**: Choropleth map of India showing demand intensity per state.
- **Predictive AI**: Random Forest Regressor trained on multiple demand signals.
- **Auto-Insights**: Automated recommendations on production output depending on score.
- **Dynamic Charts**: Interactive bar charts and trend visualization.
