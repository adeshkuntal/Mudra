from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained models
saving_model = joblib.load("actual_saving_prediction.pkl")
expense_model = joblib.load("expense_predictor.pkl")

# Predict actual savings
@app.route("/predict_saving", methods=["POST"])
def predict_saving():
    try:
        data = request.get_json()
        
        # Convert input to DataFrame
        df = pd.DataFrame([data])

        # Ensure input has all required features (fill missing with 0)
        if hasattr(saving_model, "feature_names_in_"):
            for col in saving_model.feature_names_in_:
                if col not in df.columns:
                    df[col] = 0
            df = df[saving_model.feature_names_in_]

        # Predict
        prediction = saving_model.predict(df)

        # Convert prediction to float
        if isinstance(prediction, (np.ndarray, list)):
            prediction = float(prediction[0])

        return jsonify({"predicted_saving_usd": round(prediction, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Health check
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "models_loaded": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)

