import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true, // "Present" or "Late"
        default: 'Present'
    },
    date: {
        type: String,
        required: true // Format: YYYY-MM-DD
    },
    time: {
        type: String,
        required: true // Format: HH:MM AM/PM
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;