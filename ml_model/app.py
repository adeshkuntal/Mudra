from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

app = FastAPI(title="Mudra ML Service", version="0.1.0")


class PredictInput(BaseModel):
    monthly_income: float
    monthly_expense_total: float
    savings_rate: float
    debt_to_income_ratio: float
    investment_amount: float
    subscription_services: float


class ScenarioInput(PredictInput):
    horizon_months: int = 6
    subscription_cut_pct: float = 0.0
    expected_raise: float = 0.0  # annual amount


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/predict_saving")
def predict_saving(payload: PredictInput):
    # Very simple heuristic model as a placeholder
    base_savings = payload.monthly_income - payload.monthly_expense_total
    adjustment = (-0.1 * payload.debt_to_income_ratio * payload.monthly_income) + (0.05 * payload.investment_amount)
    predicted = max(0.0, base_savings + adjustment)
    return {"predicted_saving_usd": round(float(predicted), 2)}


@app.post("/predict_expense")
def predict_expense(payload: PredictInput):
    # Simple expense predictor using subscriptions as a controllable fixed component
    variable_spend = max(0.0, payload.monthly_expense_total - payload.subscription_services)
    predicted = variable_spend + payload.subscription_services * 1.0
    return {"predicted_expense_usd": round(float(predicted), 2)}


@app.post("/projections")
def projections(payload: ScenarioInput):
    months = int(max(1, min(12, payload.horizon_months)))
    raise_monthly = payload.expected_raise / 12.0
    subscription_cut_amt = payload.subscription_services * (payload.subscription_cut_pct / 100.0)

    income0 = payload.monthly_income + raise_monthly
    expense0 = max(0.0, payload.monthly_expense_total - subscription_cut_amt)

    rows = []
    cum = 0.0
    for i in range(1, months + 1):
        income = income0 * (1.002 ** (i - 1))
        expense = expense0 * (1.002 ** (i - 1))
        saving = income - expense
        cum += saving
        rows.append({
            "month_index": i,
            "income": round(float(income), 2),
            "expenses": round(float(expense), 2),
            "savings": round(float(saving), 2),
            "net_worth_delta": round(float(cum), 2),
        })
    return {"projections": rows}


@app.post("/scenario")
def scenario(payload: ScenarioInput):
    # Returns a quick summary for UI scenario agent
    base_savings = payload.monthly_income - payload.monthly_expense_total
    subscription_cut_amt = payload.subscription_services * (payload.subscription_cut_pct / 100.0)
    raise_monthly = payload.expected_raise / 12.0

    new_income = payload.monthly_income + raise_monthly
    new_expense = max(0.0, payload.monthly_expense_total - subscription_cut_amt)
    new_savings = new_income - new_expense

    delta = new_savings - base_savings
    return {
        "base_monthly_savings": round(float(base_savings), 2),
        "new_monthly_savings": round(float(new_savings), 2),
        "delta": round(float(delta), 2),
        "explanations": [
            f"Subscriptions reduced by {payload.subscription_cut_pct}% saves about {round(float(subscription_cut_amt), 2)} per month.",
            f"Annual raise adds about {round(float(raise_monthly), 2)} per month to income.",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
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






