import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const Dashboard = () => {
  const { transactions, budgets } = useOutletContext();

  const income = transactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const incomeExpenseData = [
    { name: "Income", value: income },
    { name: "Expenses", value: expenses },
  ];

  const categoryExpenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

  const categoryData = Object.entries(categoryExpenses).map(([cat, val]) => ({
    name: cat,
    value: val,
  }));

  const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#FF4444"];

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, Adesh</h1>
          <p className="text-gray-600 mt-2">
            Here’s your financial overview for this month.
          </p>
        </div>
      </div>

      {/* Budget Warnings */}
      <div className="mb-6">
        {budgets?.total > 0 && expenses > budgets.total && (
          <p className="text-red-500 font-semibold">
            ⚠️ Total expenses exceeded total budget!
          </p>
        )}

        <ul className="mt-2 space-y-1">
          {Object.entries(categoryExpenses).map(([cat, amt]) => (
            <li key={cat}>
              {cat}: ${amt}{" "}
              {budgets?.categories?.[cat] && amt > budgets.categories[cat] && (
                <span className="text-red-500 font-semibold">
                  ⚠️ Over Budget
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="text-gray-500 mb-2">Current Balance</h4>
          <p className="text-3xl font-bold text-gray-800">
            ${(income - expenses).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="text-gray-500 mb-2">Monthly Income</h4>
          <p className="text-3xl font-bold text-green-600">
            ${income.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="text-gray-500 mb-2">Monthly Expenses</h4>
          <p className="text-3xl font-bold text-red-600">
            ${expenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="font-semibold mb-4 text-gray-800">
            Income vs. Expense
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeExpenseData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart by Category */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h4 className="font-semibold mb-4 text-gray-800">
            Expense by Category
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
