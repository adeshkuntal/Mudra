const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

const getSummary = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary,
};

