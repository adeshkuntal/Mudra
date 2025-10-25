import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const Forecast = () => {
  const { transactions, user } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState({
    savings: null,
    expenses: null,
  });
  const [currentStats, setCurrentStats] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
  });

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  // Calculate current month stats
  useEffect(() => {
    if (!transactions || transactions.length === 0) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter((t) => t.type === "Income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = monthlyTransactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const savings = income - expenses;

    setCurrentStats({ income, expenses, savings });
  }, [transactions]);

  // Get prediction inputs from user's data
  const preparePredictionData = () => {
    if (!transactions || transactions.length === 0) {
      return null;
    }

    // Get last 3 months of data
    const now = new Date();
    const last3Months = [];

    for (let i = 0; i < 3; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === month.getFullYear();
      });

      const income = monthTransactions
        .filter((t) => t.type === "Income")
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

      last3Months.push({ income, expenses });
    }

    // Prepare data for ML model (use average of last 3 months)
    const avgIncome = last3Months.reduce((sum, m) => sum + m.income, 0) / 3;
    const avgExpenses = last3Months.reduce((sum, m) => sum + m.expenses, 0) / 3;

    return {
      income: avgIncome || currentStats.income,
      expense: avgExpenses || currentStats.expenses,
    };
  };

  const handlePredictSaving = async () => {
    setLoading(true);
    try {
      const data = preparePredictionData();
      if (!data) {
        toast.error("Not enough transaction data for prediction");
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE}/api/forecast/predict_saving`, data);
      setPredictions({ ...predictions, savings: response.data.predicted_saving_usd });
      toast.success("Savings prediction generated!");
    } catch (err) {
      console.error("Prediction error:", err);
      toast.error("Failed to predict savings. Make sure ML service is running.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictExpense = async () => {
    setLoading(true);
    try {
      const data = preparePredictionData();
      if (!data) {
        toast.error("Not enough transaction data for prediction");
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE}/api/forecast/predict_expense`, data);
      setPredictions({ ...predictions, expenses: response.data.predicted_expense_usd });
      toast.success("Expense prediction generated!");
    } catch (err) {
      console.error("Prediction error:", err);
      toast.error("Failed to predict expenses. Make sure ML service is running.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictAll = async () => {
    setLoading(true);
    try {
      const data = preparePredictionData();
      if (!data) {
        toast.error("Not enough transaction data for prediction");
        setLoading(false);
        return;
      }

      const [savingsRes, expensesRes] = await Promise.all([
        axios.post(`${API_BASE}/api/forecast/predict_saving`, data),
        axios.post(`${API_BASE}/api/forecast/predict_expense`, data),
      ]);

      setPredictions({
        savings: savingsRes.data.predicted_saving_usd,
        expenses: expensesRes.data.predicted_expense_usd,
      });
      toast.success("All predictions generated!");
    } catch (err) {
      console.error("Prediction error:", err);
      toast.error("Failed to generate predictions. Make sure ML service is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Financial Forecast</h1>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> Our ML models analyze your historical transaction data
              to predict future savings and expenses. You need at least 3 months of transaction data
              for accurate predictions.
            </p>
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-500 text-sm">Current Month Income</h4>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">${currentStats.income.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-500 text-sm">Current Month Expenses</h4>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">${currentStats.expenses.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-500 text-sm">Current Month Savings</h4>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className={`text-3xl font-bold ${currentStats.savings >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${currentStats.savings.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Prediction Buttons */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate Predictions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePredictAll}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Predict All"}
            </button>
            <button
              onClick={handlePredictSaving}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Predict Savings
            </button>
            <button
              onClick={handlePredictExpense}
              disabled={loading}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Predict Expenses
            </button>
          </div>
        </div>

        {/* Predictions Display */}
        {(predictions.savings !== null || predictions.expenses !== null) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.savings !== null && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Predicted Savings</h3>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-4xl font-extrabold text-green-600 mb-2">${predictions.savings}</p>
                <p className="text-sm text-gray-600">
                  Based on your historical data, you're expected to save this amount next month.
                </p>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">
                    This prediction is based on ML analysis of your past 3 months of transaction history.
                  </p>
                </div>
              </div>
            )}

            {predictions.expenses !== null && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl shadow border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Predicted Expenses</h3>
                  <TrendingDown className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-4xl font-extrabold text-orange-600 mb-2">${predictions.expenses}</p>
                <p className="text-sm text-gray-600">
                  Your estimated expenses for the next month based on spending patterns.
                </p>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-600">
                    This prediction is based on ML analysis of your past 3 months of transaction history.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Predictions Message */}
        {predictions.savings === null && predictions.expenses === null && !loading && (
          <div className="bg-white p-12 rounded-2xl shadow border-2 border-dashed border-gray-300 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Predictions Yet</h3>
            <p className="text-gray-500">
              Click the buttons above to generate AI-powered financial forecasts based on your
              transaction history.
            </p>
          </div>
        )}
      </div>
  </div>
  );
};

export default Forecast;
