import React, { useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { Search, Upload, Download, Plus, Edit, Trash } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const Transactions = () => {
  const { transactions, setTransactions, budgets, setTopbarWarning } = useOutletContext();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [filterDate, setFilterDate] = useState("All Time");
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "Expense",
    category: "",
    date: "",
  });

  // ---- Add Transaction ----
  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.date) return;

    const amount = parseFloat(newTransaction.amount);
    const payload = { ...newTransaction, amount };
    try {
      const res = await axios.post(`${API_BASE}/api/transactions`, payload);
      const saved = res.data;
      const updatedTransactions = [saved, ...transactions];
      setTransactions(updatedTransactions);

      // Check budget overage for the category if a budget exists
      if (saved.type === "Expense" && saved.category && budgets?.categories?.[saved.category] != null) {
        const spentInCategory = updatedTransactions
          .filter(t => t.type === "Expense" && t.category === saved.category)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const limit = Number(budgets.categories[saved.category]);
        if (spentInCategory > limit) {
          setTopbarWarning(`⚠️ You’ve exceeded your ${saved.category} budget this month!`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction");
      return;
    }
    setNewTransaction({
      description: "",
      amount: "",
      type: "Expense",
      category: "",
      date: "",
    });
    setShowForm(false);
  };

  // ---- File Import/Export ----
  const parseTransactionRow = (row) => {
    const keys = Object.keys(row);
    const dateKey = keys.find((k) => k.toLowerCase().includes("date"));
    const descKey = keys.find(
      (k) =>
        k.toLowerCase().includes("description") ||
        k.toLowerCase().includes("desc")
    );
    const catKey = keys.find(
      (k) => k.toLowerCase().includes("category") || k.toLowerCase().includes("cat")
    );
    const typeKey = keys.find((k) => k.toLowerCase().includes("type"));
    const amountKey = keys.find(
      (k) => k.toLowerCase().includes("amount") || k.toLowerCase().includes("amt")
    );

    return {
      date: row[dateKey] || "",
      description: row[descKey] || "",
      category: row[catKey] || "",
      type: row[typeKey] || "Expense",
      amount: parseFloat(row[amountKey]) || 0,
    };
  };

  // ---- Delete Transaction ----
  const handleDelete = async (txn) => {
    // Optimistic UI update
    const prev = transactions;
    const removeLocal = () => setTransactions((p) => p.filter((t) => (t._id ? t._id !== txn._id : t !== txn)));
    removeLocal();

    try {
      if (txn._id) {
        await axios.delete(`${API_BASE}/api/transactions/${txn._id}`);
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTransactions(prev);
      alert("Failed to delete transaction");
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Raw Transactions
    const txSheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Category: t.category,
      Type: t.type,
      Amount: t.amount,
    })));
    XLSX.utils.book_append_sheet(wb, txSheet, "Transactions");

    // Build summaries
    const categoryTotals = {};
    const monthlyTotals = {};
    for (const t of transactions) {
      const monthKey = t.date ? new Date(t.date).toISOString().slice(0, 7) : ""; // YYYY-MM
      const amountAbs = Math.abs(Number(t.amount || 0));
      const isExpense = (t.type || "Expense") === "Expense";
      const isIncome = (t.type || "Expense") === "Income";

      const cat = t.category || "Uncategorized";
      if (!categoryTotals[cat]) categoryTotals[cat] = { category: cat, income: 0, expenses: 0 };
      if (isExpense) categoryTotals[cat].expenses += amountAbs; else if (isIncome) categoryTotals[cat].income += Number(t.amount || 0);

      if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      if (isExpense) monthlyTotals[monthKey].expenses += amountAbs; else if (isIncome) monthlyTotals[monthKey].income += Number(t.amount || 0);
    }

    // Sheet 2: Category Summary (ready for Pie/Bar charts)
    const categoryRows = Object.values(categoryTotals).map(r => ({
      Category: r.category,
      Expenses: Number(r.expenses.toFixed(2)),
      Income: Number(r.income.toFixed(2)),
      Net: Number((r.income - r.expenses).toFixed(2)),
    }));
    const catSheet = XLSX.utils.json_to_sheet(categoryRows);
    XLSX.utils.book_append_sheet(wb, catSheet, "Category_Summary");

    // Sheet 3: Monthly Summary (ready for line/bar charts)
    const monthlyRows = Object.values(monthlyTotals)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(r => ({
        Month: r.month,
        Expenses: Number(r.expenses.toFixed(2)),
        Income: Number(r.income.toFixed(2)),
        Net: Number((r.income - r.expenses).toFixed(2)),
      }));
    const monthSheet = XLSX.utils.json_to_sheet(monthlyRows);
    XLSX.utils.book_append_sheet(wb, monthSheet, "Monthly_Summary");

    // Sheet 4: Instructions for creating charts in Excel
    const instructions = [
      ["Charts in Excel"],
      ["This workbook includes ready-to-chart summary tables."],
      ["To create a Pie Chart:"],
      ["1. Go to Category_Summary, select Category and Expenses columns."],
      ["2. Insert > Charts > Pie."],
      ["To create a Bar/Line Chart by Month:"],
      ["1. Go to Monthly_Summary, select Month, Income, Expenses."],
      ["2. Insert > Charts > Column/Line."],
    ];
    const instrSheet = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, instrSheet, "Charts_HowTo");

    XLSX.writeFile(wb, "transactions_with_summaries.xlsx");
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (fileExt === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const importedData = results.data.map(parseTransactionRow);
          setTransactions((prev) => [...prev, ...importedData]);
        },
      });
    } else if (fileExt === "xls" || fileExt === "xlsx") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        const importedData = jsonData.map(parseTransactionRow);
        setTransactions((prev) => [...prev, ...importedData]);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Only CSV or Excel files are supported!");
    }
  };

  // ---- Filtering ----
  const filteredTransactions = transactions.filter((t) => {
    const description = t.description || "";
    const type = t.type || "";
    const date = t.date || "";
    const matchesSearch = description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType = filterType === "All Types" || type === filterType;
    const now = new Date();
    let matchesDate = true;

    if (filterDate === "This Week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      matchesDate = new Date(date) >= weekAgo;
    } else if (filterDate === "This Month") {
      const tDate = new Date(date);
      matchesDate =
        tDate.getMonth() === now.getMonth() &&
        tDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="p-8 flex-1 overflow-y-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600">
            Track and manage your financial transactions
          </p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-100 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import File
            <input
              type="file"
              accept=".csv, .xls, .xlsx"
              className="hidden"
              onChange={handleFileImport}
            />
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-100"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white shadow hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Description"
              className="border p-2 rounded"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  description: e.target.value,
                })
              }
            />
            <input
              type="number"
              placeholder="Amount"
              className="border p-2 rounded"
              value={newTransaction.amount}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  amount: e.target.value,
                })
              }
            />
            <select
              className="border p-2 rounded"
              value={newTransaction.type}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, type: e.target.value })
              }
            >
              <option>Income</option>
              <option>Expense</option>
            </select>
            <input
              type="text"
              placeholder="Category"
              className="border p-2 rounded"
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  category: e.target.value,
                })
              }
            />
            <input
              type="date"
              className="border p-2 rounded"
              value={newTransaction.date}
              onChange={(e) =>
                setNewTransaction({ ...newTransaction, date: e.target.value })
              }
            />
            <button
              onClick={handleAddTransaction}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Add Transaction
            </button>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border rounded-lg"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option>All Types</option>
          <option>Income</option>
          <option>Expense</option>
        </select>
        <select
          className="px-4 py-2 border rounded-lg"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        >
          <option>All Time</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">
          All Transactions ({filteredTransactions.length})
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t, i) => (
              <tr key={i} className="border-b last:border-none hover:bg-gray-50">
                <td className="p-3">{t.date}</td>
                <td className="p-3 font-medium">{t.description}</td>
                <td className="p-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {t.category}
                  </span>
                </td>
                <td className="p-3">
                  {t.type === "Income" ? (
                    <span className="text-green-600 font-semibold">Income</span>
                  ) : (
                    <span className="text-orange-500 font-semibold">Expense</span>
                  )}
                </td>
                <td className="p-3 font-semibold">
                  {t.amount > 0 ? (
                    <span className="text-green-600">
                      +${t.amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-red-600">
                      -${Math.abs(t.amount).toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="p-3 flex gap-3">
                  <button className="text-gray-600 hover:text-blue-500">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="text-gray-600 hover:text-red-500" onClick={() => handleDelete(t)}>
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
