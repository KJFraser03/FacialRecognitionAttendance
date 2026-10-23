import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

// Load config
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
    res.send('Facial Recognition Attendance System Backend is Running...');
});

app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
});