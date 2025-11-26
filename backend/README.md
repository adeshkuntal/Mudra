# Mudra Backend API

A modular Node.js/Express backend for the Mudra personal finance management application.

## Project Structure

```
backend/
├── config/           # Configuration files
│   ├── database.js   # MongoDB connection
│   └── env.js        # Environment variables
├── controllers/      # Request handlers (business logic)
│   ├── authController.js
│   ├── budgetController.js
│   ├── transactionController.js
│   ├── analyticsController.js
│   ├── forecastController.js
│   └── aiController.js
├── middleware/       # Express middleware
│   └── auth.js       # Authentication middleware
├── models/           # Mongoose schemas
│   ├── User.js
│   ├── Budget.js
│   └── Transaction.js
├── routes/           # API routes
│   ├── authRoutes.js
│   ├── budgetRoutes.js
│   ├── transactionRoutes.js
│   ├── analyticsRoutes.js
│   ├── forecastRoutes.js
│   └── aiRoutes.js
├── services/         # External service integrations
│   ├── aiService.js      # Gemini AI integration
│   └── forecastService.js # ML prediction service
├── server.js         # Main entry point
├── .env.example      # Example environment variables
└── package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - `MONGO_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `ML_API_URL`: URL of the ML service (default: http://localhost:5001)
   - `GEMINI_API_KEY`: Google Gemini API key (optional, for AI chat)

4. Start the server:
```bash
node server.js
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /me` - Get current user (requires auth)

### Budgets (`/api/budgets`)
- `GET /` - Get user's budget (requires auth)
- `PUT /` - Update user's budget (requires auth)

### Transactions (`/api/transactions`)
- `GET /` - Get all transactions (requires auth)
- `POST /` - Create a transaction (requires auth)
- `PUT /:id` - Update a transaction (requires auth)
- `DELETE /:id` - Delete a transaction (requires auth)

### Analytics (`/api/analytics`)
- `GET /summary` - Get financial summary (requires auth)

### Forecast (`/api/forecast`)
- `POST /predict_saving` - Predict future savings (requires auth)
- `POST /predict_expense` - Predict future expenses (requires auth)

### AI (`/api/ai`)
- `POST /ask` - Ask AI financial questions (requires auth)

## Architecture

- **MVC Pattern**: Controllers handle business logic, Models define data structure, Routes define endpoints
- **Middleware**: Authentication middleware protects routes
- **Services**: External integrations (AI, ML) are abstracted into service modules
- **Configuration**: Environment variables and database config are centralized

## Environment Variables

See `.env.example` for all required environment variables.
