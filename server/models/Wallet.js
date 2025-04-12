import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'TND'
  },
  reservedBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  escrowReserves: [{
    escrowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escrow'
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  paymentMethods: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer'],
      required: true
    },
    last4: String,
    expiryDate: String,
    name: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    stripePaymentMethodId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  transactionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
});

// Add timestamps (createdAt, updatedAt)
WalletSchema.set('timestamps', true);

// Method to recalculate reserved balance from escrow reserves
WalletSchema.methods.recalculateReservedBalance = function() {
  this.reservedBalance = this.escrowReserves.reduce((total, reserve) => total + reserve.amount, 0);
  return this.reservedBalance;
};

// Method to get available balance (total - reserved)
WalletSchema.methods.getAvailableBalance = function() {
  return this.balance - this.reservedBalance;
};

// Pre-save hook to ensure reserved balance is accurate
WalletSchema.pre('save', function(next) {
  if (this.escrowReserves && this.escrowReserves.length > 0) {
    this.recalculateReservedBalance();
  }
  this.lastUpdated = new Date();
  next();
});

const Wallet = mongoose.model('Wallet', WalletSchema);

export default Wallet;
