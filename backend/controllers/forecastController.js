const { predictSaving, predictExpense } = require("../services/forecastService");

const predictSavingHandler = async (req, res, next) => {
  try {
    const result = await predictSaving(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const predictExpenseHandler = async (req, res, next) => {
  try {
    const result = await predictExpense(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  predictSavingHandler,
  predictExpenseHandler,
};

