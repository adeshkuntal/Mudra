import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [budgets, setBudgets] = useState({ total: 0, categories: {} });
  const [newTransaction, setNewTransaction] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [topbarWarning, setTopbarWarning] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // Get user info
        const userRes = await axios.get(`${API_BASE}/api/auth/me`);
        setUser(userRes.data.user);

        // Load user data
        const [bRes, tRes] = await Promise.all([
          axios.get(`${API_BASE}/api/budgets`),
          axios.get(`${API_BASE}/api/transactions`),
        ]);
        const budgetData = bRes.data || { total: 0, categories: {} };
        setBudgets({ total: budgetData.total || 0, categories: budgetData.categories || {} });
        setTransactions(tRes.data || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          toast.error("Failed to load data");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`);
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const expenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const categoryExpenses = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, t) => {
      const categoryName = t.category || "";
      acc[categoryName] = (acc[categoryName] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

  const overBudgetCategories = Object.entries(budgets?.categories || {})
    .filter(([categoryName, limit]) => (categoryExpenses[categoryName] || 0) > Number(limit))
    .map(([categoryName]) => categoryName);

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
          <p className="text-sm font-semibold text-gray-700">{user?.name || "User"}</p>
          <p className="text-xs text-gray-500">{user?.email || ""}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
          {/* Budget Warnings */}
          <div>
            {budgets?.total > 0 && expenses > budgets.total && (
              <p className="text-red-500 font-semibold text-sm">
                ⚠️ Total expenses exceeded total budget!
              </p>
            )}
            {overBudgetCategories.length > 0 && (
              <p className="text-red-500 font-semibold text-sm">
                ⚠️ Over budget: {overBudgetCategories.join(", ")}
              </p>
            )}
            {topbarWarning && (
              <p className="text-red-600 font-semibold text-sm">{topbarWarning}</p>
            )}
          </div>

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
              user,
              transactions,
              setTransactions,
              budgets,
              setBudgets,
              newTransaction,
              setNewTransaction,
              showForm,
              setShowForm,
              setTopbarWarning,
            }}
          />
        </div>
      </div>
    </div>
  );
}
