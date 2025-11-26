const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const getTransactions = async (req, res, next) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(txns);
  } catch (err) {
    next(err);
  }
};

const createTransaction = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

