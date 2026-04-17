from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import datetime
from typing import List, Optional
import os
from dotenv import load_dotenv

# Import our custom modules
from collector import collect_signals
from demand_calc import compute_recommended_units
from predict import predict_demand
from train import train_model

load_dotenv()

app = FastAPI(title="DemandSphere AI")

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
from pymongo import MongoClient
import logging

mongo_uri = os.getenv("MONGODB_URI")
# Fallback to local memory dictionary if mongo fails or is not provided (for run without real credentials)
use_in_memory = False
try:
    if mongo_uri:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        db = client["demandsphere"]
        collection = db["predictions"]
        print("Connected to MongoDB successfully.")
    else:
        print("No MONGODB_URI in ENV. Using in-memory store.")
        use_in_memory = True
        in_memory_db = []
except Exception as e:
    print(f"MongoDB connection failed: {e}. Using in-memory fallback.")
    use_in_memory = True
    in_memory_db = []

# Ensure model is trained at startup
train_model()

# --- Pydantic Models for responses ---
class AnalyzeRequest(BaseModel):
    product: str

class SignalScores(BaseModel):
    trend: float
    social: float
    ecommerce: float

class DemandResponse(BaseModel):
    region: str
    product: str
    demand_score: float
    recommended_units: float
    signals: SignalScores
    timestamp: str

class AnalyzeResponse(BaseModel):
    product: str
    results: List[DemandResponse]

# --- Database Helpers ---
def save_prediction(doc: dict):
    if use_in_memory:
        in_memory_db.append(doc)
    else:
        try:
            collection.insert_one(doc.copy())
        except Exception as e:
            print(f"Failed to save to MongoDB: {e}")

def get_predictions() -> List[dict]:
    if use_in_memory:
        return in_memory_db
    else:
        try:
            # Exclude _id
            return list(collection.find({}, {'_id': 0}).sort("timestamp", -1))
        except:
            return []

# --- API Endpoints ---
@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_product(req: AnalyzeRequest):
    """
    Analyzes demand for a product across all Indian states.
    Collects signals, runs prediction model, and saves results.
    """
    if not req.product:
        raise HTTPException(status_code=400, detail="Product name required")
    
    signals_by_region = collect_signals(req.product)
    
    results = []
    timestamp = datetime.datetime.utcnow().isoformat()
    
    for region, signals in signals_by_region.items():
        prediction_res = predict_demand(signals['trend'], signals['social'], signals['ecommerce'])
        score = prediction_res['score'] if isinstance(prediction_res, dict) else prediction_res

        units = compute_recommended_units(score)
        
        doc = {
            "region": region,
            "product": req.product,
            "demand_score": score,
            "recommended_units": units,
            "signals": signals,
            "timestamp": timestamp
        }
        
        # Save to DB
        save_prediction(doc)
        results.append(DemandResponse(**doc))
        
    return AnalyzeResponse(product=req.product, results=results)

@app.get("/api/demand", response_model=DemandResponse)
async def get_demand(product: str = Query(...), region: str = Query(...)):
    """
    Gets the latest demand score for a specific product and region.
    """
    if use_in_memory:
        # Find latest
        matches = [d for d in in_memory_db if d['product'].lower() == product.lower() and d['region'].lower() == region.lower()]
        if matches:
            # Assumes append order is chronological
            return DemandResponse(**matches[-1])
        raise HTTPException(status_code=404, detail="No data found")
    else:
        try:
            doc = collection.find_one(
                {"product": {"$regex": f"^{product}$", "$options": "i"}, 
                 "region": {"$regex": f"^{region}$", "$options": "i"}},
                sort=[("timestamp", -1)]
            )
            if doc:
                return DemandResponse(**doc)
            raise HTTPException(status_code=404, detail="No data found")
        except Exception as e:
            raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/demand/all", response_model=List[DemandResponse])
async def get_all_demands():
    """
    Returns all collected predictions.
    """
    docs = get_predictions()
    return [DemandResponse(**d) for d in docs]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
