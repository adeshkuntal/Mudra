from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model
model = joblib.load("actual_saving_prediction.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Convert input to DataFrame
        df = pd.DataFrame([data])

        # Ensure input has all required features (fill missing with 0)
        if hasattr(model, "feature_names_in_"):
            for col in model.feature_names_in_:
                if col not in df.columns:
                    df[col] = 0
            df = df[model.feature_names_in_]

        # Predict
        prediction = model.predict(df)

        # Convert prediction to list
        if isinstance(prediction, (np.ndarray, list)):
            prediction = prediction.tolist()

        return jsonify({"prediction": prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
