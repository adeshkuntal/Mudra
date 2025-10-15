const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || "iloveyou";

// Models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  total: { type: Number, default: 0 },
  categories: { type: Object, default: {} },
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: "" },
  description: { type: String, default: "" },
  type: { type: String, enum: ["Income", "Expense"], default: "Expense" },
  date: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
const Budget = mongoose.model("Budget", budgetSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

// Middleware: authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Auth Routes
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await Budget.create({ userId: user._id, total: 0, categories: {} });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
});



app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

app.get("/api/auth/me", authenticateUser, async (req, res) => {
  res.json({ user: req.user });
});

// Protected Routes (require authentication)
// Routes: Budget
app.get("/api/budgets", authenticateUser, async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id });
    res.json(budget || { total: 0, categories: {} });
  } catch (err) { next(err); }
});

app.put("/api/budgets", authenticateUser, async (req, res, next) => {
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
app.get("/api/transactions", authenticateUser, async (req, res, next) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(txns);
  } catch (err) { next(err); }
});

app.post("/api/transactions", authenticateUser, async (req, res, next) => {
  try {
    const { amount, category, description, type = "Expense", date } = req.body;
    const txn = await Transaction.create({
      userId: req.user._id,
      amount: Number(amount),
      category: category || "",
      description: description || "",
      type,
      date: date || new Date().toISOString().split('T')[0],
    });
    res.status(201).json(txn);
  } catch (err) { next(err); }
});

app.put("/api/transactions/:id", authenticateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, category, description, type, date } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }
    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { 
        amount: Number(amount), 
        category: category || "", 
        description: description || "",
        type, 
        date: date || new Date().toISOString().split('T')[0]
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(updated);
  } catch (err) { next(err); }
});

app.delete("/api/transactions/:id", authenticateUser, async (req, res, next) => {
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
app.get("/api/analytics/summary", authenticateUser, async (req, res, next) => {
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
    app.listen(PORT, () => console.log(API listening on ${PORT}));
  })
  .catch(err => {
    console.error("Mongo connection failed", err);
    process.exit(1);
  });