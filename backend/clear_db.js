import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './models/attendanceModel.js'; 

dotenv.config({ path: './backend/.env' });

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        
        await Attendance.deleteMany({});
        console.log('Data Destroyed!');
        
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

clearData();