import mongoose from 'mongoose';

// Define Service Schema
const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String
  },
  sellerId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TND'
  },
  deliveryTime: {
    type: Number, // In days
    required: true
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  packages: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    deliveryTime: {
      type: Number, // In days
      required: true
    },
    features: [{
      type: String
    }]
  }],
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: [{
    userId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'suspended'],
    default: 'active'
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
ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create model
const Service = mongoose.model('Service', ServiceSchema);

export default Service;
