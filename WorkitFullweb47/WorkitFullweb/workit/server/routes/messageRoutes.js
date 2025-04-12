import express from 'express';
import { Message, Conversation } from '../models/Message.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '../uploads/messages');
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

// Mock data (used when MongoDB is not connected)
const mockConversations = [];
const mockMessages = [];

// Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.useMockData) {
      return res.json(mockConversations.filter(conv =>
        conv.participants.includes(userId)
      ));
    }

    const conversations = await Conversation.find({
      participants: userId
    }).sort({ lastActivity: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (req.useMockData) {
      return res.json(mockMessages.filter(msg =>
        msg.conversationId === conversationId
      ));
    }

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { participants, title } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({ message: 'At least two participants are required' });
    }

    if (req.useMockData) {
      const newConversation = {
        id: 'conv_' + Math.random().toString(36).substring(2, 9),
        participants,
        title,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      mockConversations.push(newConversation);
      return res.status(201).json(newConversation);
    }

    // Check if a conversation already exists between these participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length }
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    const newConversation = new Conversation({
      participants,
      title
    });

    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message with file attachment support
router.post('/conversations/:conversationId/messages', upload.array('attachments', 5), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, senderId, receiverId } = req.body;

    if (!content || !senderId || !receiverId) {
      return res.status(400).json({ message: 'Content, senderId, and receiverId are required' });
    }

    // Process file attachments if any
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/messages/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    if (req.useMockData) {
      const newMessage = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        conversationId,
        senderId,
        receiverId,
        content,
        attachments,
        isRead: false,
        timestamp: new Date().toISOString()
      };
      mockMessages.push(newMessage);

      // Update mock conversation with last activity
      const conversationIndex = mockConversations.findIndex(c => c.id === conversationId);
      if (conversationIndex !== -1) {
        mockConversations[conversationIndex].lastActivity = new Date().toISOString();
      }

      return res.status(201).json(newMessage);
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const newMessage = new Message({
      conversationId,
      senderId,
      receiverId,
      content,
      attachments,
      isRead: false
    });

    await newMessage.save();

    // Update conversation's lastActivity timestamp
    conversation.lastActivity = Date.now();
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (req.useMockData) {
      const updatedMessages = mockMessages.map(msg => {
        if (msg.conversationId === conversationId && msg.receiverId === userId) {
          return { ...msg, isRead: true };
        }
        return msg;
      });
      mockMessages.length = 0;
      mockMessages.push(...updatedMessages);
      return res.json({ success: true });
    }

    await Message.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread messages count for a user
router.get('/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.useMockData) {
      const count = mockMessages.filter(
        msg => msg.receiverId === userId && !msg.isRead
      ).length;
      return res.json({ count });
    }

    const count = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
