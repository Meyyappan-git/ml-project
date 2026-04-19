import joblib
import numpy as np
import os
import warnings

# Suppress sklearn feature-name warnings that flood stdout when
# the model was trained on arrays but inference uses DataFrames.
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

model_path = os.path.join(os.path.dirname(__file__), 'demand_model.pkl')
model = None

def load_model():
    global model
    if os.path.exists(model_path):
        model = joblib.load(model_path)
    else:
        # Fallback if model not trained
        print(f"Model not found at {model_path}. Trying training first...")
        from train import train_model
        train_model()
        model = joblib.load(model_path)

def predict_demand(trend: float, social: float, ecommerce: float) -> dict:
    """
    Predict demand score using the loaded RandomForestRegressor (Ensemble).
    Includes Model Explainability (SHAP mock) and Confidence.
    """
    if model is None:
        load_model()

    # Use a plain numpy array to avoid sklearn feature-name warnings
    X = np.array([[trend, social, ecommerce]])

    # In a real heavy system we'd run: shap_values = shap.TreeExplainer(model).shap_values(X)
    # But for real-time API we mock the localized explainer impact based on variance.
    prediction = float(model.predict(X)[0])
    
    # Confidence is derived from ensemble tree variance
    preds = np.array([dt.predict(X)[0] for dt in model.estimators_])
    variance = max(0.1, float(preds.std()))
    confidence = max(0.0, min(100.0, 100.0 - (variance * 2.5)))
    
    # SHAP Explainer (Impact values)
    total_signal = trend + social + ecommerce + 0.001
    shap_impact = {
        "trend_impact": (trend / total_signal) * 100,
        "social_impact": (social / total_signal) * 100,
        "ecommerce_impact": (ecommerce / total_signal) * 100
    }
    
    return {
        "score": prediction,
        "confidence": confidence,
        "explainability": shap_impact
    }
