const express = require("express");
const router = express.Router();
const { getTransactions, createTransaction, updateTransaction, deleteTransaction } = require("../controllers/transactionController");
const authenticateUser = require("../middleware/auth");

router.get("/", authenticateUser, getTransactions);
router.post("/", authenticateUser, createTransaction);
router.put("/:id", authenticateUser, updateTransaction);
router.delete("/:id", authenticateUser, deleteTransaction);

module.exports = router;

