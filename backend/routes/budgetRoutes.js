const express = require("express");
const router = express.Router();
const { getBudget, updateBudget } = require("../controllers/budgetController");
const authenticateUser = require("../middleware/auth");

router.get("/", authenticateUser, getBudget);
router.put("/", authenticateUser, updateBudget);

module.exports = router;

