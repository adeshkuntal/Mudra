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
  const [horizonMonths, setHorizonMonths] = useState(6);
  const [scenario, setScenario] = useState({
    subscriptionCutPct: 0,
    expectedRaise: 0,
  });
  const [projections, setProjections] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", months: "" });
  
 
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

    const income = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  
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
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "Expense")
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      // Heuristics based on category keywords
      const getCategory = (t) => (t.category || "").toString().toLowerCase();
      const isDebt = (cat) => /\b(debt|loan|emi|mortgage|credit|repay|installment)\b/i.test(cat);
      const isInvestment = (cat) => /\b(invest|sip|mutual|stock|equity|etf|retire|401k|ira)\b/i.test(cat);
      const isSubscription = (cat, desc) => /\b(sub|subscription|membership|netflix|prime|spotify|yt premium|apple music|hulu|disney|plan)\b/i.test(cat) || /\b(subscription|membership)\b/i.test(desc || "");

      const debtPayments = monthTransactions
        .filter((t) => t.type === "Expense" && isDebt(getCategory(t)))
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      const investmentOutflow = monthTransactions
        .filter((t) => t.type === "Expense" && isInvestment(getCategory(t)))
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      const subscriptionOutflow = monthTransactions
        .filter((t) => t.type === "Expense" && isSubscription(getCategory(t), t.description))
        .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);

      last3Months.push({ income, expenses, debtPayments, investmentOutflow, subscriptionOutflow });
    }

    // Prepare data for ML model (use average of last 3 months)
    const avgIncome = last3Months.reduce((sum, m) => sum + m.income, 0) / last3Months.length;
    const avgExpenses = last3Months.reduce((sum, m) => sum + m.expenses, 0) / last3Months.length;
    const avgDebt = last3Months.reduce((sum, m) => sum + (m.debtPayments || 0), 0) / last3Months.length;
    const avgInvestment = last3Months.reduce((sum, m) => sum + (m.investmentOutflow || 0), 0) / last3Months.length;
    const avgSubscriptions = last3Months.reduce((sum, m) => sum + (m.subscriptionOutflow || 0), 0) / last3Months.length;

    const monthly_income = avgIncome || currentStats.income || 0;
    const monthly_expense_total = avgExpenses || currentStats.expenses || 0;
    const savings_rate = monthly_income > 0 ? (monthly_income - monthly_expense_total) / monthly_income : 0;
    const debt_to_income_ratio = monthly_income > 0 ? avgDebt / monthly_income : 0;
    const investment_amount = avgInvestment || 0;
    const subscription_services = avgSubscriptions || 0;

    return {
      monthly_income,
      monthly_expense_total,
      savings_rate,
      debt_to_income_ratio,
      investment_amount,
      subscription_services,
    };
  };

  // Local 3-6 month projections with simple heuristics and scenarios
  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setProjections([]);
      return;
    }

    // Base averages from last 3 months
    const data = preparePredictionData();
    if (!data) {
      setProjections([]);
      return;
    }

    const months = Math.max(1, Math.min(12, Number(horizonMonths) || 6));
    const results = [];
    const today = new Date();

    // Apply scenario: subscription reduction and expected raise
    const raiseMonthly = Number(scenario.expectedRaise || 0) / 12;
    const subscriptionCut = Math.max(0, Math.min(100, Number(scenario.subscriptionCutPct || 0)));

    let baseIncome = data.monthly_income + raiseMonthly; // apply raise evenly per month
    let baseExpenses = data.monthly_expense_total;
    const subscriptionSavings = (data.subscription_services || 0) * (subscriptionCut / 100);

    for (let i = 1; i <= months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);

      // Optional drift assumptions (very light): 0.2% monthly income growth, 0.2% expense inflation
      const income = baseIncome * Math.pow(1.002, i - 1);
      const expenses = Math.max(0, (baseExpenses - subscriptionSavings) * Math.pow(1.002, i - 1));
      const savings = income - expenses;

      results.push({
        label: date.toLocaleString(undefined, { month: "short", year: "2-digit" }),
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        savings: Number(savings.toFixed(2)),
      });
    }

    setProjections(results);
  }, [transactions, horizonMonths, scenario.subscriptionCutPct, scenario.expectedRaise]);

  const addGoal = () => {
    const name = (newGoal.name || "").trim();
    const targetAmount = Number(newGoal.targetAmount || 0);
    const months = Number(newGoal.months || 0);
    if (!name || targetAmount <= 0 || months <= 0) return;
    setGoals((g) => [...g, { id: crypto.randomUUID(), name, targetAmount, months }]);
    setNewGoal({ name: "", targetAmount: "", months: "" });
  };

  const deleteGoal = (id) => {
    setGoals((g) => g.filter((x) => x.id !== id));
  };

  // Simple allocation: split projected monthly surplus across goals by urgency (months) and size
  const getGoalAllocations = () => {
    if (!projections || projections.length === 0) return { perMonth: 0, allocations: [] };
    const projectedMonthlySavings = Math.max(0, projections[0]?.savings || 0);
    if (goals.length === 0 || projectedMonthlySavings <= 0) return { perMonth: projectedMonthlySavings, allocations: [] };

    // Priority score = targetAmount / months (higher means more urgent load); normalize to weights
    const scores = goals.map((g) => ({ id: g.id, name: g.name, score: (g.targetAmount || 0) / (g.months || 1) }));
    const totalScore = scores.reduce((s, x) => s + x.score, 0) || 1;
    const allocations = scores.map((s) => ({ id: s.id, name: s.name, monthly: Number(((s.score / totalScore) * projectedMonthlySavings).toFixed(2)) }));
    return { perMonth: projectedMonthlySavings, allocations };
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

        {/* Scenario Planner & Projections */}
        <div className="bg-white p-6 rounded-2xl shadow mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Scenario Planning & Projections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Horizon (months)</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={horizonMonths}
                onChange={(e) => setHorizonMonths(Number(e.target.value))}
              >
                <option value={3}>3</option>
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Reduce subscriptions (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={scenario.subscriptionCutPct}
                onChange={(e) => setScenario((s) => ({ ...s, subscriptionCutPct: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., 30"
              />
              <p className="text-xs text-gray-500 mt-1">Example: "What if I reduce subscriptions by 30%?"</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Annual raise (₹)</label>
              <input
                type="number"
                min="0"
                value={scenario.expectedRaise}
                onChange={(e) => setScenario((s) => ({ ...s, expectedRaise: Number(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., 10000"
              />
              <p className="text-xs text-gray-500 mt-1">Example: "What if I get a ₹10,000 raise?"</p>
            </div>
          </div>

          {/* Simple timeline visualization */}
          {projections.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Projected Savings vs Expenses</h3>
                  <div className="space-y-2">
                    {projections.map((p) => (
                      <div key={p.label} className="w-full">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{p.label}</span>
                          <span>S: ₹{p.savings.toLocaleString()} | E: ₹{p.expenses.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded">
                          <div
                            className={`h-3 ${p.savings >= 0 ? "bg-green-500" : "bg-red-500"} rounded`}
                            style={{ width: `${Math.min(100, Math.abs(p.savings) / (Math.max(1, currentStats.income) ) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Projected Net Worth (cumulative)</h3>
                  <div className="space-y-2">
                    {(() => {
                      let cum = 0;
                      return projections.map((p) => {
                        cum += p.savings;
                        return (
                          <div key={p.label}>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>{p.label}</span>
                              <span>₹{cum.toFixed(0).toString()}</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded">
                              <div className="h-3 bg-blue-500 rounded" style={{ width: `${Math.min(100, Math.abs(cum) / (Math.max(1, currentStats.income) ) * 100)}%` }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Add transactions to see projections.</p>
          )}
        </div>

        {/* Goal-Based Savings & Investment Planner */}
        <div className="bg-white p-6 rounded-2xl shadow mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Goal-Based Savings & Investment Planner</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Goal name (e.g., Buy a scooter)"
              value={newGoal.name}
              onChange={(e) => setNewGoal((g) => ({ ...g, name: e.target.value }))}
            />
            <input
              type="number"
              className="border rounded-lg px-3 py-2"
              placeholder="Target amount (₹)"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal((g) => ({ ...g, targetAmount: e.target.value }))}
            />
            <input
              type="number"
              className="border rounded-lg px-3 py-2"
              placeholder="Months"
              value={newGoal.months}
              onChange={(e) => setNewGoal((g) => ({ ...g, months: e.target.value }))}
            />
            <button onClick={addGoal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add Goal</button>
          </div>

          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((g) => (
                <div key={g.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-semibold">{g.name}</div>
                    <div className="text-xs text-gray-500">Target: ₹{g.targetAmount.toLocaleString()} in {g.months} months</div>
                  </div>
                  <button className="text-red-600 text-sm" onClick={() => deleteGoal(g.id)}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Add goals to plan monthly allocations.</p>
          )}

          <div className="mt-4">
            {(() => {
              const { perMonth, allocations } = getGoalAllocations();
              return (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Projected monthly surplus available for goals: <span className="font-semibold">₹{perMonth.toLocaleString()}</span></div>
                  {allocations.length > 0 ? (
                    <div className="space-y-2">
                      {allocations.map((a) => (
                        <div key={a.id} className="flex items-center justify-between text-sm">
                          <span>{a.name}</span>
                          <span className="font-semibold">₹{a.monthly.toLocaleString()} / mo</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No surplus available yet or no goals added.</p>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-900">
            <div className="font-semibold mb-1">India-specific suggestions</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Emergency fund: 6 months of expenses parked in liquid funds or high-yield savings.</li>
              <li>Tax-saving options under Section 80C: PPF, ELSS SIPs, EPF, SSY (as applicable).</li>
              <li>Long-term goals: SIPs in diversified equity index funds; short-term goals: low-duration debt funds/FDs.</li>
              <li>Automate SIP date within 2-3 days after salary credit for consistency.</li>
            </ul>
          </div>
        </div>
      </div>
  </div>
  );
};

export default Forecast;
