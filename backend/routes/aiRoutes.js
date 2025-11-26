const express = require("express");
const router = express.Router();
const { askAI } = require("../controllers/aiController");
const authenticateUser = require("../middleware/auth");

router.post("/ask", authenticateUser, askAI);

module.exports = router;

