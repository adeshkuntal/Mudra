import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";

export default function Layout() {
  const [transactions, setTransactions] = useState([
    { date: "Dec 15, 2024", description: "Grocery shopping at Whole Foods", category: "Food & Dining", type: "Expense", amount: -127.45 },
    { date: "Dec 14, 2024", description: "Salary deposit", category: "Salary", type: "Income", amount: 3500 },
    { date: "Dec 13, 2024", description: "Coffee at Starbucks", category: "Food & Dining", type: "Expense", amount: -5.75 },
    { date: "Dec 13, 2024", description: "Gas station fill-up", category: "Transportation", type: "Expense", amount: -48.2 },
  ]);

  const [budgets, setBudgets] = useState({ total: 0, categories: {} });
  const [newTransaction, setNewTransaction] = useState({});
  const [showForm, setShowForm] = useState(false);

  // ---- Budget Warnings (GLOBAL) ----
  useEffect(() => {
    if (transactions.length === 0) return;

    const totalExpenses = transactions
      .filter((t) => t.type === "Expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categoryExpenses = transactions
      .filter((t) => t.type === "Expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    if (budgets?.total > 0 && totalExpenses > budgets.total) {
      alert(
        `⚠️ Total expenses ($${totalExpenses}) exceeded total budget ($${budgets.total})`
      );
    }

    if (
      newTransaction?.category &&
      budgets?.categories?.[newTransaction.category] &&
      categoryExpenses[newTransaction.category] >
        budgets.categories[newTransaction.category]
    ) {
      alert(
        `⚠️ ${newTransaction.category} expenses ($${
          categoryExpenses[newTransaction.category]
        }) exceeded its budget ($${
          budgets.categories[newTransaction.category]
        })`
      );
    }
  }, [transactions, budgets]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white border-r shadow-lg">
        <div className="flex items-center gap-3 px-6 py-3 border-b bg-gray-50">
          <img
            src="/logo.jpg"
            alt="logo"
            className="h-12 w-12 rounded-full object-cover shadow border border-black"
          />
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Mudra
          </h1>
        </div>

        <nav className="flex flex-col gap-2 px-4 py-6 flex-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-4 py-2 text-left rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `px-4 py-2 text-left rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`
            }
          >
            Transactions
          </NavLink>

          <NavLink
            to="/budget"
            className={({ isActive }) =>
              `px-4 py-2 text-left rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`
            }
          >
            Budgets
          </NavLink>

          <NavLink
            to="/forecast"
            className={({ isActive }) =>
              `px-4 py-2 text-left rounded-lg font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`
            }
          >
            Forecast
          </NavLink>
        </nav>

        <div className="px-6 py-5 border-t bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">Adesh Kuntal</p>
          <p className="text-xs text-gray-500">adeshkuntal092@gmail.com</p>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <div className="flex items-center w-full max-w-xl">
            <input
              type="text"
              placeholder="🔎 Ask AI: How much did I spend on food last month?"
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button className="px-5 py-2 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition">
              Ask
            </button>
          </div>
        </div>

        {/* Child Routes */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet
            context={{
              transactions,
              setTransactions,
              budgets,
              setBudgets,
              newTransaction,
              setNewTransaction,
              showForm,
              setShowForm,
            }}
          />
        </div>
      </div>
    </div>
  );
}
