import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attendance from './models/attendanceModel.js'; // Path changed

dotenv.config(); // Path changed, it will find .env in the same folder

// ... rest of the code remains exactly the same ...
const targetName = process.argv[2]; 

if (!targetName) {
    console.log("Please provide a name to reset. Example: node reset_student.js 'Ken'");
    process.exit();
}

const resetStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- CONNECTED TO DATABASE ---');
        
        const result = await Attendance.deleteMany({ 
            name: { $regex: targetName, $options: 'i' } 
        });

        if (result.deletedCount > 0) {
            console.log(`✅ SUCCESS: Deleted ${result.deletedCount} records for '${targetName}'.`);
            console.log(`System is now ready to re-scan ${targetName}.`);
        } else {
            console.log(`❌ No records found for '${targetName}'.`);
        }
        
        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

resetStudent();