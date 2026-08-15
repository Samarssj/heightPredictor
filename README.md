# HeightLab — Height Predictor Web App

HeightLab is an educational web application that estimates height from weight using a scikit-learn linear regression model. The frontend is a responsive HTML, CSS, and JavaScript experience with dark mode, prediction history, and a Chart.js visualization. The production API is Python-only: Flask serves the web app and loads the trained `height_model.pkl` artifact for live inference.

## Features

| Feature | Description |
|---|---|
| Model-powered prediction | Uses the serialized `LinearRegression` model in `height_model.pkl`. |
| Python-only inference | Flask and Gunicorn serve `/predict`; no Node or request-time subprocess is required. |
| Responsive interface | Mobile-friendly layout with light and dark themes. |
| Prediction history | The browser keeps submitted weights and estimates in a Chart.js graph for the current session. |
| Input validation | The API accepts weights from 1 to 1000 pounds and returns clear JSON errors. |
| Health check | `GET /health` confirms that the model loaded successfully. |

## Project structure

```text
.
├── app.py                 # Flask API and static frontend server
├── height_model.pkl       # Serialized scikit-learn model used in production
├── model.py               # Standalone model runner for local checks
├── train_model.py         # Retrains height_model.pkl from the CSV dataset
├── SOCR-HeightWeight.csv  # Training dataset
├── public/index.html      # Frontend application
├── requirements.txt       # Pinned Python runtime dependencies
└── render.yaml            # Render Python service configuration
```

## Local development

Install the pinned dependencies and start the application with Gunicorn:

```bash
python3 -m pip install -r requirements.txt
gunicorn app:app --bind 127.0.0.1:5000
```

Open `http://127.0.0.1:5000` in a browser. To test the API directly:

```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H 'Content-Type: application/json' \
  -d '{"weight":150}'
```

The expected response is similar to:

```json
{
  "weight": 150.0,
  "predicted_height": 69.87
}
```

The health endpoint is:

```bash
curl http://127.0.0.1:5000/health
```

## Retraining the model

Update `SOCR-HeightWeight.csv` if additional training data is available, then run:

```bash
python3 train_model.py
```

The script overwrites `height_model.pkl`. Restart or redeploy the Flask service so the new artifact is loaded by the Gunicorn worker. Keep the scikit-learn version aligned with the pinned version in `requirements.txt` when serializing and loading the model.

## Render deployment

Render uses the configuration in `render.yaml`:

```yaml
runtime: python
buildCommand: pip install -r requirements.txt
startCommand: gunicorn app:app --bind 0.0.0.0:$PORT
```

The application binds to Render's `$PORT`, loads `height_model.pkl` once when the worker starts, and exposes the frontend, `/health`, and `/predict` routes from the same Python service.

> This project is an educational estimate and is not a medical measurement or professional assessment.
