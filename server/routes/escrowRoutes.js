import express from 'express';
import mongoose from 'mongoose';
import Escrow from '../models/Escrow.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';

const router = express.Router();

// Mock data for development
const mockEscrows = [];
const mockUsers = {
  'client1': { id: 'client1', role: 'client', name: 'Client One' },
  'freelancer1': { id: 'freelancer1', role: 'freelancer', name: 'Freelancer One' }
};

// Middleware to check if MongoDB is connected
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && !req.useMockData) {
    req.useMockData = true;
  }
  next();
};

// Helper to get wallet (mock or real)
const getWallet = async (userId, useMockData) => {
  if (useMockData) {
    return {
      userId,
      balance: 1000, // Default mock balance
      currency: 'TND',
      reservedBalance: 0,
      escrowReserves: []
    };
  }

  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = new Wallet({
      userId,
      balance: 0,
      currency: 'TND'
    });
    await wallet.save();
  }

  return wallet;
};

// Create a new escrow
router.post('/', checkMongoConnection, async (req, res) => {
  try {
    const {
      clientId,
      freelancerId,
      serviceId,
      serviceName,
      description,
      amount,
      currency = 'TND',
      paymentMethodId,
      terms
    } = req.body;

    // Validate required fields
    if (!clientId || !freelancerId || !serviceName || !description || !amount || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    // Verify client has sufficient funds
    const clientWallet = await getWallet(clientId, req.useMockData);
    const availableBalance = clientWallet.balance - (clientWallet.reservedBalance || 0);

    if (amount > availableBalance) {
      return res.status(400).json({
        error: 'Insufficient funds',
        availableBalance,
        requested: amount
      });
    }

    const platformFee = amount * 0.05; // 5% platform fee
    const totalAmount = amount + platformFee;

    // Check against total amount including fee
    if (totalAmount > availableBalance) {
      return res.status(400).json({
        error: 'Insufficient funds to cover amount plus platform fee',
        availableBalance,
        requested: totalAmount,
        platformFee
      });
    }

    let escrow, transaction;

    if (req.useMockData) {
      // Create mock escrow
      escrow = {
        id: 'escrow_' + Math.random().toString(36).substring(2, 9),
        clientId,
        freelancerId,
        serviceId,
        serviceName,
        description,
        amount,
        platformFee,
        currency,
        paymentMethodId,
        status: 'created',
        createdAt: new Date().toISOString(),
        terms
      };

      // Create mock transaction
      transaction = {
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        userId: clientId,
        amount: -totalAmount, // negative amount for client
        currency,
        status: 'completed',
        paymentMethodId,
        timestamp: new Date().toISOString(),
        type: 'escrow',
        description: `Escrow payment for ${serviceName}`,
        reference: escrow.id,
        referenceModel: 'Escrow'
      };

      // Update mock client wallet - reserve the funds
      clientWallet.balance -= totalAmount;
      clientWallet.reservedBalance = (clientWallet.reservedBalance || 0) + amount;
      if (!clientWallet.escrowReserves) clientWallet.escrowReserves = [];
      clientWallet.escrowReserves.push({
        escrowId: escrow.id,
        amount
      });

      // Add to mock data
      mockEscrows.push(escrow);

      // Update escrow status
      escrow.status = 'funded';
      escrow.fundedAt = new Date().toISOString();
    } else {
      // Create real escrow in MongoDB
      escrow = new Escrow({
        clientId,
        freelancerId,
        serviceId,
        serviceName,
        description,
        amount,
        platformFee,
        currency,
        paymentMethodId,
        terms
      });

      // Create transaction
      transaction = new Transaction({
        userId: clientId,
        amount: -totalAmount,
        currency,
        status: 'completed',
        paymentMethodId,
        type: 'escrow',
        description: `Escrow payment for ${serviceName}`,
        reference: escrow._id,
        referenceModel: 'Escrow'
      });

      // Save both records and update the escrow with the transaction ID
      await transaction.save();
      escrow.transactionId = transaction._id;
      escrow.status = 'funded';
      escrow.fundedAt = new Date();
      await escrow.save();

      // Update client wallet - reserve the funds
      clientWallet.balance -= totalAmount;
      clientWallet.reservedBalance = (clientWallet.reservedBalance || 0) + amount;
      if (!clientWallet.escrowReserves) clientWallet.escrowReserves = [];
      clientWallet.escrowReserves.push({
        escrowId: escrow._id,
        amount
      });
      if (!clientWallet.transactionIds) clientWallet.transactionIds = [];
      clientWallet.transactionIds.push(transaction._id);
      await clientWallet.save();
    }

    res.status(201).json({
      success: true,
      escrow,
      transaction,
      platformFee,
      totalAmount
    });
  } catch (error) {
    console.error('Error creating escrow:', error);
    res.status(500).json({ error: 'Failed to create escrow' });
  }
});

// Get escrow by ID
router.get('/:escrowId', checkMongoConnection, async (req, res) => {
  try {
    const { escrowId } = req.params;

    if (req.useMockData) {
      const escrow = mockEscrows.find(e => e.id === escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }
      return res.json(escrow);
    }

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    res.json(escrow);
  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(500).json({ error: 'Failed to fetch escrow' });
  }
});

// List escrows for a user (client or freelancer)
router.get('/user/:userId', checkMongoConnection, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Build query based on user role
    let query = {};
    if (role === 'client') {
      query.clientId = userId;
    } else if (role === 'freelancer') {
      query.freelancerId = userId;
    } else {
      // If no role specified, search in both fields
      query = { $or: [{ clientId: userId }, { freelancerId: userId }] };
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    if (req.useMockData) {
      // Filter mock escrows
      let escrows = mockEscrows.filter(e => {
        if (role === 'client') return e.clientId === userId;
        if (role === 'freelancer') return e.freelancerId === userId;
        return e.clientId === userId || e.freelancerId === userId;
      });

      // Apply status filter
      if (status) {
        escrows = escrows.filter(e => e.status === status);
      }

      return res.json({
        escrows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: escrows.length,
          pages: Math.ceil(escrows.length / parseInt(limit))
        }
      });
    }

    // Count total documents
    const total = await Escrow.countDocuments(query);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pages = Math.ceil(total / parseInt(limit));

    // Fetch escrows
    const escrows = await Escrow.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    res.json({
      escrows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Error listing escrows:', error);
    res.status(500).json({ error: 'Failed to list escrows' });
  }
});

// Mark escrow as started (freelancer accepts the work)
router.post('/:escrowId/start', checkMongoConnection, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { freelancerId } = req.body;

    if (!freelancerId) {
      return res.status(400).json({ error: 'Freelancer ID is required' });
    }

    let escrow;

    if (req.useMockData) {
      escrow = mockEscrows.find(e => e.id === escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      if (escrow.freelancerId !== freelancerId) {
        return res.status(403).json({ error: 'Not authorized to start this escrow' });
      }

      if (escrow.status !== 'funded') {
        return res.status(400).json({
          error: 'Escrow cannot be started',
          status: escrow.status,
          requiredStatus: 'funded'
        });
      }

      escrow.status = 'in_progress';
      escrow.startedAt = new Date().toISOString();
    } else {
      escrow = await Escrow.findById(escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      if (escrow.freelancerId !== freelancerId) {
        return res.status(403).json({ error: 'Not authorized to start this escrow' });
      }

      if (escrow.status !== 'funded') {
        return res.status(400).json({
          error: 'Escrow cannot be started',
          status: escrow.status,
          requiredStatus: 'funded'
        });
      }

      escrow.status = 'in_progress';
      escrow.startedAt = new Date();
      await escrow.save();
    }

    res.json({
      success: true,
      escrow
    });
  } catch (error) {
    console.error('Error starting escrow:', error);
    res.status(500).json({ error: 'Failed to start escrow' });
  }
});

// Deliver work for an escrow
router.post('/:escrowId/deliver', checkMongoConnection, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { freelancerId, deliveryMessage, deliveryFiles } = req.body;

    if (!freelancerId || !deliveryMessage) {
      return res.status(400).json({ error: 'Freelancer ID and delivery message are required' });
    }

    let escrow;

    if (req.useMockData) {
      escrow = mockEscrows.find(e => e.id === escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      if (escrow.freelancerId !== freelancerId) {
        return res.status(403).json({ error: 'Not authorized to deliver for this escrow' });
      }

      if (escrow.status !== 'in_progress') {
        return res.status(400).json({
          error: 'Escrow is not in progress',
          status: escrow.status,
          requiredStatus: 'in_progress'
        });
      }

      escrow.status = 'delivered';
      escrow.deliveredAt = new Date().toISOString();
      escrow.deliveryMessage = deliveryMessage;
      if (deliveryFiles) escrow.deliveryFiles = deliveryFiles;
    } else {
      escrow = await Escrow.findById(escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      if (escrow.freelancerId !== freelancerId) {
        return res.status(403).json({ error: 'Not authorized to deliver for this escrow' });
      }

      if (escrow.status !== 'in_progress') {
        return res.status(400).json({
          error: 'Escrow is not in progress',
          status: escrow.status,
          requiredStatus: 'in_progress'
        });
      }

      escrow.status = 'delivered';
      escrow.deliveredAt = new Date();
      escrow.deliveryMessage = deliveryMessage;
      if (deliveryFiles) escrow.deliveryFiles = deliveryFiles;
      await escrow.save();
    }

    res.json({
      success: true,
      escrow
    });
  } catch (error) {
    console.error('Error delivering escrow work:', error);
    res.status(500).json({ error: 'Failed to deliver escrow work' });
  }
});

// Approve work and release payment
router.post('/:escrowId/approve', checkMongoConnection, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { clientId, rating, feedback } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    let escrow, clientWallet, freelancerWallet;

    if (req.useMockData) {
      escrow = mockEscrows.find(e => e.id === escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      if (escrow.clientId !== clientId) {
        return res.status(403).json({ error: 'Not authorized to approve this escrow' });
      }

      if (escrow.status !== 'delivered') {
        return res.status(400).json({
          error: 'Escrow is not in delivered status',
          status: escrow.status,
          requiredStatus: 'delivered'
        });
      }

      // Get wallets
      clientWallet = await getWallet(escrow.clientId, true);
      freelancerWallet = await getWallet(escrow.freelancerId, true);

      // Update escrow status
      escrow.status = 'approved';
      escrow.approvedAt = new Date().toISOString();
      if (rating) escrow.approvalRating = rating;
      if (feedback) escrow.approvalFeedback = feedback;

      // Remove escrow reserve from client wallet
      clientWallet.escrowReserves = (clientWallet.escrowReserves || []).filter(
        reserve => reserve.escrowId !== escrow.id
      );
      clientWallet.reservedBalance = (clientWallet.reservedBalance || 0) - escrow.amount;

      // Add funds to freelancer wallet
      freelancerWallet.balance = (freelancerWallet.balance || 0) + escrow.amount;

      // Create transaction for payment to freelancer
      const transaction = {
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        userId: escrow.freelancerId,
        amount: escrow.amount,
        currency: escrow.currency,
        status: 'completed',
        paymentMethodId: 'system_transfer',
        timestamp: new Date().toISOString(),
        type: 'payment',
        description: `Payment for completed work: ${escrow.serviceName}`,
        reference: escrow.id,
        referenceModel: 'Escrow'
      };
    } else {
      escrow = await Escrow.findById(escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      if (escrow.clientId !== clientId) {
        return res.status(403).json({ error: 'Not authorized to approve this escrow' });
      }

      if (escrow.status !== 'delivered') {
        return res.status(400).json({
          error: 'Escrow is not in delivered status',
          status: escrow.status,
          requiredStatus: 'delivered'
        });
      }

      // Start a session for the transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Get wallets
        clientWallet = await Wallet.findOne({ userId: escrow.clientId }).session(session);
        freelancerWallet = await Wallet.findOne({ userId: escrow.freelancerId }).session(session);

        if (!freelancerWallet) {
          freelancerWallet = new Wallet({
            userId: escrow.freelancerId,
            balance: 0,
            currency: escrow.currency
          });
        }

        // Update escrow status
        escrow.status = 'approved';
        escrow.approvedAt = new Date();
        if (rating) escrow.approvalRating = rating;
        if (feedback) escrow.approvalFeedback = feedback;

        // Remove escrow reserve from client wallet
        const reserveIndex = clientWallet.escrowReserves.findIndex(
          reserve => reserve.escrowId.toString() === escrowId
        );

        if (reserveIndex !== -1) {
          clientWallet.escrowReserves.splice(reserveIndex, 1);
          clientWallet.recalculateReservedBalance();
        }

        // Add funds to freelancer wallet
        freelancerWallet.balance += escrow.amount;

        // Create transaction for payment to freelancer
        const transaction = new Transaction({
          userId: escrow.freelancerId,
          amount: escrow.amount,
          currency: escrow.currency,
          status: 'completed',
          paymentMethodId: 'system_transfer',
          type: 'payment',
          description: `Payment for completed work: ${escrow.serviceName}`,
          reference: escrow._id,
          referenceModel: 'Escrow'
        });

        // Save all updates
        await transaction.save({ session });
        await escrow.save({ session });
        await clientWallet.save({ session });
        await freelancerWallet.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.json({
          success: true,
          escrow,
          transaction
        });
      } catch (transactionError) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();
        throw transactionError;
      }
    }

    if (req.useMockData) {
      res.json({
        success: true,
        escrow
      });
    }
  } catch (error) {
    console.error('Error approving escrow:', error);
    res.status(500).json({ error: 'Failed to approve escrow' });
  }
});

// Reject work
router.post('/:escrowId/reject', checkMongoConnection, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { clientId, reason } = req.body;

    if (!clientId || !reason) {
      return res.status(400).json({ error: 'Client ID and rejection reason are required' });
    }

    let escrow;

    if (req.useMockData) {
      escrow = mockEscrows.find(e => e.id === escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      if (escrow.clientId !== clientId) {
        return res.status(403).json({ error: 'Not authorized to reject this escrow' });
      }

      if (escrow.status !== 'delivered') {
        return res.status(400).json({
          error: 'Escrow is not in delivered status',
          status: escrow.status,
          requiredStatus: 'delivered'
        });
      }

      // Update escrow status
      escrow.status = 'disputed';
      escrow.disputedAt = new Date().toISOString();
      escrow.disputeReason = reason;
    } else {
      escrow = await Escrow.findById(escrowId);
      if (!escrow) {
        return res.status(404).json({ error: 'Escrow not found' });
      }

      if (escrow.clientId !== clientId) {
        return res.status(403).json({ error: 'Not authorized to reject this escrow' });
      }

      if (escrow.status !== 'delivered') {
        return res.status(400).json({
          error: 'Escrow is not in delivered status',
          status: escrow.status,
          requiredStatus: 'delivered'
        });
      }

      // Update escrow status
      escrow.status = 'disputed';
      escrow.disputedAt = new Date();
      escrow.disputeReason = reason;
      await escrow.save();
    }

    res.json({
      success: true,
      escrow
    });
  } catch (error) {
    console.error('Error rejecting escrow:', error);
    res.status(500).json({ error: 'Failed to reject escrow' });
  }
});

export default router;
