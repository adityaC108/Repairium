import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
  },
  appliance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appliance',
    required: [true, 'Appliance is required']
  },
  serviceType: {
    type: String,
    enum: ['regular', 'emergency'],
    default: 'regular'
  },
  issueDescription: {
    type: String,
    required: [true, 'Issue description is required'],
    maxlength: [1000, 'Issue description cannot exceed 1000 characters']
  },
  serviceAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    }
  },
  preferredDate: {
    type: Date,
    required: [true, 'Preferred date is required']
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required'],
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Please provide time in HH:MM format'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedCost: {
    basePrice: { type: Number, required: true, min: 0 },
    serviceCharge: { type: Number, required: true, min: 0 },
    emergencyCharge: { type: Number, default: 0, min: 0 },
    sparePartsCost: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  actualCost: {
    basePrice: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    emergencyCharge: { type: Number, default: 0, min: 0 },
    sparePartsCost: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    amount: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    paymentId: { type: String },
    paymentMethod: { type: String },
    paymentDate: { type: Date }
  },
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'timelineModel'
    }
  }],
  timelineModel: {
    type: String,
    enum: ['User', 'Technician', 'Admin'],
    default: 'User'
  },
  technicianNotes: {
    type: String,
    maxlength: [1000, 'Technician notes cannot exceed 1000 characters']
  },
  userNotes: {
    type: String,
    maxlength: [1000, 'User notes cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    description: { type: String },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'imageUploaderModel'
    },
    uploadedAt: { type: Date, default: Date.now }
  }],
  imageUploaderModel: {
    type: String,
    enum: ['User', 'Technician'],
    default: 'User'
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    review: { type: String, maxlength: 500 },
    ratedAt: { type: Date }
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'cancellationModel'
  },
  cancellationModel: {
    type: String,
    enum: ['User', 'Technician', 'Admin'],
    default: 'User'
  },
  rescheduledCount: {
    type: Number,
    default: 0,
    min: 0
  },
  assignedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
bookingSchema.index({ 'serviceAddress.coordinates': '2dsphere' });

// Compound indexes
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ technician: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ preferredDate: 1, status: 1 });

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  if (this.startedAt && this.completedAt) {
    return this.completedAt - this.startedAt;
  }
  return null;
});

// Virtual for isOverdue
bookingSchema.virtual('isOverdue').get(function() {
  if (this.status === 'confirmed' || this.status === 'assigned') {
    return new Date() > new Date(this.preferredDate);
  }
  return false;
});

// Pre-save middleware to update timeline
bookingSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
    
    // Update timestamps based on status
    switch (this.status) {
      case 'assigned':
        this.assignedAt = new Date();
        break;
      case 'in_progress':
        this.startedAt = new Date();
        break;
      case 'completed':
        this.completedAt = new Date();
        break;
      case 'cancelled':
        this.cancelledAt = new Date();
        break;
    }
  }
  
  next();
});

export default mongoose.model('Booking', bookingSchema);
