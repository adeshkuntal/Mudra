const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  total: { type: Number, default: 0 },
  categories: { type: Object, default: {} },
}, {
  timestamps: true
});

module.exports = mongoose.model("Budget", budgetSchema);

