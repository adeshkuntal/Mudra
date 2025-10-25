import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LogOut, X, Send } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [budgets, setBudgets] = useState({ total: 0, categories: {} });
  const [newTransaction, setNewTransaction] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [topbarWarning, setTopbarWarning] = useState("");
  
  // AI Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

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

  const handleAskAI = async (message) => {
    const userMessage = message || chatInput;
    if (!userMessage || !userMessage.trim()) return;
    
    setAiLoading(true);
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', content: userMessage }]);
    setChatInput("");

    try {
      const income = transactions
        .filter(t => t.type === "Income")
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const expenses = transactions
        .filter(t => t.type === "Expense")
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
      
      const savings = income - expenses;

      const userData = {
        income,
        expenses,
        savings,
        categories: Object.keys(budgets.categories || {}).join(', ') || 'None',
        transactionCount: transactions.length
      };

      const response = await axios.post(`${API_BASE}/api/ai/ask`, {
        message: userMessage,
        userData
      });

      setChatHistory(prev => [...prev, { type: 'ai', content: response.data.response }]);
    } catch (err) {
      console.error("AI Error:", err);
      toast.error("Failed to get AI response");
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
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

          <div className="flex items-center w-full max-w-xl relative">
            <input
              type="text"
              placeholder="🔎 Ask AI: How much did I spend on food last month?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowChat(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button 
              onClick={() => handleAskAI()}
              disabled={aiLoading}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? "..." : "Ask"}
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

      {/* AI Chat Popup */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <h3 className="font-semibold">AI Financial Assistant</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-white hover:text-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg font-semibold mb-2">👋 Hello!</p>
                <p className="text-sm">
                  I'm your AI financial assistant. Ask me anything about your finances!
                </p>
                <div className="mt-4 text-left text-xs space-y-2">
                  <p className="font-semibold text-gray-700">Try asking:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>How can I save more money?</li>
                    <li>What are my spending patterns?</li>
                    <li>Budgeting tips for this month</li>
                  </ul>
                </div>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiLoading || !chatInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {chatHistory.length > 0 && (
              <button
                onClick={clearChat}
                className="mt-2 text-xs text-gray-500 hover:text-red-600 transition"
              >
                Clear chat
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
