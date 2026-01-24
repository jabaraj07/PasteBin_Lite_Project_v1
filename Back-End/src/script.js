import express from 'express';
const app = express();
import dotenv from 'dotenv';
import apiRoute from './routes/apiRoute.js';
import viewRoute from './routes/viewRoute.js';
import cors from 'cors';
import connectDB from './config/db.js';

dotenv.config();
await connectDB();

app.use(cors());
app.use(express.json());



const PORT = process.env.PORT || 5000;

app.use('/api',apiRoute);
app.use('/', viewRoute);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})