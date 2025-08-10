import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Upload, Download, Plus, Edit, Trash } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const Transactions = () => {
  const { transactions, setTransactions, budgets } = useOutletContext();

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
  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.date) return;

    const amount = parseFloat(newTransaction.amount);
    const updatedTransactions = [
      ...transactions,
      { ...newTransaction, amount },
    ];

    setTransactions(updatedTransactions);
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

  const handleExport = () => {
    if (transactions.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
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
                  <button className="text-gray-600 hover:text-red-500">
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
