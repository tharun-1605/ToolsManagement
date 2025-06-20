import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  lifeLimit: {
    type: Number,
    required: true,
    min: 1
  },
  remainingLife: {
    type: Number,
    required: true
  },
  thresholdLimit: {
    type: Number,
    required: true,
    min: 1
  },
  shopName: {
    type: String,
    required: true
  },
  shopkeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'retired'],
    default: 'available'
  },
  currentUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usageStartTime: {
    type: Date,
    default: null
  },
  totalUsageHours: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  // Track which companies have ordered this tool
  orderedByCompanies: [{
    companyName: String,
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    orderedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Tool', toolSchema);