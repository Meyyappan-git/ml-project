import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
import os
from demand_calc import compute_demand_index

def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    # Generate random features
    trend = np.random.uniform(0, 100, num_samples)
    social = np.random.uniform(0, 100, num_samples)
    ecommerce = np.random.uniform(0, 100, num_samples)
    
    # Calculate target variable based on the given logic
    # Add some noise to make the model actually learn rather than just memorizing a hardcoded formula
    noise = np.random.normal(0, 2, num_samples)
    
    # DI = (trend * 0.4) + (social * 0.3) + (ecommerce * 0.3)
    target = (trend * 0.4) + (social * 0.3) + (ecommerce * 0.3) + noise
    # Clip between 0 and 100
    target = np.clip(target, 0, 100)
    
    df = pd.DataFrame({
        'trend': trend,
        'social': social,
        'ecommerce': ecommerce,
        'demand_score': target
    })
    return df

def train_model():
    print("Generating synthetic dataset...")
    df = generate_synthetic_data(2000)
    
    X = df[['trend', 'social', 'ecommerce']]
    y = df['demand_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    print(f"Model MSE: {mse:.4f}")
    
    model_path = os.path.join(os.path.dirname(__file__), 'demand_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
