import mongoose from 'mongoose';

// Define User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  location: {
    type: String
  },
  skills: [{
    type: String
  }],
  profilePicture: {
    type: String
  },
  isBuyer: {
    type: Boolean,
    default: true
  },
  isSeller: {
    type: Boolean,
    default: false
  },
  isFreelancer: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'TND'
    },
    pendingWithdrawals: {
      type: Number,
      default: 0
    }
  },
  notifications: [{
    type: {
      type: String,
      enum: ['order', 'message', 'review', 'system']
    },
    title: String,
    message: String,
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    linkTo: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  }
});

// Create model
const User = mongoose.model('User', UserSchema);

export default User;
