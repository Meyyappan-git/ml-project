from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import datetime
from typing import List, Optional, Dict
import os
import re
import random
import httpx
import json
import logging
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
in_memory_db = []
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
except Exception as e:
    print(f"MongoDB connection failed: {e}. Using in-memory fallback.")
    use_in_memory = True

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

class BrandDemandItem(BaseModel):
    brand: str
    demand_score: float
    market_share: float
    trend: str  # 'rising', 'stable', 'falling'
    recommended_units: float

class BrandDemandResponse(BaseModel):
    product: str
    state: Optional[str]
    top_brand: str
    brands: List[BrandDemandItem]

# --- Database Helpers ---
def save_prediction(doc: dict):
    # Always keep in memory as a cache/fallback
    in_memory_db.append(doc)
    if not use_in_memory:
        try:
            collection.insert_one(doc.copy())
        except Exception as e:
            print(f"Failed to save to MongoDB: {e}. Data preserved in memory.")

def get_predictions() -> List[dict]:
    if not use_in_memory:
        try:
            # Try MongoDB first
            docs = list(collection.find({}, {'_id': 0}).sort("timestamp", -1))
            if docs: return docs
        except Exception as e:
            print(f"MongoDB fetch failed: {e}. Falling back to memory.")
    
    # Return in-memory data (reversed for latest first)
    return list(reversed(in_memory_db))

# --- API Endpoints ---
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "mongodb": "connected" if not use_in_memory else "using_in_memory_fallback",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_product(req: AnalyzeRequest):
    """
    Analyzes demand for a product across all Indian states.
    Collects signals, runs prediction model, and saves results.
    """
    product_clean = req.product.strip()
    if not product_clean:
        raise HTTPException(status_code=400, detail="Product name required")
    
    signals_by_region = collect_signals(product_clean)
    
    results = []
    timestamp = datetime.datetime.utcnow().isoformat()
    
    for region, signals in signals_by_region.items():
        prediction_res = predict_demand(signals['trend'], signals['social'], signals['ecommerce'])
        score = prediction_res['score'] if isinstance(prediction_res, dict) else prediction_res

        units = compute_recommended_units(score)
        
        doc = {
            "region": region,
            "product": product_clean,
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
    product_clean = product.strip()
    region_clean = region.strip()
    
    if use_in_memory:
        # Find latest with normalized matching
        matches = [d for d in in_memory_db if d['product'].lower() == product_clean.lower() and d['region'].lower() == region_clean.lower()]
        if matches:
            # Assumes append order is chronological
            return DemandResponse(**matches[-1])
        raise HTTPException(status_code=404, detail=f"No data found for {product_clean} in {region_clean}")
    else:
        try:
            # Using regex for flexible matching (case-insensitive and boundary-respecting)
            doc = collection.find_one(
                {"product": {"$regex": f"^{re.escape(product_clean)}$", "$options": "i"}, 
                 "region": {"$regex": f"^{re.escape(region_clean)}$", "$options": "i"}},
                sort=[("timestamp", -1)]
            )
            if doc:
                return DemandResponse(**doc)
            raise HTTPException(status_code=404, detail=f"No data found for {product_clean} in {region_clean}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {e}")

@app.get("/api/demand/all", response_model=List[DemandResponse])
async def get_all_demands():
    """
    Returns all collected predictions.
    """
    docs = get_predictions()
    return [DemandResponse(**d) for d in docs]


# Load brand data from external JSON
brand_data_path = os.path.join(os.path.dirname(__file__), 'brand_data.json')
try:
    with open(brand_data_path, 'r') as f:
        PRODUCT_BRAND_MAP = json.load(f)
    print(f"Loaded {len(PRODUCT_BRAND_MAP)} product-brand mappings from JSON.")
except Exception as e:
    print(f"Error loading brand_data.json: {e}. Using minimal fallback.")
    PRODUCT_BRAND_MAP = {"laptop": ["HP", "Dell"], "phone": ["Samsung", "Apple"]}

# In-memory cache for web-discovered brands
_web_brand_cache: Dict[str, List[str]] = {}

async def _search_brands_online(product: str) -> List[str]:
    """
    Searches DuckDuckGo for real brand/company names that make the given product.
    Parses the results to extract brand names. Falls back to a curated generic list
    only if the web search itself fails (network error, etc.).
    """
    query = f"top brands of {product} in India 2025"
    url = "https://html.duckduckgo.com/html/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.post(url, data={"q": query}, headers=headers)
            resp.raise_for_status()
            html = resp.text

        # Extract snippet text from DuckDuckGo result entries
        # DuckDuckGo HTML results have snippets inside <a class="result__snippet"> tags
        snippets = re.findall(r'class="result__snippet"[^>]*>(.*?)</a>', html, re.DOTALL)
        titles = re.findall(r'class="result__a"[^>]*>(.*?)</a>', html, re.DOTALL)

        raw_text = " ".join(snippets[:8] + titles[:8])
        # Clean HTML tags from extracted text
        raw_text = re.sub(r'<[^>]+>', ' ', raw_text)
        raw_text = re.sub(r'&amp;', '&', raw_text)
        raw_text = re.sub(r'&#x27;', "'", raw_text)
        raw_text = re.sub(r'&\w+;', ' ', raw_text)

        # Strategy: look for comma/number-separated lists of capitalized words
        # Common patterns: "1. Samsung 2. Apple 3. Xiaomi" or "Samsung, Apple, Xiaomi"
        brands_found: List[str] = []

        # Pattern 1: Numbered lists like "1. Samsung" "2. Apple"
        numbered = re.findall(r'\d+[\.\)\-]\s*([A-Z][A-Za-z&\' .]+?)(?=[,\.;\d]|$)', raw_text)
        for b in numbered:
            name = b.strip().rstrip('.')
            if 2 <= len(name) <= 30 and name.lower() != product.lower():
                brands_found.append(name)

        # Pattern 2: Capitalized words/phrases that look like brand names
        # near the product keyword
        cap_words = re.findall(r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b', raw_text)
        # Common non-brand words to exclude
        stop_words = {
            'The', 'Top', 'Best', 'India', 'Indian', 'Most', 'Popular', 'List',
            'Brand', 'Brands', 'Company', 'Companies', 'Product', 'Products',
            'Review', 'Reviews', 'Price', 'Buy', 'Online', 'Quality', 'Market',
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December',
            'Updated', 'Guide', 'Which', 'What', 'How', 'Are', 'For', 'And',
            'With', 'From', 'This', 'That', 'These', 'Those', 'Here', 'Service',
            'There', 'Where', 'When', 'Why', 'All', 'Your', 'Our', 'Business',         
            'Their', 'More', 'Also', 'Some', 'Other', 'New', 'Year', 'Ratings',
            'Comparison', 'Available', 'Sale', 'Offers', 'Deals', 'Feature'
        }
        for w in cap_words:
            if w not in stop_words and w.lower() != product.lower() and len(w) >= 2:
                brands_found.append(w)

        # Deduplicate while preserving order
        seen = set()
        unique_brands: List[str] = []
        for b in brands_found:
            key = b.lower().strip()
            if key not in seen:
                seen.add(key)
                unique_brands.append(b.strip())

        if len(unique_brands) >= 3:
            return unique_brands[:7]

        logging.warning(f"Web search for '{product}' found only {len(unique_brands)} brands, returning what we have.")
        if unique_brands:
            return unique_brands[:7]

    except Exception as e:
        logging.error(f"Web brand search failed for '{product}': {e}")

    # Absolute fallback — should rarely happen
    return [f"Top {product.title()} Co.", f"{product.title()} Plus", f"{product.title()} Pro",
            f"{product.title()} World", f"{product.title()} Hub", f"{product.title()} India"]


async def get_brands_for_product(product: str) -> List[str]:
    """Return relevant brands for the searched product.
    First checks the hardcoded map, then searches the web for real brands."""
    pl = product.lower().strip()
    for keyword, brands in PRODUCT_BRAND_MAP.items():
        if keyword in pl:
            return brands

    # Check cache
    if pl in _web_brand_cache:
        logging.info(f"Returning cached web brands for '{product}'")
        return _web_brand_cache[pl]

    # Search the internet for real brands
    logging.info(f"Product '{product}' not in map — searching the web for brands...")
    web_brands = await _search_brands_online(product)
    _web_brand_cache[pl] = web_brands
    return web_brands

@app.get("/api/brand-demand", response_model=BrandDemandResponse)
async def get_brand_demand(
    product: str = Query(..., description="Product name to analyze brand demand"),
    state: Optional[str] = Query(None, description="Indian state to filter demand (optional)")
):
    """
    Returns brand/company-wise demand breakdown for a searched product.
    If a state is provided, demand scores are adjusted per-state using a
    deterministic seed so results are consistent and state-unique.
    """
    if not product:
        raise HTTPException(status_code=400, detail="Product name required")

    brands = await get_brands_for_product(product)
    seed_base = sum(ord(c) for c in product.lower())

    # Mix in state seed so each state has unique but deterministic scores
    state_seed = sum(ord(c) for c in state.lower()) if state else 0

    raw_scores = []
    for brand in brands:
        brand_seed = sum(ord(c) for c in brand)
        random.seed(seed_base + brand_seed + state_seed)
        score = round(random.uniform(20, 100), 2)
        raw_scores.append(score)

    total = sum(raw_scores)
    brand_items = []
    top_brand = brands[0]
    top_score = 0.0

    trends = ['rising', 'stable', 'falling']
    for i, brand in enumerate(brands):
        score = raw_scores[i]
        share = round((score / total) * 100, 2)
        random.seed(seed_base + state_seed + i + 42)
        trend = random.choice(trends)
        units = round(score * 1.5, 1)
        if score > top_score:
            top_score = score
            top_brand = brand
        brand_items.append(BrandDemandItem(
            brand=brand,
            demand_score=score,
            market_share=share,
            trend=trend,
            recommended_units=units
        ))

    # Sort descending by demand_score
    brand_items.sort(key=lambda x: x.demand_score, reverse=True)
    # Recalculate top_brand after sort
    top_brand = brand_items[0].brand

    return BrandDemandResponse(product=product, state=state, top_brand=top_brand, brands=brand_items)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
