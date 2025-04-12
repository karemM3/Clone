import express from 'express';
import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Stripe configuration - left empty for security
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
let stripe;

// Initialize Stripe if the key is available
if (STRIPE_SECRET_KEY) {
  try {
    stripe = await import('stripe').then(Stripe => new Stripe.default(STRIPE_SECRET_KEY));
  } catch (error) {
    console.error('Error initializing Stripe:', error);
  }
}

// Mock data for development
const mockWallets = {
  'usr123': {
    userId: 'usr123',
    balance: 500,
    currency: 'TND',
    reservedBalance: 100,
    escrowReserves: [],
    paymentMethods: [
      {
        id: 'pm_1',
        type: 'credit_card',
        last4: '4242',
        expiryDate: '12/25',
        name: 'Visa',
        isDefault: true
      }
    ]
  }
};

// Middleware to check if MongoDB is connected
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1 && !req.useMockData) {
    req.useMockData = true;
  }
  next();
};

// Middleware to get user wallet
const getUserWallet = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (req.useMockData) {
      req.wallet = mockWallets[userId] || {
        userId,
        balance: 0,
        currency: 'TND',
        reservedBalance: 0,
        paymentMethods: []
      };
      return next();
    }

    // Try to find user wallet or create a new one
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      // Create a new wallet if none exists
      wallet = new Wallet({
        userId,
        balance: 0,
        currency: 'TND'
      });
      await wallet.save();
    }

    req.wallet = wallet;
    next();
  } catch (error) {
    console.error('Error retrieving wallet:', error);
    res.status(500).json({ error: 'Failed to retrieve wallet' });
  }
};

// Get user wallet
router.get('/wallet/:userId', checkMongoConnection, getUserWallet, (req, res) => {
  res.json(req.wallet);
});

// Add payment method
router.post('/wallet/:userId/payment-methods', checkMongoConnection, getUserWallet, async (req, res) => {
  try {
    const { type, cardNumber, expiryMonth, expiryYear, cvc, name, isDefault } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Payment method type is required' });
    }

    if (req.useMockData) {
      const newMethod = {
        id: 'pm_' + Math.random().toString(36).substring(2, 9),
        type,
        last4: type === 'credit_card' ? cardNumber?.slice(-4) || '0000' : undefined,
        expiryDate: type === 'credit_card' ? `${expiryMonth}/${expiryYear.slice(-2)}` : undefined,
        name: name || type,
        isDefault: isDefault || req.wallet.paymentMethods.length === 0
      };

      // Update existing methods if this one is default
      if (newMethod.isDefault) {
        req.wallet.paymentMethods.forEach(method => {
          method.isDefault = false;
        });
      }

      req.wallet.paymentMethods.push(newMethod);

      // Save to mock data
      mockWallets[req.params.userId] = req.wallet;

      return res.status(201).json(newMethod);
    }

    let stripePaymentMethodId;

    // Create payment method in Stripe if available
    if (stripe && type === 'credit_card' && cardNumber && expiryMonth && expiryYear && cvc) {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: expiryMonth,
          exp_year: expiryYear,
          cvc: cvc
        }
      });
      stripePaymentMethodId = paymentMethod.id;
    }

    const newMethod = {
      id: 'pm_' + new mongoose.Types.ObjectId().toString(),
      type,
      last4: type === 'credit_card' ? cardNumber?.slice(-4) : undefined,
      expiryDate: type === 'credit_card' ? `${expiryMonth}/${expiryYear.slice(-2)}` : undefined,
      name: name || type,
      isDefault: isDefault || req.wallet.paymentMethods.length === 0,
      stripePaymentMethodId
    };

    // Update existing methods if this one is default
    if (newMethod.isDefault) {
      req.wallet.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }

    req.wallet.paymentMethods.push(newMethod);
    await req.wallet.save();

    res.status(201).json(newMethod);
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

// Remove payment method
router.delete('/wallet/:userId/payment-methods/:methodId', checkMongoConnection, getUserWallet, async (req, res) => {
  try {
    const { methodId } = req.params;

    const methodIndex = req.wallet.paymentMethods.findIndex(m => m.id === methodId);

    if (methodIndex === -1) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    const isDefault = req.wallet.paymentMethods[methodIndex].isDefault;

    // Prevent removing the default method if it's the only one
    if (isDefault && req.wallet.paymentMethods.length === 1) {
      return res.status(400).json({ error: 'Cannot remove the only payment method' });
    }

    // If removing the default method, set another as default
    if (isDefault && req.wallet.paymentMethods.length > 1) {
      const newDefaultIndex = req.wallet.paymentMethods.findIndex(m => m.id !== methodId);
      req.wallet.paymentMethods[newDefaultIndex].isDefault = true;
    }

    req.wallet.paymentMethods.splice(methodIndex, 1);

    if (req.useMockData) {
      mockWallets[req.params.userId] = req.wallet;
      return res.json({ success: true });
    }

    await req.wallet.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: 'Failed to remove payment method' });
  }
});

// Set default payment method
router.put('/wallet/:userId/payment-methods/:methodId/default', checkMongoConnection, getUserWallet, async (req, res) => {
  try {
    const { methodId } = req.params;

    const methodExists = req.wallet.paymentMethods.some(m => m.id === methodId);

    if (!methodExists) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    req.wallet.paymentMethods.forEach(method => {
      method.isDefault = method.id === methodId;
    });

    if (req.useMockData) {
      mockWallets[req.params.userId] = req.wallet;
      return res.json({ success: true });
    }

    await req.wallet.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ error: 'Failed to set default payment method' });
  }
});

// Deposit funds
router.post('/wallet/:userId/deposit', checkMongoConnection, getUserWallet, async (req, res) => {
  try {
    const { amount, paymentMethodId, currency = 'TND' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }

    const paymentMethod = req.wallet.paymentMethods.find(m => m.id === paymentMethodId);

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    // Process the payment through Stripe if available and it's a credit card
    if (stripe && paymentMethod.type === 'credit_card' && paymentMethod.stripePaymentMethodId) {
      try {
        // In a real implementation, you would create a PaymentIntent or charge
        // This is a placeholder for where that code would go
        console.log('Would process Stripe payment here');
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return res.status(400).json({ error: 'Payment processing failed', details: stripeError.message });
      }
    }

    // Create transaction record
    let transaction;

    if (req.useMockData) {
      transaction = {
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        userId: req.params.userId,
        amount,
        currency,
        status: 'completed',
        paymentMethodId,
        timestamp: new Date().toISOString(),
        type: 'deposit',
        description: 'Wallet deposit'
      };

      // Update mock wallet balance
      req.wallet.balance += amount;
      mockWallets[req.params.userId] = req.wallet;
    } else {
      transaction = new Transaction({
        userId: req.params.userId,
        amount,
        currency,
        status: 'completed',
        paymentMethodId,
        type: 'deposit',
        description: 'Wallet deposit'
      });

      await transaction.save();

      // Update wallet balance
      req.wallet.balance += amount;
      if (!req.wallet.transactionIds) {
        req.wallet.transactionIds = [];
      }
      req.wallet.transactionIds.push(transaction._id);
      await req.wallet.save();
    }

    res.status(201).json({
      success: true,
      transaction,
      newBalance: req.wallet.balance
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// Withdraw funds
router.post('/wallet/:userId/withdraw', checkMongoConnection, getUserWallet, async (req, res) => {
  try {
    const { amount, paymentMethodId, currency = 'TND' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }

    // Check if user has sufficient funds
    const availableBalance = req.wallet.balance - (req.wallet.reservedBalance || 0);

    if (amount > availableBalance) {
      return res.status(400).json({
        error: 'Insufficient funds',
        availableBalance,
        requested: amount
      });
    }

    const paymentMethod = req.wallet.paymentMethods.find(m => m.id === paymentMethodId);

    if (!paymentMethod) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    // In a real application, you would process the payout through Stripe or another provider

    // Create transaction record
    let transaction;

    if (req.useMockData) {
      transaction = {
        id: 'tx_' + Math.random().toString(36).substring(2, 9),
        userId: req.params.userId,
        amount: -amount, // Negative amount for withdrawals
        currency,
        status: 'completed',
        paymentMethodId,
        timestamp: new Date().toISOString(),
        type: 'withdrawal',
        description: 'Wallet withdrawal'
      };

      // Update mock wallet balance
      req.wallet.balance -= amount;
      mockWallets[req.params.userId] = req.wallet;
    } else {
      transaction = new Transaction({
        userId: req.params.userId,
        amount: -amount, // Negative amount for withdrawals
        currency,
        status: 'completed',
        paymentMethodId,
        type: 'withdrawal',
        description: 'Wallet withdrawal'
      });

      await transaction.save();

      // Update wallet balance
      req.wallet.balance -= amount;
      if (!req.wallet.transactionIds) {
        req.wallet.transactionIds = [];
      }
      req.wallet.transactionIds.push(transaction._id);
      await req.wallet.save();
    }

    res.status(201).json({
      success: true,
      transaction,
      newBalance: req.wallet.balance
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Get transaction history
router.get('/wallet/:userId/transactions', checkMongoConnection, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, page = 1, limit = 10 } = req.query;

    if (req.useMockData) {
      // Generate some mock transactions
      const mockTransactions = Array.from({ length: 5 }, (_, i) => ({
        id: `tx_mock_${i}`,
        userId,
        amount: (i % 2 === 0 ? 100 : -50) * (i + 1),
        currency: 'TND',
        status: 'completed',
        paymentMethodId: 'pm_1',
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        type: i % 2 === 0 ? 'deposit' : 'withdrawal',
        description: i % 2 === 0 ? 'Wallet deposit' : 'Wallet withdrawal'
      }));

      return res.json({
        transactions: mockTransactions,
        pagination: {
          page: 1,
          limit,
          total: mockTransactions.length,
          pages: 1
        }
      });
    }

    // Build query
    const query = { userId };
    if (type) {
      query.type = type;
    }

    // Count total documents
    const total = await Transaction.countDocuments(query);

    // Calculate pagination
    const skip = (page - 1) * limit;
    const pages = Math.ceil(total / limit);

    // Fetch transactions
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
