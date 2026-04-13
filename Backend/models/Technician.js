import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const documentSchema = {
  url: String,
  uploadedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending_verification', 'verified', 'rejected'], 
    default: 'pending_verification' 
  }
}

const technicianSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required in Years'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  role:{
    type:String,
    default:'technician'
  },
  serviceAreas: [{
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    serviceRadius: { type: Number, default: 10 } // in kilometers
  }],
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    total: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  completedBookings: {
    type: Number,
    default: 0
  },
  cancelledBookings: {
    type: Number,
    default: 0
  },
  earnings: {
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    withdrawn: { type: Number, default: 0 }
  },
  bankDetails: {
    accountHolder: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
    ifscCode: { type: String },
    isVerified: { type: Boolean, default: false }
  },
  documents: {
  aadharCard: documentSchema,
  panCard: documentSchema,
  addressProof: documentSchema,
  policeVerification: documentSchema
},
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationRejectionReason: {
    type: String
  },
  verificationToken: {
    type: String,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
technicianSchema.index({ currentLocation: '2dsphere' });
technicianSchema.index({ 'serviceAreas.coordinates': '2dsphere' });

// Virtual for full name
technicianSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for completion rate
technicianSchema.virtual('completionRate').get(function() {
  if (this.totalBookings === 0) return 0;
  return ((this.completedBookings / this.totalBookings) * 100).toFixed(2);
});

// Hash password before saving
technicianSchema.pre('save', async function(next) {
  // 1. If not touched, skip
  if (!this.isModified('password')) return next();
  
  // 2. THE FIX: If the password already looks like a Bcrypt hash, 
  // it means it was already processed. DO NOT hash it again.
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
technicianSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update rating
technicianSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.total || 0;
  const currentCount = this.rating.count || 0;
  
  this.rating.total = currentTotal + newRating;
  this.rating.count = currentCount + 1;
  this.rating.average = this.rating.total / this.rating.count;
  
  return this.save();
};

// Generate verification token
technicianSchema.methods.generateVerificationToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.verificationToken = token;
  return token;
};

// Generate password reset token
technicianSchema.methods.generatePasswordResetToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

export default mongoose.model('Technician', technicianSchema);
