import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configuration
dotenv.config();
const app = express();
// Use environment PORT variable or fallback to 5001
const PORT = process.env.PORT || 5001;
console.log(`Using PORT: ${PORT}`);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, DOC, DOCX, and TXT files are allowed.'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make uploads directory accessible
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workit';
let isMongoConnected = false;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log(`Connection string: ${MONGODB_URI}`);
    isMongoConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing with mock data for development...');
  });

// Mock data middleware for development when MongoDB is not available
app.use((req, res, next) => {
  // Only use mock data if MongoDB is not connected
  if (!isMongoConnected && process.env.NODE_ENV === 'development') {
    req.useMockData = true;
  }
  next();
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/jobs', jobRoutes);

// MongoDB Connection Status endpoint
app.get('/api/dbstatus', (req, res) => {
  res.json({
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'none',
    name: mongoose.connection.name || 'none',
    useMockData: !isMongoConnected
  });
});

// Root route for testing
app.get('/api', (req, res) => {
  res.json({
    message: 'WorkiT API is running',
    mongoStatus: isMongoConnected ? 'connected' : 'using mock data'
  });
});

// Catch-all route for client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
