import mongoose from 'mongoose';

// Define Job Schema
const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TND'
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String
  },
  skills: [{
    type: String
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  deadline: {
    type: Date
  },
  location: {
    type: String
  },
  remote: {
    type: Boolean,
    default: true
  },
  clientId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  applicants: [{
    userId: String,
    proposal: String,
    bidAmount: Number,
    bidCurrency: {
      type: String,
      default: 'TND'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
JobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create model
const Job = mongoose.model('Job', JobSchema);

export default Job;
