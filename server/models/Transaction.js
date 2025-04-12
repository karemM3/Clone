import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  serviceId: {
    type: String,
    required: false
  },
  serviceName: {
    type: String,
    required: false
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'TND'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethodId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  orderId: {
    type: String
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'payment', 'refund', 'escrow'],
    required: true
  },
  description: {
    type: String
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Escrow', 'Service', 'Order']
  }
});

// Virtual field for deep population
TransactionSchema.virtual('referenceDetails', {
  refPath: 'referenceModel',
  localField: 'reference',
  foreignField: '_id',
  justOne: true
});

// Add timestamps (createdAt, updatedAt)
TransactionSchema.set('timestamps', true);

// Add indexes for common queries
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ timestamp: -1 });

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
