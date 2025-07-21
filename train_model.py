import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import joblib

# Load data
df = pd.read_csv("SOCR-HeightWeight.csv")
df.rename(columns={'Height(Inches)': 'height', 'Weight(Pounds)': 'weight'}, inplace=True)

# Train model
X = df[['weight']]
y = df['height']
model = LinearRegression()
model.fit(X, y)

# Save model
joblib.dump(model, 'height_model.pkl')
print("Model saved to height_model.pkl")
