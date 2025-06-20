import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['shopkeeper', 'supervisor', 'operator'],
    required: true
  },
  shopName: {
    type: String,
    required: function() { return this.role === 'shopkeeper'; }
  },
  companyName: {
    type: String,
    required: function() { return this.role === 'supervisor' || this.role === 'operator'; }
  },
  supervisorEmail: {
    type: String,
    required: function() { return this.role === 'operator'; },
    validate: {
      validator: async function(email) {
        if (this.role !== 'operator') return true;
        const supervisor = await mongoose.model('User').findOne({ 
          email: email, 
          role: 'supervisor',
          companyName: this.companyName 
        });
        return !!supervisor;
      },
      message: 'Supervisor with this email not found in the company'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);