import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Budget, Transaction } from '@/model/model.js';
import { authenticateUser } from '@/middleware/authmiddleware'; 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "iloveyou";

// -------------------- Auth Routes --------------------

// Register
router.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

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

// Login
router.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Me
router.get("/api/auth/me", authenticateUser, async (req, res) => {
  res.json({ user: req.user });
});

// -------------------- Budget Routes --------------------

router.get("/api/budgets", authenticateUser, async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id });
    res.json(budget || { total: 0, categories: {} });
  } catch (err) {
    next(err);
  }
});

router.put("/api/budgets", authenticateUser, async (req, res, next) => {
  try {
    const { total, categories } = req.body;
    const updated = await Budget.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { total: Number(total) || 0, categories: categories || {} } },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// -------------------- Transaction Routes --------------------

router.get("/api/transactions", authenticateUser, async (req, res, next) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    next(err);
  }
});

router.post("/api/transactions", authenticateUser, async (req, res, next) => {
  try {
    const { amount, category, description, type = "Expense", date } = req.body;
    const txn = await Transaction.create({
      userId: req.user._id,
      amount: Number(amount),
      category: category || "",
      description: description || "",
      type,
      date: date || new Date().toISOString().split("T")[0],
    });
    res.status(201).json(txn);
  } catch (err) {
    next(err);
  }
});

router.put("/api/transactions/:id", authenticateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, category, description, type, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid transaction ID" });

    const updated = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      {
        amount: Number(amount),
        category: category || "",
        description: description || "",
        type,
        date: date || new Date().toISOString().split("T")[0],
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Transaction not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/api/transactions/:id", authenticateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(204).end();

    const result = await Transaction.deleteOne({ _id: id, userId: req.user._id });
    if (result.deletedCount === 0)
      return res.status(404).json({ ok: false, error: "Not found" });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// -------------------- Analytics --------------------

router.get("/api/analytics/summary", authenticateUser, async (req, res, next) => {
  try {
    const [budget, txns] = await Promise.all([
      Budget.findOne({ userId: req.user._id }),
      Transaction.find({ userId: req.user._id }),
    ]);

    const expenses = txns
      .filter((t) => t.type === "Expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    const income = txns
      .filter((t) => t.type === "Income")
      .reduce((s, t) => s + t.amount, 0);

    res.json({
      totalExpenses: expenses,
      totalIncome: income,
      totalBudget: budget?.total || 0,
      remaining: (budget?.total || 0) - expenses,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
