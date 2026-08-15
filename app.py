from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "height_model.pkl"
PUBLIC_DIR = BASE_DIR / "public"

# Load the trained artifact once when the web worker starts.
model = joblib.load(MODEL_PATH)

app = Flask(__name__, static_folder=str(PUBLIC_DIR), static_url_path="")


@app.get("/")
def home():
    return send_from_directory(PUBLIC_DIR, "index.html")


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "model": MODEL_PATH.name,
        "model_type": type(model).__name__,
    })


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    try:
        weight = float(payload.get("weight"))
    except (TypeError, ValueError):
        return jsonify({"error": "Weight must be a number."}), 400

    if not 0 < weight <= 1000:
        return jsonify({"error": "Enter a weight between 1 and 1000 pounds."}), 400

    # Preserve the feature name used during training and avoid sklearn warnings.
    features = pd.DataFrame({"weight": [weight]})
    predicted_height = float(model.predict(features)[0])

    return jsonify({
        "weight": weight,
        "predicted_height": round(predicted_height, 2),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
