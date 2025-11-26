const express = require("express");
const router = express.Router();
const { getSummary } = require("../controllers/analyticsController");
const authenticateUser = require("../middleware/auth");

router.get("/summary", authenticateUser, getSummary);

module.exports = router;

