import express from 'express';
const app = express();
import dotenv from 'dotenv';
import apiRoute from './routes/apiRoute.js';
import viewRoute from './routes/viewRoute.js';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();

// CORS configuration - allows frontend URL from env or localhost for development
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api',apiRoute);
app.use('/', viewRoute);

// Start server first, then connect to database
// This ensures Cloud Run sees the server is listening
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // Connect to database after server starts
    // This prevents Cloud Run timeout if DB connection is slow
    try {
        await connectDB();
    } catch (error) {
        console.error('Database connection error:', error.message);
        // Server continues running even if DB connection fails
        // Health check endpoint will reflect DB status
    }
})