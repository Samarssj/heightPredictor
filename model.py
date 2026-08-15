import sys
from pathlib import Path

import joblib
import numpy as np


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "height_model.pkl"


def main() -> None:
    if len(sys.argv) != 2:
        raise ValueError("A single weight value is required")

    weight = float(sys.argv[1])
    if not np.isfinite(weight) or weight <= 0:
        raise ValueError("Weight must be a positive number")

    model = joblib.load(MODEL_PATH)
    predicted_height = float(model.predict(np.array([[weight]]))[0])
    print(f"{predicted_height:.2f}")


if __name__ == "__main__":
    main()
