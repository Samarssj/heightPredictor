import sys
import numpy as np
import joblib

# Load trained model
model = joblib.load('height_model.pkl')

# Get weight from command line argument
weight = float(sys.argv[1])
predicted_height = model.predict(np.array([[weight]]))[0]
print(f"{predicted_height:.2f}")
