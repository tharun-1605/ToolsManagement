import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopkeeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  approvedAt: Date,
  fulfilledAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);