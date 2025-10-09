import React, { useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

const Budget = () => {
  const { budgets, setBudgets } = useOutletContext();
  const [total, setTotal] = useState(budgets.total);
  const [categoryName, setCategoryName] = useState("");
  const [categoryAmount, setCategoryAmount] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  const saveTotal = async () => {
    const updated = { ...budgets, total: Number(total) };
    setBudgets(updated);
    await axios.put(`${API_BASE}/api/budgets`, updated);
  };

  const addCategory = async () => {
    if (!categoryName || !categoryAmount) return;
    const updated = {
      ...budgets,
      categories: {
        ...budgets.categories,
        [categoryName]: Number(categoryAmount)
      }
    };
    setBudgets(updated);
    await axios.put(`${API_BASE}/api/budgets`, updated);
    setCategoryName("");
    setCategoryAmount("");
  };

  const deleteCategory = async (name) => {
    if (!name) return;
    const { [name]: _omit, ...rest } = budgets.categories || {};
    const updated = {
      ...budgets,
      categories: rest,
    };
    setBudgets(updated);
    await axios.put(`${API_BASE}/api/budgets`, updated);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Budget</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="number"
          placeholder="Total Budget ($)"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <button
          onClick={saveTotal}
          className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-2">Category Budgets</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Category"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <input
          type="number"
          placeholder="Amount"
          value={categoryAmount}
          onChange={(e) => setCategoryAmount(e.target.value)}
          className="p-2 border rounded w-32"
        />
        <button
          onClick={addCategory}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <ul>
        {Object.entries(budgets.categories).map(([cat, amt]) => (
          <li key={cat} className="mb-2 flex items-center justify-between">
            <div>
              <span className="font-semibold">{cat}</span>: ${amt}
            </div>
            <button
              onClick={() => deleteCategory(cat)}
              className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Budget;
