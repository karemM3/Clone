import mongoose from 'mongoose';

const EscrowSchema = new mongoose.Schema({
  // Participants
  clientId: {
    type: String,
    required: true,
    index: true
  },
  freelancerId: {
    type: String,
    required: true,
    index: true
  },

  // Service details
  serviceId: {
    type: String,
    required: false
  },
  serviceName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },

  // Financial details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'TND'
  },
  platformFee: {
    type: Number,
    default: 0
  },

  // Transaction tracking
  paymentMethodId: {
    type: String,
    required: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },

  // Status tracking
  status: {
    type: String,
    enum: ['created', 'funded', 'in_progress', 'delivered', 'approved', 'disputed', 'refunded', 'released', 'cancelled'],
    default: 'created'
  },

  // Timeline events
  createdAt: {
    type: Date,
    default: Date.now
  },
  fundedAt: Date,
  startedAt: Date,
  deliveredAt: Date,
  approvedAt: Date,
  disputedAt: Date,
  resolvedAt: Date,

  // Delivery and approval
  deliveryMessage: String,
  deliveryFiles: [String],
  approvalRating: {
    type: Number,
    min: 1,
    max: 5
  },
  approvalFeedback: String,

  // Dispute handling
  disputeReason: String,
  disputeResolution: String,
  disputeResolvedBy: String, // Admin or system ID

  // Terms
  terms: {
    type: String
  },
  expiresAt: {
    type: Date
  }
});

// Indexes for common queries
EscrowSchema.index({ clientId: 1, status: 1 });
EscrowSchema.index({ freelancerId: 1, status: 1 });
EscrowSchema.index({ createdAt: -1 });
EscrowSchema.index({ status: 1 });

const Escrow = mongoose.model('Escrow', EscrowSchema);

export default Escrow;
