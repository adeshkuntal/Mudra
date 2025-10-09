const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  total: { type: Number, default: 0 },
  categories: { type: Map, of: Number, default: {} },
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: "" },
  note: { type: String, default: "" },
  type: { type: String, enum: ["Income", "Expense"], default: "Expense" },
  date: { type: Date, required: true },
});

const User = mongoose.model("User", userSchema);
const Budget = mongoose.model("Budget", budgetSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

// Middleware: attach demo user
app.use(async (req, res, next) => {
  try {
    let user = await User.findOne({ email: "demo@user.com" });
    if (!user) {
      user = await User.create({ email: "demo@user.com", name: "Demo User" });
      await Budget.create({ userId: user._id, total: 0, categories: {} });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
});

// Routes: Budget
app.get("/api/budgets", async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id });
    res.json(budget || { total: 0, categories: {} });
  } catch (err) { next(err); }
});

app.put("/api/budgets", async (req, res, next) => {
  try {
    const { total, categories } = req.body;
    const updated = await Budget.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { total: Number(total) || 0, categories: categories || {} } },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) { next(err); }
});

// Routes: Transactions
app.get("/api/transactions", async (req, res, next) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(txns);
  } catch (err) { next(err); }
});

app.post("/api/transactions", async (req, res, next) => {
  try {
    const { amount, category, note, type = "Expense", date } = req.body;
    const txn = await Transaction.create({
      userId: req.user._id,
      amount: Number(amount),
      category: category || "",
      note: note || "",
      type,
      date: date ? new Date(date) : new Date(),
    });
    res.status(201).json(txn);
  } catch (err) { next(err); }
});

app.delete("/api/transactions/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(204).end();
    }
    const result = await Transaction.deleteOne({ _id: id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ ok: false, error: "Not found" });
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Analytics: simple totals
app.get("/api/analytics/summary", async (req, res, next) => {
  try {
    const [budget, txns] = await Promise.all([
      Budget.findOne({ userId: req.user._id }),
      Transaction.find({ userId: req.user._id }),
    ]);
    const expenses = txns
      .filter(t => t.type === "Expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const income = txns
      .filter(t => t.type === "Income")
      .reduce((s, t) => s + t.amount, 0);
    res.json({
      totalExpenses: expenses,
      totalIncome: income,
      totalBudget: budget?.total || 0,
      remaining: (budget?.total || 0) - expenses,
    });
  } catch (err) { next(err); }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mudra";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  })
  .catch(err => {
    console.error("Mongo connection failed", err);
    process.exit(1);
  });


