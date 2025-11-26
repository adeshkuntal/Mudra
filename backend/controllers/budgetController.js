const Budget = require("../models/Budget");

const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ userId: req.user._id });
    res.json(budget || { total: 0, categories: {} });
  } catch (err) {
    next(err);
  }
};

const updateBudget = async (req, res, next) => {
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
};

module.exports = {
  getBudget,
  updateBudget,
};

