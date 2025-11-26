const axios = require("axios");
const { ML_API_URL } = require("../config/env");

const predictSaving = async (data) => {
  try {
    const response = await axios.post(`${ML_API_URL}/predict_saving`, data, { timeout: 5000 });
    return response.data;
  } catch (err) {
    console.error("ML API Error (predict_saving):", err?.response?.data || err.message);
    // Fallback heuristic if ML service is unavailable
    const monthly_income = Number(data.monthly_income || 0);
    const monthly_expense_total = Number(data.monthly_expense_total || 0);
    const debt_to_income_ratio = Number(data.debt_to_income_ratio || 0);
    const investment_amount = Number(data.investment_amount || 0);
    const base = monthly_income - monthly_expense_total;
    const adjustment = (-0.1 * debt_to_income_ratio * monthly_income) + (0.05 * investment_amount);
    const predicted = Math.max(0, base + adjustment);
    return { predicted_saving_usd: Number(predicted.toFixed(2)) };
  }
};

const predictExpense = async (data) => {
  try {
    const response = await axios.post(`${ML_API_URL}/predict_expense`, data, { timeout: 5000 });
    return response.data;
  } catch (err) {
    console.error("ML API Error (predict_expense):", err?.response?.data || err.message);
    // Fallback heuristic
    const monthly_expense_total = Number(data.monthly_expense_total || 0);
    const subscription_services = Number(data.subscription_services || 0);
    const variable_spend = Math.max(0, monthly_expense_total - subscription_services);
    const predicted = variable_spend + subscription_services;
    return { predicted_expense_usd: Number(predicted.toFixed(2)) };
  }
};

module.exports = {
  predictSaving,
  predictExpense,
};

