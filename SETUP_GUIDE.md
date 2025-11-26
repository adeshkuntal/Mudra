# Mudra Application Setup Guide

Complete guide to set up and run the Mudra AI-Based Personal Finance Management App.

## Prerequisites

### Required Software:
1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
3. **Python** (3.8 or higher) - [Download](https://www.python.org/downloads/)
4. **npm** (comes with Node.js)

### Optional:
- Postman or similar for API testing
- MongoDB Compass for database management

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/mudra
JWT_SECRET=your-secret-key-change-in-production
ML_API_URL=http://localhost:5001
```

4. Make sure MongoDB is running:
   - If using local MongoDB: `mongod` or start MongoDB service
   - If using MongoDB Atlas: Update `MONGO_URI` in `.env`

5. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:4000`

### 2. ML Model Service Setup

1. Navigate to the ml_model directory:
```bash
cd ml_model
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Make sure these files are present:
   - `actual_saving_prediction.pkl`
   - `expense_predictor.pkl`
   - `app.py`

4. Start the ML service:
```bash
python app.py
```

Or on Windows, double-click `start_ml_service.bat`

The ML API will run on `http://localhost:5001`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_BASE=http://localhost:4000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running the Application

You need to run all three services:

1. **MongoDB** (database)
2. **Backend Server** (port 4000)
3. **ML Service** (port 5001)
4. **Frontend** (port 5173)

### Quick Start (Windows):

1. Start MongoDB (if not running as a service)

2. Open three terminal windows:

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm start
   ```

   **Terminal 2 - ML Service:**
   ```bash
   cd ml_model
   python app.py
   ```

   **Terminal 3 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and go to `http://localhost:5173`

## Features

### Authentication
- Register a new account with email and password
- Login with credentials
- Secure JWT-based authentication
- Logout functionality

### Dashboard
- View total income, expenses, and savings
- Visual charts for income vs expenses
- Category-wise expense breakdown

### Transactions
- Add, edit, and delete transactions
- Categorize income and expenses
- Search and filter transactions
- Import from CSV/Excel
- Export to Excel with summaries

### Budget Management
- Set total monthly budget
- Create category-specific budgets
- Real-time budget tracking
- Visual progress indicators
- Over-budget alerts

### Analytics
- Total expenses and income analysis
- Budget utilization
- Category-wise spending patterns
- Visual representations

### Forecast (AI-Powered)
- ML-based savings prediction
- ML-based expense prediction
- Historical data analysis
- Future financial planning insights

## Troubleshooting

### Backend Issues:

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check the `MONGO_URI` in `.env`
- Try restarting MongoDB service

**Port Already in Use:**
- Change the `PORT` in `.env`
- Kill the process using the port

### ML Service Issues:

**Model File Not Found:**
- Ensure `.pkl` files are in the `ml_model` directory
- Check file permissions

**Python Dependencies Error:**
- Use virtual environment: `python -m venv venv`
- Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
- Install dependencies again

**Port 5001 in Use:**
- Change port in `app.py`: `app.run(host="0.0.0.0", port=5001)`

### Frontend Issues:

**API Connection Error:**
- Check that backend is running on port 4000
- Verify `VITE_API_BASE` in frontend `.env`

**CORS Error:**
- Backend CORS is configured for `http://localhost:5173`
- Ensure frontend runs on the correct port

## Development

### Project Structure:
```
Mudra/
├── backend/          # Node.js + Express backend
├── frontend/         # React frontend
├── ml_model/         # Python Flask ML API
└── readme.md         # Project documentation
```

### Technology Stack:
- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **ML**: Python, Flask, scikit-learn, joblib
- **Authentication**: JWT, bcrypt

## Security Notes

- Never commit `.env` files
- Change default JWT secret in production
- Use strong passwords for MongoDB
- Enable HTTPS in production
- Validate all user inputs

## Support

For issues or questions:
- Check the console logs for errors
- Verify all services are running
- Ensure MongoDB has proper permissions

## Next Steps

1. Create your account
2. Add some transactions
3. Set up budgets
4. Explore forecasts and analytics
5. Export your financial reports

Enjoy managing your finances with Mudra! 🎉









