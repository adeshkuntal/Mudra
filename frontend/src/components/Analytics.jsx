import React, { useEffect, useState } from "react";
import axios from "axios";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#FF4444"];

export default function Analytics() {
  const [summary, setSummary] = useState({ totalExpenses: 0, totalBudget: 0, remaining: 0, totalIncome: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    const load = async () => {
      const [s, txns] = await Promise.all([
        axios.get(`${API_BASE}/api/analytics/summary`),
        axios.get(`${API_BASE}/api/transactions`),
      ]);
      setSummary(s.data);
      const categoryExpenses = txns.data
        .filter((t) => t.type === "Expense")
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
          return acc;
        }, {});
      setCategoryData(Object.entries(categoryExpenses).map(([name, value]) => ({ name, value })));
    };
    load();
  }, []);

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="text-gray-500 mb-2">Total Budget</h4>
          <p className="text-3xl font-bold text-gray-800">₹{summary.totalBudget.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="text-gray-500 mb-2">Total Expenses</h4>
          <p className="text-3xl font-bold text-red-600">₹{summary.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="text-gray-500 mb-2">Remaining</h4>
          <p className="text-3xl font-bold text-green-600">₹{summary.remaining.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="font-semibold mb-4 text-gray-800">Expense by Category</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} label>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="font-semibold mb-4 text-gray-800">Income vs Expense</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[{ name: "Income", value: summary.totalIncome }, { name: "Expenses", value: summary.totalExpenses }]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}



