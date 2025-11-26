const express = require("express");
const router = express.Router();
const { predictSavingHandler, predictExpenseHandler } = require("../controllers/forecastController");
const authenticateUser = require("../middleware/auth");

router.post("/predict_saving", authenticateUser, predictSavingHandler);
router.post("/predict_expense", authenticateUser, predictExpenseHandler);

module.exports = router;

