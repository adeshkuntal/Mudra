import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total: { type: Number, default: 0 },
  categories: { type: Object, default: {} },
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: '' },
  description: { type: String, default: '' },
  type: { type: String, enum: ['Income', 'Expense'], default: 'Expense' },
  date: { type: String, required: true },
});

export const User = mongoose.model('User', userSchema);
export const Budget = mongoose.model('Budget', budgetSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
