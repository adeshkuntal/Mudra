const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const { analyzeUserFinancialData } = require("../services/aiService");
const { generateInvestmentPlan } = require("../services/investmentService");

const getInvestmentPlan = async (req, res, next) => {
  try {
    const { riskProfile = "balanced", monthlyContribution = 10000 } = req.body || {};

    const [transactions, budget] = await Promise.all([
      Transaction.find({ userId: req.user._id }),
      Budget.findOne({ userId: req.user._id }),
    ]);

    const analysis = analyzeUserFinancialData(transactions, budget);

    const plan = generateInvestmentPlan({
      riskProfile,
      monthlyContribution: Number(monthlyContribution) || 10000,
      income: analysis.totalIncome / Math.max(1, analysis.transactionCount / 10), // approximate monthly income
      savingsRate: analysis.savingsRate,
    });

    res.json({
      analysis,
      plan,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInvestmentPlan,
};

