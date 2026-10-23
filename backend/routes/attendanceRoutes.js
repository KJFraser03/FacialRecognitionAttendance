import express from 'express';
import Attendance from '../models/attendanceModel.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// --- CONFIGURATION FOR FILE UPLOAD ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the absolute path to the dataset folder
// We go up: routes -> backend -> dataset (Assuming 'dataset' is now inside 'backend' as requested)
// If you want it inside backend, the path is simply one level up from routes.
const datasetDir = path.join(__dirname, 'dataset');

// Ensure the main dataset directory exists immediately
try {
    if (!fs.existsSync(datasetDir)){
        fs.mkdirSync(datasetDir, { recursive: true });
        console.log(`Created dataset directory at: ${datasetDir}`);
    }
} catch (err) {
    console.error("Error creating dataset directory:", err);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const studentName = req.body.studentName;
        
        // Sanitize folder name (remove special characters)
        const safeName = studentName.trim().replace(/[^a-zA-Z0-9 ]/g, "");
        const studentDir = path.join(datasetDir, safeName);
        
        // Create student-specific folder if it doesn't exist
        if (!fs.existsSync(studentDir)){
            fs.mkdirSync(studentDir, { recursive: true });
        }
        cb(null, studentDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename: Name_Timestamp.jpg
        const uniqueSuffix = Date.now();
        const safeName = req.body.studentName.trim().replace(/[^a-zA-Z0-9]/g, "_");
        cb(null, `${safeName}_${uniqueSuffix}.jpg`);
    }
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// GET all records
router.get('/', async (req, res) => {
    try {
        const records = await Attendance.find({}).sort({ createdAt: -1 });
        res.json({ success: true, count: records.length, data: records });
    } catch (error) {
        console.error("Error fetching records:", error);
        res.status(500).json({ message: error.message });
    }
});

// POST new attendance (From Python Scanner)
router.post('/', async (req, res) => {
    const { name, status, date, time } = req.body;
    
    // Check for Duplicate (Same Person, Same Day)
    const existingRecord = await Attendance.findOne({ name: name, date: date });

    if (existingRecord) {
        return res.status(200).json({ message: 'Already logged today.' });
    }

    try {
        const newRecord = await Attendance.create({ name, status, date, time });
        res.status(201).json(newRecord);
    } catch (error) {
        console.error("Error saving attendance:", error);
        res.status(400).json({ message: error.message });
    }
});

// POST Register Student (From Website)
// Expects form-data: { studentName: "Kirby Laranjo", image: (file) }
router.post('/register', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    console.log(`Registered ${req.body.studentName} with photo: ${req.file.path}`);
    res.json({ message: `Successfully registered ${req.body.studentName}`, path: req.file.path });
});

export default router;