const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: "" },
  description: { type: String, default: "" },
  type: { type: String, enum: ["Income", "Expense"], default: "Expense" },
  date: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);

