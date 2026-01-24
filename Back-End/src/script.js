import express from 'express';
const app = express();
import dotenv from 'dotenv';
import apiRoute from './routes/apiRoute.js';
import viewRoute from './routes/viewRoute.js';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();
await connectDB();

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

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})