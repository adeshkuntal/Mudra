const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const { getInvestmentPlan } = require("../controllers/investmentController");

router.post("/plan", authenticateUser, getInvestmentPlan);

module.exports = router;

