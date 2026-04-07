import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'PAY' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: [true, 'Technician is required']
  },
  amount: {
    total: { type: Number, required: true, min: 0 },
    adminShare: { type: Number, required: true, min: 0 },
    technicianShare: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' }
  },
  razorpay: {
    orderId: { type: String, required: true },
    paymentId: { type: String },
    signature: { type: String },
    notes: { type: Map, of: String }
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'created'
  },
  method: {
    type: String,
    enum: ['card', 'netbanking', 'upi', 'wallet', 'emi'],
    required: true
  },
  bank: {
    name: { type: String },
    transactionId: { type: String },
    referenceNumber: { type: String }
  },
  refunds: [{
    refundId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String },
    status: { type: String, enum: ['processed', 'pending', 'failed'], default: 'pending' },
    processedAt: { type: Date },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'refundInitiatorModel'
    }
  }],
  refundInitiatorModel: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'Admin'
  },
  splitPayments: [{
    recipient: {
      type: String,
      enum: ['admin', 'technician'],
      required: true
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    transactionId: { type: String },
    processedAt: { type: Date },
    failureReason: { type: String }
  }],
  webhookEvents: [{
    eventType: { type: String, required: true },
    eventData: { type: mongoose.Schema.Types.Mixed, required: true },
    processedAt: { type: Date, default: Date.now }
  }],
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    source: { type: String, default: 'web' }
  },
  failureReason: { type: String },
  failureCode: { type: String },
  paidAt: { type: Date },
  refundedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ technician: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'razorpay.orderId': 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });

// Virtual for refund amount
paymentSchema.virtual('totalRefunded').get(function() {
  return this.refunds.reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for net amount
paymentSchema.virtual('netAmount').get(function() {
  return this.amount.total - this.totalRefunded;
});

// Pre-save middleware to calculate shares
paymentSchema.pre('save', function(next) {
  if (this.isModified('amount.total')) {
    this.amount.adminShare = Math.round(this.amount.total * 0.30 * 100) / 100; // 30%
    this.amount.technicianShare = Math.round(this.amount.total * 0.70 * 100) / 100; // 70%
  }
  
  next();
});

// Pre-save middleware to initialize split payments
paymentSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'paid') {
    this.splitPayments = [
      {
        recipient: 'admin',
        amount: this.amount.adminShare,
        status: 'pending'
      },
      {
        recipient: 'technician',
        amount: this.amount.technicianShare,
        status: 'pending'
      }
    ];
  }
  
  next();
});

export default mongoose.model('Payment', paymentSchema);
