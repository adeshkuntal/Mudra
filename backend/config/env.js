require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mudra",
  JWT_SECRET: process.env.JWT_SECRET || "iloveyou",
  ML_API_URL: process.env.ML_API_URL || "http://localhost:5001",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "AIzaSyDB0MqG7N2mCPw4NmRMxkvZCpndKEXYHYk",
};

