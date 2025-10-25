# SYNOPSIS

## 1. Title of the Project
**AI-Based Personal Finance Management App**

---

## 2. Introduction
In today’s fast-paced world, effective personal finance management is essential for individuals to achieve financial stability and independence. Many people face challenges in tracking their income, expenses, and savings, which often leads to overspending and poor financial decisions.  

The **AI-Based Personal Finance Management App** is designed to help users monitor their financial activities, set budgets, and receive AI-powered insights for better money management. The system will act as a personal financial assistant, offering real-time analytics, predictions, and suggestions to promote savings and reduce unnecessary expenses.

---

## 3. Objectives of the Project
- To provide a secure and user-friendly web application for personal finance tracking.  
- To allow users to record and categorize income and expenses.  
- To implement budget management with alerts for overspending.  
- To integrate AI for personalized financial insights and expense predictions.  
- To generate monthly and yearly financial reports in visual and exportable formats.  
- To build a scalable and reliable platform for future enhancements like bank integration and fraud detection.

---

## 4. Problem Statement
Many individuals lack effective tools to manage their finances, leading to overspending, missed savings opportunities, and financial stress. Existing applications are often complex, lack AI-driven insights, or do not cater to the needs of students and young professionals.  

This project aims to solve this problem by developing an **AI-powered personal finance app** that is simple, intelligent, and secure.

---

## 5. Proposed System
The proposed system will include the following key features:
- **User Authentication**: Secure registration and login with JWT.  
- **Dashboard**: Visual overview of income, expenses, and savings.  
- **Transaction Management**: Add, edit, and delete income/expense records with categories.  
- **Budgeting**: Users can set monthly category-wise budgets and receive alerts.  
- **AI-Powered Financial Assistant**: Gemini AI integration for personalized financial advice and Q&A.  
- **ML Predictions**: Forecast future savings and expenses using trained machine learning models.  
- **Reports & Export**: Graphical analysis of spending habits with export to Excel.  
- **Future Scope**: Bank integration, fraud detection, and voice-enabled assistant.  

---

## 6. Methodology / Workflow
1. **User Registration & Authentication**  
   - Secure sign-up and login system.  

2. **Data Entry**  
   - Users add income and expense transactions with categories.  

3. **Budget Setup**  
   - Users set monthly limits for categories.  

4. **AI Insights**  
   - AI/ML algorithms analyze transactions to give predictions and alerts.  

5. **Reports Generation**  
   - Graphical and tabular reports (monthly/yearly) with export options.  

---

## 7. Minimum Viable Product (MVP)
- User authentication (Register/Login).  
- Dashboard with income and expense summary.  
- Add, edit, delete transactions.  
- Budget management with simple alerts.  
- AI-based basic suggestions (e.g., “You spent 50% of your Food budget”).  
- Reports in CSV/PDF.  

---

## 8. Possible Challenges
- **Data Security**: Protecting sensitive financial data.  
- **AI Accuracy**: Making accurate predictions with limited data.  
- **Scalability**: Handling large transaction data for multiple users.  
- **Bank Integration**: Limited access to standardized APIs.  
- **User Engagement**: Simplifying manual data entry to increase adoption.  

---

## 9. Expected Outcomes
- A functional personal finance web application with AI-powered insights.  
- Easy-to-use platform for students and professionals.  
- Improved financial awareness and decision-making for users.  
- Scalable base system ready for future upgrades.  

---

## 10. Technology Stack
- **Frontend**: React.js, Tailwind CSS, Lucide Icons  
- **Backend**: Node.js, Express.js, Axios  
- **Database**: MongoDB (Mongoose)  
- **AI/ML**: 
  - Google Gemini Pro API for conversational AI
  - Python Flask API serving ML models for predictions
  - Trained models: Saving Predictor, Expense Predictor
- **Authentication**: JWT (JSON Web Tokens), bcrypt  
- **Hosting**: Vercel/Netlify (frontend), Heroku/AWS (backend)

## 12. ML Model Integration

The application includes two trained ML models:
- **Saving Predictor**: Predicts future savings based on historical income and expense data
- **Expense Predictor**: Forecasts future expenses using spending patterns

### Running the ML Service

1. Navigate to the `ml_model` directory
2. Install Python dependencies: `pip install -r requirements.txt`
3. Run the service: `python app.py`
4. The ML API will be available at `http://localhost:5001`

The Forecast page in the web app uses these ML models to provide AI-powered financial predictions.

## 13. AI Financial Assistant

The application features an intelligent AI assistant powered by Google's Gemini Pro API that provides personalized financial advice.

### Features:
- **Context-Aware Responses**: The AI has access to your financial summary (income, expenses, savings, budgets)
- **Natural Language Processing**: Ask questions in plain English
- **Personalized Recommendations**: Get tailored advice based on your spending patterns
- **Instant Q&A**: Quick answers to financial questions

### Example Questions:
- "How can I save more money this month?"
- "What are my spending patterns?"
- "Budgeting tips for next month"
- "How much did I spend on groceries?"
- "Suggest ways to reduce my expenses"

### How to Use:
1. Click on the "Ask AI" search bar in the top navigation
2. Type your financial question
3. The AI chat popup will appear automatically
4. Get instant, personalized financial advice
5. Continue the conversation or click "Clear chat" to start fresh

The AI uses your transaction history and budget information to provide contextually relevant financial guidance.  

---

## 11. Team Members
- **Adesh Kumar**  
- **Gourav Sharma**

---
