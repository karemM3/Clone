import express from 'express';
import serverless from 'serverless-http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import serviceRoutes from '../../server/routes/serviceRoutes.js';
import userRoutes from '../../server/routes/userRoutes.js';
import messageRoutes from '../../server/routes/messageRoutes.js';
import jobRoutes from '../../server/routes/jobRoutes.js';

// Configuration
dotenv.config();
const app = express();

// Initialize CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup for Netlify Functions environment
// For Netlify Functions, we'll use memory storage for multer
const storage = multer.memoryStorage();
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

// Make the upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workit';
let isMongoConnected = false;

// Try to connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    isMongoConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing with mock data for serverless function...');
  });

// Mock data middleware for when MongoDB is not available
app.use((req, res, next) => {
  if (!isMongoConnected) {
    req.useMockData = true;
  }
  next();
});

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
    message: 'WorkiT API is running in serverless mode',
    mongoStatus: isMongoConnected ? 'connected' : 'using mock data',
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'An unexpected error occurred'
  });
});

// Export the serverless function
export const handler = serverless(app);
