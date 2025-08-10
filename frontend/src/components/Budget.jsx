import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";

const Budget = () => {
  const { budgets, setBudgets } = useOutletContext();
  const [total, setTotal] = useState(budgets.total);
  const [categoryName, setCategoryName] = useState("");
  const [categoryAmount, setCategoryAmount] = useState("");

  const saveTotal = () => setBudgets({ ...budgets, total: Number(total) });

  const addCategory = () => {
    if (!categoryName || !categoryAmount) return;
    setBudgets({
      ...budgets,
      categories: {
        ...budgets.categories,
        [categoryName]: Number(categoryAmount)
      }
    });
    setCategoryName("");
    setCategoryAmount("");
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
          <li key={cat} className="mb-1">
            <span className="font-semibold">{cat}</span>: ${amt}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Budget;
