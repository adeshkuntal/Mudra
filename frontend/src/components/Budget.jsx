import React, { useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const Budget = () => {
  const { budgets, setBudgets, transactions } = useOutletContext();
  const [total, setTotal] = useState(Number(budgets.total ?? 0));
  const [categoryName, setCategoryName] = useState("");
  const [categoryAmount, setCategoryAmount] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  const saveTotal = async () => {
    const updated = { ...budgets, total: Number(total) };
    setBudgets(updated);
    try {
      await axios.put(`${API_BASE}/api/budgets`, { total: Number(total), categories: budgets.categories || {} });
    } catch (err) {
      console.error("Failed to save budget:", err);
    }
  };

  const addCategory = async () => {
    if (!categoryName || !categoryAmount) return;
    const newCategories = {
      ...budgets.categories,
      [categoryName]: Number(categoryAmount)
    };
    const updated = {
      ...budgets,
      categories: newCategories
    };
    setBudgets(updated);
    try {
      await axios.put(`${API_BASE}/api/budgets`, { total: budgets.total || 0, categories: newCategories });
      setCategoryName("");
      setCategoryAmount("");
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  const deleteCategory = async (name) => {
    if (!name) return;
    const { [name]: _omit, ...rest } = budgets.categories || {};
    const updated = {
      ...budgets,
      categories: rest,
    };
    setBudgets(updated);
    try {
      await axios.put(`${API_BASE}/api/budgets`, { total: budgets.total || 0, categories: rest });
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  // Calculate spending per category
  const calculateCategorySpending = (categoryName) => {
    return transactions
      .filter(t => t.type === "Expense" && t.category === categoryName)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  // Calculate total spent
  const totalSpent = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const remainingBudget = Number(total) - totalSpent;
  const budgetPercentage = Number(total) > 0 ? (totalSpent / Number(total)) * 100 : 0;

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Budget Management</h1>
        
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h4 className="text-gray-500 mb-2">Total Budget</h4>
            <p className="text-3xl font-bold text-gray-800">₹{Number(total).toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h4 className="text-gray-500 mb-2">Total Spent</h4>
            <p className="text-3xl font-bold text-red-600">₹{totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h4 className="text-gray-500 mb-2">Remaining</h4>
            <p className={`text-3xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{remainingBudget.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Total Budget Progress Bar */}
        {total > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Budget Progress</h3>
              <span className="text-sm text-gray-600">{budgetPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  budgetPercentage > 100 ? 'bg-red-600' : budgetPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
            {budgetPercentage > 100 && (
              <p className="text-red-600 text-sm mt-2 font-semibold">
                ⚠️ You've exceeded your budget by ₹{Math.abs(remainingBudget).toFixed(2)}
              </p>
            )}
          </div>
        )}

        {/* Set Total Budget */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Total Budget</h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Total Budget (₹)"
              value={total}
              onChange={(e) => setTotal(e.target.value === '' ? 0 : e.target.valueAsNumber)}
              className="p-3 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={saveTotal}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Save
            </button>
          </div>
        </div>

        {/* Category Budgets */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Budgets</h2>
          
          {/* Add Category Form */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Category name (e.g., Food, Travel)"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="p-3 border rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Budget (₹)"
              value={categoryAmount}
              onChange={(e) => setCategoryAmount(e.target.value)}
              className="p-3 border rounded-lg w-40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              onClick={addCategory}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Add Category
            </button>
          </div>

          {/* Category List */}
          {Object.entries(budgets.categories || {}).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(budgets.categories || {}).map(([cat, amt]) => {
                const amount = Number(amt) || 0;
                const spent = calculateCategorySpending(cat);
                const percentage = amount > 0 ? (spent / amount) * 100 : 0;
                const isOverBudget = spent > amount;
                
                return (
                  <div key={cat} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{cat}</h3>
                        <p className="text-sm text-gray-600">
                          Budget: ₹{amount.toFixed(2)} | Spent: ₹{spent.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteCategory(cat)}
                        className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {percentage.toFixed(1)}% used
                      </span>
                      {isOverBudget && (
                        <span className="text-sm text-red-600 font-semibold">
                          Over budget by ₹{(spent - amount).toFixed(2)}
                        </span>
                      )}
                      {!isOverBudget && amount > 0 && (
                        <span className="text-sm text-green-600 font-semibold">
                          ₹{(amount - spent).toFixed(2)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No category budgets set. Add categories above to track spending by category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;
