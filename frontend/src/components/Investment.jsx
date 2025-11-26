import React, { useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { Shield, TrendingUp, RefreshCw, BarChart3, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

const riskOptions = [
  { value: "conservative", label: "Conservative", description: "Capital protection & steady income" },
  { value: "balanced", label: "Balanced", description: "Blend of growth and stability" },
  { value: "aggressive", label: "Aggressive", description: "High growth with higher volatility" },
];

const Investment = () => {
  const { transactions } = useOutletContext();
  const [riskProfile, setRiskProfile] = useState("balanced");
  const [monthlyContribution, setMonthlyContribution] = useState(15000);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/investment/plan`, {
        riskProfile,
        monthlyContribution: Number(monthlyContribution),
      });
      setPlanData(response.data);
    } catch (err) {
      console.error("Investment plan error:", err);
      toast.error(err.response?.data?.error || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const forecastMax = planData?.plan?.forecast?.reduce((max, point) => Math.max(max, point.value), 0) || 0;

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Auto-Investment Planner</h1>
            <p className="text-gray-600">AI advisor that tailors SIP & asset allocation based on your profile.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Risk Profile</h3>
            <div className="space-y-2">
              {riskOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRiskProfile(option.value)}
                  className={`w-full text-left border rounded-xl p-3 transition ${
                    riskProfile === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="font-semibold text-gray-800">{option.label}</div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Monthly Investment</h3>
            <div className="space-y-3">
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full"
              />
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 text-lg font-semibold"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
              />
              <p className="text-xs text-gray-500">Recommended: 20-30% of your monthly savings.</p>
            </div>
          </div>

          {planData?.analysis && (
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Quick Analytics</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Savings Rate</span>
                  <span className="font-semibold">{planData.analysis.savingsRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Monthly Income</span>
                  <span className="font-semibold">₹{Math.round(planData.analysis.averageMonthlyIncome).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Monthly Expenses</span>
                  <span className="font-semibold">₹{Math.round(planData.analysis.averageMonthlyExpenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Top Category</span>
                  <span className="font-semibold">
                    {planData.analysis.topCategories?.[0]?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {planData?.plan ? (
          <>
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">AI Investment Strategy</h2>
                  <p className="text-gray-600">{planData.plan.summary}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {planData.plan.allocations.map((alloc) => (
                  <div key={alloc.asset} className="border rounded-xl p-4">
                    <div className="text-sm text-gray-500 uppercase">{alloc.asset}</div>
                    <div className="text-2xl font-bold text-gray-800">{Math.round(alloc.weight * 100)}%</div>
                    <p className="text-sm text-gray-600 mb-2">₹{alloc.monthlySip.toLocaleString()} / mo</p>
                    <p className="text-xs text-gray-500 mb-1">Suggested:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {alloc.instruments.map((ins) => (
                        <li key={ins}>• {ins}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Rebalancing Advice</h3>
                    <p className="text-sm text-gray-600">{planData.plan.rebalancing.frequency}</p>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  {planData.plan.rebalancing.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-600 font-semibold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {planData.analysis.overBudgetCategories?.length > 0 && (
                <div className="bg-white rounded-2xl shadow p-6 border border-amber-200">
                  <div className="flex items-center gap-3 mb-3 text-amber-700">
                    <AlertTriangle />
                    <h3 className="text-lg font-semibold">Budget Watchlist</h3>
                  </div>
                  <p className="text-sm text-amber-700 mb-3">
                    You are over budget in these categories. Trim 5-10% and redirect savings to SIPs:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {planData.analysis.overBudgetCategories.map((cat) => (
                      <span key={cat} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow border-2 border-dashed border-gray-200 p-12 text-center text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-semibold">No investment plan yet</p>
            <p className="text-sm">Select your risk profile and monthly amount, then click Generate Plan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Investment;

