// src/server.js
import express from 'express';

import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import path from 'path';


const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB("mongodb+srv://gouravsharmaapsmat2932:School000@belasarius.2powx4i.mongodb.net/?retryWrites=true&w=majority&appName=belasarius");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// Routes
app.use('/api/auth', authRoutes);

// health check
app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: Date.now() }));



app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT: ${PORT}`);
});
