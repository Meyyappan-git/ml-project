import random
from typing import Dict, Any

INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", 
    "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal"
]

def collect_signals(product: str) -> Dict[str, Dict[str, float]]:
    """
    Collects Google Trends, social media, and e-commerce signals for a product across Indian states.
    In a real scenario, this would use pytrends and actual APIs.
    We simulate the pytrends response structure due to pytrends rate limits and instability.
    """
    results = {}
    
    # Simulate data for each state
    # We use a base random seed derived from the product string to keep responses consistent 
    # per product but different between products.
    seed_base = sum(ord(c) for c in product)
    
    for state in INDIAN_STATES:
        # Simulate local variance based on state string
        state_seed = sum(ord(c) for c in state)
        random.seed(seed_base + state_seed)
        
        trend_score = random.uniform(10, 100)
        social_score = random.uniform(5, 100)
        ecommerce_score = random.uniform(10, 100)
        
        results[state] = {
            "trend": trend_score,
            "social": social_score,
            "ecommerce": ecommerce_score
        }
        
    return results

# If you prefer to use the actual pytrends structure (note: it often fails with 429 Too Many Requests):
# from pytrends.request import TrendReq
# def _real_pytrends_collect(product: str):
#     pytrends = TrendReq(hl='en-US', tz=-330, timeout=(10,25))
#     pytrends.build_payload([product], cat=0, timeframe='today 1-m', geo='IN', gprop='')
#     df = pytrends.interest_by_region(resolution='REGION', inc_low_vol=True, inc_geo_code=False)
#     return df
