from typing import Dict

def compute_demand_index(trend: float, social: float, ecommerce: float) -> float:
    """
    Computes Demand Index (DI) using the formula:
    DI = (trend * 0.4) + (social * 0.3) + (ecommerce * 0.3)
    Ensures the result is normalized between 0-100.
    """
    di = (trend * 0.4) + (social * 0.3) + (ecommerce * 0.3)
    return max(0.0, min(100.0, di))

def compute_recommended_units(demand_index: float) -> float:
    """
    Computes recommended units using the formula:
    units = DI * 70
    """
    return demand_index * 70.0
