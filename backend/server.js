const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const { PORT } = require("./config/env");

// Import routes
const authRoutes = require("./routes/authRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const forecastRoutes = require("./routes/forecastRoutes");
const aiRoutes = require("./routes/aiRoutes");
const investmentRoutes = require("./routes/investmentRoutes");

const app = express();

// Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/investment", investmentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`API listening on ${PORT}`));
};

startServer();
