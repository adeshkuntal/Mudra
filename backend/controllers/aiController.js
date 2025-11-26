const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const { GEMINI_API_KEY } = require("../config/env");
const {
  isFinanceRelated,
  analyzeUserFinancialData,
  respondByIntent,
  callGeminiAPI,
  buildComprehensiveAnalysis,
} = require("../services/aiService");

const askAI = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if question is finance-related
    if (!isFinanceRelated(message)) {
      return res.json({
        response: "Only for finance related queries. Please ask questions about your money, savings, expenses, investments, budget, or financial planning.",
      });
    }

    // Fetch user's transactions and budget from database
    const [transactions, budgets] = await Promise.all([
      Transaction.find({ userId: req.user._id }),
      Budget.findOne({ userId: req.user._id }),
    ]);

    // Analyze user's financial data
    const analyzedData = analyzeUserFinancialData(transactions, budgets);

    // If no API key or invalid key, return intent-based response
    if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith("AIzaSyDB0M")) {
      return res.json({ response: respondByIntent(message, analyzedData) });
    }

    // Try to call Gemini API with analyzed data
    try {
      const aiResponse = await callGeminiAPI(message, analyzedData);
      
      if (!aiResponse) {
        return res.json({ response: respondByIntent(message, analyzedData) });
      }

      res.json({ response: aiResponse });
    } catch (geminiErr) {
      console.error("Gemini API Error:", geminiErr?.response?.data || geminiErr.message);
      // Fallback to intent-based response with analyzed data
      return res.json({ response: respondByIntent(message, analyzedData) });
    }
  } catch (err) {
    console.error("AI Controller Error:", err);
    // Fallback with comprehensive analysis
    try {
      const [transactions, budgets] = await Promise.all([
        Transaction.find({ userId: req.user._id }),
        Budget.findOne({ userId: req.user._id }),
      ]);
      const analyzedData = analyzeUserFinancialData(transactions, budgets);
      return res.json({
        response: buildComprehensiveAnalysis(analyzedData),
      });
    } catch (fallbackErr) {
      return res.json({
        response: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
      });
    }
  }
};

module.exports = {
  askAI,
};

